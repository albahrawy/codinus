import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { CdkOverlayOrigin, ViewportRuler } from '@angular/cdk/overlay';
import {
    booleanAttribute, computed, Directive, effect,
    ElementRef, HostAttributeToken, inject, input, Input, numberAttribute, output, signal, viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_FORM_FIELD } from '@angular/material/form-field';
import { toNumber } from '@codinus/js-extensions';
import { IGenericRecord, Nullable, ValueGetter } from '@codinus/types';
import { CSDataSource, ICSValueChangeArgs, ValueChangeReason } from '@ngx-codinus/core/data';
import { booleanTrueAttribute, RUNTIME_MAT_FORM_FIELD } from '@ngx-codinus/core/shared';
import { CSMatFormFieldControl, IMatFormFieldSupport } from '@ngx-codinus/material/inputs';
import { ListTogglePosition } from '@ngx-codinus/material/selection-list';
import { distinctUntilChanged, Subject } from 'rxjs';
import { CSListChangeArgs, ListType } from '../types';
import { CSOverlayHost } from './overlay-host';

const DEFAULT_MORE_SINGLE_TEXT = 'other';
const DEFAULT_MORE_TEXT = 'others';
const DEFAULT_MAX_HEIGHT = 275;
@Directive({
    host: {
        'role': 'combobox',
        'aria-haspopup': 'listbox',
        'class': 'mat-mdc-select',
        '[attr.tabindex]': 'disabled ? -1 : tabIndex',
        '[attr.aria-controls]': '_panelOpen() ? id + "-panel" : null',
        '[attr.aria-expanded]': '_panelOpen()',
        '[attr.aria-label]': 'ariaLabel || null',
        '[class.mat-mdc-select-disabled]': 'disabled',
        '[class.mat-mdc-select-invalid]': '_mfc.errorState',
        '[class.mat-mdc-select-required]': '_mfc.required',
        '[class.mat-mdc-select-empty]': 'empty',
        '[class.mat-mdc-select-multiple]': 'multiple()',
        '(keydown)': '_handleKeydown($event)',
        '(focus)': '_onFocus()',
        '(blur)': '_onBlur()',
    },
})
export abstract class CsDropDownHost<TRow, TValue> implements IMatFormFieldSupport<ListType<TValue>> {

    protected readonly _mfc = inject(CSMatFormFieldControl, { host: true }).setComponent(this);

    private _viewportRuler = inject(ViewportRuler);
    private _dir = inject(Directionality, { optional: true });
    private _idGenerator = inject(_IdGenerator);
    private _parentFormField = inject(MAT_FORM_FIELD, { optional: true, host: true })
        ?? inject(RUNTIME_MAT_FORM_FIELD, { optional: true });
    private injectedTabIndex = inject(new HostAttributeToken('tabindex'), { optional: true });

    private _pendingValue: ICSValueChangeArgs<ListType<TValue>> | null = null;

    protected _valueId = this._idGenerator.getId('mat-select-value-');
    protected _preferredOverlayOrigin: CdkOverlayOrigin | ElementRef | undefined;
    protected _overlayWidth!: string | number;

    protected _panelOpen = signal(false);

    protected abstract getInnerValue(): ListType<TValue>;
    protected abstract listHeight: () => number;
    protected abstract selectedTitles: () => Nullable<string[]>;
    protected abstract setInnerValue(value: ListType<TValue>, reason: ValueChangeReason): void;
    protected abstract dropDownElementLoaded: () => Nullable<boolean>;

    multiple = input(false, { transform: booleanAttribute });
    readOnly = input(false, { transform: booleanAttribute });
    overlayPanelClass = input('', { transform: (v: Nullable<string | string[]>) => v ?? '' });
    panelClass = input('', { transform: (v: Nullable<string | string[] | Set<string> | IGenericRecord>) => v ?? '' });
    tabIndex = input(this.injectedTabIndex == null ? 0 : parseInt(this.injectedTabIndex) || 0,
        { transform: (value: unknown) => (value == null ? 0 : numberAttribute(value)) });
    panelWidth = input('auto', { transform: (v: Nullable<string | number>) => v ?? 'auto' });
    displayedTitleCount = input(1, { transform: numberAttribute });
    moreSingleText = input(DEFAULT_MORE_SINGLE_TEXT, { transform: (v: Nullable<string>) => v ?? DEFAULT_MORE_SINGLE_TEXT });
    moreText = input(DEFAULT_MORE_TEXT, { transform: (v: Nullable<string>) => v ?? DEFAULT_MORE_TEXT });
    maxHeight = input(DEFAULT_MAX_HEIGHT, { transform: (v: Nullable<number | string>) => toNumber(v) || DEFAULT_MAX_HEIGHT });

    optionHeight = input(48, { transform: numberAttribute });
    allowClear = input(true, { transform: booleanTrueAttribute });
    showIndex = input(false, { transform: booleanAttribute });
    togglePosition = input<ListTogglePosition>('after');

    displayMember = input<ValueGetter<TRow>>();
    valueMember = input<ValueGetter<TRow, TValue>>();
    disableMember = input<ValueGetter<TRow, boolean>>();
    dataSource = input<CSDataSource<TRow>>();

    @Input({ transform: booleanAttribute }) disabled = false;

    @Input()
    get value(): ListType<TValue> {
        return this.getInnerValue() ?? null;
    }
    set value(newValue: ListType<TValue>) {
        this._delegateValueToInnerElement(newValue, 'value');
    }

    protected suggestedHeight = computed(() => Math.min(this.maxHeight(), this.listHeight() ?? 0));

    protected readonly _panelDoneAnimatingStream = new Subject<string>();
    private _animateStream = this._panelDoneAnimatingStream.pipe(distinctUntilChanged(), takeUntilDestroyed());
    private _viewportRulerSteam = this._viewportRuler.change().pipe(takeUntilDestroyed());

    readonly openedChange = output<boolean>();
    readonly opened = output();
    readonly closed = output();
    readonly selectionChange = output<CSListChangeArgs<unknown, TRow, TValue>>();
    readonly valueChange = output<ICSValueChangeArgs<typeof this.value>>();

    protected _overlayHost = viewChild(CSOverlayHost);

    /**
     *
     */
    constructor() {

        this._animateStream.subscribe(() => {
            const _isOpen = this._panelOpen();
            this.openedChange.emit(_isOpen);
            if (_isOpen)
                this.opened.emit();
            else
                this.closed.emit();
        });

        this._viewportRulerSteam.subscribe(() => {
            if (this._panelOpen()) {
                this._overlayWidth = this._getOverlayWidth(this._preferredOverlayOrigin);
            }
        });

        effect(() => {
            if (this.dropDownElementLoaded() && this._pendingValue) {
                if (this._pendingValue) {
                    this.setInnerValue(this._pendingValue.value, this._pendingValue.reason);
                    this._pendingValue = null;
                }
            }
        });
    }

    //#region mat-form-control

    get shouldLabelFloat(): boolean {
        return this._panelOpen() || !this.empty || (this._mfc.focused && !!this._mfc.placeholder);
    }

    get empty(): boolean { return !this.value || (Array.isArray(this.value) && !this.value.length); }

    get specialFocusState() { return this._panelOpen(); }

    onContainerClick() {
        this.focus();
        this.open();
    }

    focus(): void {
        this._mfc.focusElement();
    }

    writeValue(newValue: TValue | TValue[] | null): void {
        this._delegateValueToInnerElement(newValue, 'accessor');
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    protected _elementValueChanged(e: ICSValueChangeArgs<ListType<TValue>>) {
        if (e.reason === 'user')
            this._mfc.notifyChange(e.value);
        this.valueChange.emit(e);
    }

    protected _elementSelectionChange(e: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.selectionChange.emit(e as any);
        if (!this.multiple())
            this.close();
    }

    protected _onFocus() {
        if (!this.disabled) {
            this._mfc.setFocused(true);
        }
    }

    /**
     * Calls the touched callback only if the panel is closed. Otherwise, the trigger will
     * "blur" to the panel when it opens, causing a false positive.
     */
    protected _onBlur() {
        if (!this.disabled && !this._panelOpen()) {
            this._mfc.notifyTouched();
            //this._changeDetectorRef.markForCheck();
        }
    }

    //#endregion

    //#region value handling

    private _delegateValueToInnerElement(value: ListType<TValue>, reason: ValueChangeReason) {
        if (this.dropDownElementLoaded())
            this.setInnerValue(value, reason);
        else
            this._pendingValue = { value, reason };
    }

    protected clear(event: Event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        this._delegateValueToInnerElement(null, 'user');
    }


    //#endregion

    //#region overlay

    /**
     * Callback that is invoked when the overlay panel has been attached.
     */

    /** Returns the theme to be used on the panel. */
    protected _getPanelTheme(): string {
        return this._parentFormField ? `mat-${this._parentFormField.color}` : '';
    }

    /** Gets how wide the overlay panel should be. */
    private _getOverlayWidth(
        preferredOrigin: ElementRef<ElementRef> | CdkOverlayOrigin | undefined,
    ): string | number {
        if (this.panelWidth() === 'auto') {
            const refToMeasure =
                preferredOrigin instanceof CdkOverlayOrigin
                    ? preferredOrigin.elementRef
                    : preferredOrigin || this._mfc._elementRef;
            return refToMeasure.nativeElement.getBoundingClientRect().width;
        }

        return this.panelWidth() === null ? '' : this.panelWidth();
    }

    /** Toggles the overlay panel open or closed. */
    toggle(): void {
        if (this._panelOpen())
            this.close();
        else
            this.open();
    }

    /** Opens the overlay panel. */
    open(): void {
        if (!this._canOpen())
            return;

        // It's important that we read this as late as possible, because doing so earlier will
        // return a different element since it's based on queries in the form field which may
        // not have run yet. Also this needs to be assigned before we measure the overlay width.
        if (this._parentFormField) {
            this._preferredOverlayOrigin = this._parentFormField.getConnectedOverlayOrigin();
        }

        this._overlayWidth = this._getOverlayWidth(this._preferredOverlayOrigin);
        this._panelOpen.set(true);
        // this._highlightCorrectOption();
        //this._changeDetectorRef.markForCheck();

        // Required for the MDC form field to pick up when the overlay has been opened.
        this._mfc.changeState();
    }

    /** Closes the overlay panel and focuses the host element. */
    close(): void {
        if (this._panelOpen()) {
            this._panelOpen.set(false);
            this._mfc.notifyTouched();
            this._mfc.changeState();
        }
    }

    /** Whether the panel is allowed to open. */
    protected _canOpen(): boolean {
        return !this._panelOpen() && !this.disabled; // && this.options?.length > 0;
    }

    /** Whether the element is in RTL mode. */
    protected _isRtl(): boolean {
        return this._dir ? this._dir.value === 'rtl' : false;
    }

    /** Handles all keydown events on the select. */
    protected _handleKeydown(event: KeyboardEvent): void {
        if (this.disabled)
            return;
        if (this._panelOpen())
            this._handleOpenKeydown(event);
        // else
        //     this._handleClosedKeydown(event);
    }

    /** Handles keyboard events while the select is closed. */


    /** Handles keyboard events when the selected is open. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _handleOpenKeydown(event: KeyboardEvent): void {
        /** */
    }

    //#endregion

    //#region inner list members

    /** Called when the panel has been opened and the overlay has settled on its final position. */
    protected positioningSettled() {
        //this._dropDownElement()?.scrollToFirst();
    }

    //#region 

    //#region trigger

    protected triggerText = computed(() => this.getDisplayTextCore(this.selectedTitles()));

    protected getDisplayTextCore(titles: Nullable<string[]>) {
        let more = '';
        let trigger = '';
        if (!titles)
            return { trigger, more };

        const count = this.displayedTitleCount() || 1;
        const displayTitles = titles.slice(0, count);
        trigger = displayTitles.join(', ');

        const remaning = titles.length - count;
        if (remaning === 1) {
            more = ` (+ 1 ${this.moreSingleText()})`;
        } else if (remaning > 1) {
            more = ` (+ ${remaning} ${this.moreText()})`;
        }

        return { trigger, more };
    }

    //#region 
}