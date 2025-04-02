import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { CdkVirtualScrollViewport, ScrollingModule, ViewportRuler } from '@angular/cdk/scrolling';
import {
    AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Injector,
    Input, NgZone, OnDestroy, ViewEncapsulation, afterNextRender, booleanAttribute, computed,
    effect, forwardRef, inject, input, numberAttribute, output, signal, untracked, viewChild, viewChildren
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatList, MatListModule } from '@angular/material/list';
import { preventEvent, scrollIntoViewAndFocus } from '@codinus/dom';
import { Nullable, ValueGetter } from '@codinus/types';
import {
    CSDataManager, CSDataSource, CSSelectionModel,
    CSStringFilterPredicate, CurrentChangingFn, ICSValueChangeArgs, ValueChangeReason
} from '@ngx-codinus/core/data';
import { createEventManager } from '@ngx-codinus/core/events';
import { HtmlElementRuler } from '@ngx-codinus/core/observer';
import { CSNamedTemplate } from '@ngx-codinus/core/outlet';
import { booleanTrueAttribute } from '@ngx-codinus/core/shared';
import {
    CODINUS_CONTEXT_MENU_PARENT, ConextMenuOpeningArgs, ICSContextMenuParent
} from '@ngx-codinus/material/context-menu';
import { ICSSelectionChangingArgs, SelectPredicate } from '@ngx-codinus/material/table';
import { CSListOption } from '../option/list-option';
import {
    CODINUS_SELECTION_LIST, CSVirtualSelectionListChange, ICSListOption,
    ICSSelectionList, ListIconType, ListTogglePosition
} from './types';

const OPTION_TAG_NAME = 'CS-LIST-OPTION';
const DEFAULT_OPTION_HEIGHT = 48;
const ARROW_SETPS = { ArrowDown: 1, PageDown: 8, ArrowUp: -1, PageUp: -8 }

@Component({
    selector: 'cs-selection-list-panel',
    templateUrl: './selection-list.html',
    styleUrls: ['./selection-list.scss'],
    host: {
        'class': 'mat-mdc-selection-list mat-mdc-list-base mdc-list cs-selection-list-panel',
        'role': 'listbox',
        '[attr.aria-multiselectable]': 'multiple()',
        '[class.cs-list--hasIcon]': '_showIcon()',
        '[class.cs-list--hasIndex]': 'showIndex()',
        '[class.cs-selection-list-panel-disabled]': '!enabled()',
        '[style.--cs-virtual-list-item-height.px]': '_optionHeight()',
        '(keydown)': '_handleKeydown($event)',
    },
    imports: [MatInputModule, MatDividerModule, CSNamedTemplate, CSListOption,
        MatIconModule, MatListModule, ScrollingModule, CdkDropList, CdkDrag],
    providers: [
        {
            provide: ViewportRuler,
            useFactory: (list: CSSelectionListPanel<unknown, unknown>) => list._htmlElementRuler,
            deps: [forwardRef(() => CSSelectionListPanel)],
        },
        { provide: MatList, useExisting: CSSelectionListPanel },
        { provide: CODINUS_SELECTION_LIST, useExisting: CSSelectionListPanel },
        { provide: CODINUS_CONTEXT_MENU_PARENT, useExisting: CSSelectionListPanel },
    ],
    hostDirectives: [HtmlElementRuler],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class CSSelectionListPanel<TRow, TValue = unknown>
    extends MatList implements ICSSelectionList<TRow, TValue>,
    ICSContextMenuParent, AfterViewInit, OnDestroy {

    override _isNonInteractive = false;

    //#region injection

    private _elementRef = inject(ElementRef);
    protected _htmlElementRuler = inject(HtmlElementRuler, { self: true });
    private _ngZone = inject(NgZone);
    private _injector = inject(Injector);

    //#endregion

    private _initialized = false;

    private _coreValue = signal<TValue[] | null>(null);
    private _isDisabled = signal(false);

    private _selectionModel = new CSSelectionModel<TValue>(false);
    private _eventManager = createEventManager();

    //#region output
    readonly conextMenuOpening = output<ConextMenuOpeningArgs>();
    readonly selectionChange = output<CSVirtualSelectionListChange<TRow, TValue>>();
    readonly valueChange = output<ICSValueChangeArgs<typeof this.value>>();
    readonly currentChanged = output<Nullable<TRow>>();
    //#endregion

    //#region inputs

    displayMember = input<ValueGetter<TRow>>();
    valueMember = input<ValueGetter<TRow, TValue>>();
    disableMember = input<ValueGetter<TRow, boolean>>();
    iconMember = input<ValueGetter<TRow>>();
    filterPredicate = input<CSStringFilterPredicate<TRow>>();
    selectionPredicate = input<SelectPredicate<TRow, TValue>>();
    currentChanging = input<CurrentChangingFn<TRow>>();


    multiple = input(false, { transform: booleanAttribute });
    readOnly = input(false, { transform: booleanAttribute });
    selectOnlyByCheckBox = input(false, { transform: booleanAttribute });
    enableDrag = input(false, { transform: booleanAttribute });
    stickySelected = input(false, { transform: booleanAttribute });
    activateFirstItem = input(false, { transform: booleanAttribute });
    hasCustomFilter = input(false, { transform: booleanAttribute });

    showIndex = input(false, { transform: booleanAttribute });
    showTitle = input(true, { transform: booleanTrueAttribute });
    showSearch = input(true, { transform: booleanTrueAttribute });
    dataSource = input<CSDataSource<TRow>>();

    togglePosition = input<ListTogglePosition>('after');
    iconType = input<ListIconType>('none');
    optionHeight = input(48, { transform: numberAttribute });

    protected isNotDraggable = computed(() => !this.enabled() || !this.enableDrag());

    @Input()
    get value(): TValue | TValue[] | null {
        const _signalValue = this._coreValue();
        const _value = _signalValue == null
            ? null
            : this.multiple()
                ? _signalValue
                : _signalValue[0] ?? null;
        return _value;
    }
    set value(newValue: TValue | TValue[] | null) {
        this._setValue(newValue, 'value');
        this._notifyValueChange();
    }

    //#endregion

    //#region viewchildren

    readonly _csDataManager = new CSDataManager<TRow, TValue>(this, () => this.dataSource);
    protected readonly _data = computed(() => this._csDataManager.filteredData());

    protected _items = viewChildren(CSListOption);
    protected _viewport = viewChild(CdkVirtualScrollViewport);
    protected _optTemplates = viewChildren(CSNamedTemplate);

    private _searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
    private _searchContainer = viewChild('searchContainer', { read: ElementRef });

    //#endregion

    constructor() {
        super();
        effect(() => {
            const multiple = this.multiple();
            if (multiple != this._selectionModel.multiple) {
                this._selectionModel.multiple = multiple;
                if (this._initialized)
                    this.value = this._selectionModel.selected;
            }
        });

        effect(() => {
            this._selectionModel.setSelection(...this._coreValue() ?? []);
            this._notifyValueChange();
        });
    }

    //#region data population

    _hasfilterStrategy = computed(() => this.stickySelected());

    _applyFilterStartegy?(data: readonly TRow[], filter: Nullable<string>, predicate: CSStringFilterPredicate<TRow>): TRow[] {
        const value = this._coreValue();
        const selected: TRow[] = [];
        const noneSelected: TRow[] = [];
        const selectedSet = new Set(value ?? []);
        const _cValueFn = this._csDataManager.valueMember();
        const hasCustomFilter = this.hasCustomFilter();

        for (const item of data) {
            if (selectedSet.size && selectedSet.has(_cValueFn(item)))
                selected.push(item);
            else if ((!filter && !hasCustomFilter) || predicate(item, filter))
                noneSelected.push(item);
        }
        return selected.concat(noneSelected);
    }

    //#endregion

    //#region templates & view options

    protected _optionHeight = computed(() => {
        const height = this.optionHeight();
        return !height || isNaN(height) ? DEFAULT_OPTION_HEIGHT : height;
    });

    protected _minBufferPx = computed(() => this._optionHeight() * 8);
    protected _maxBufferPx = computed(() => this._optionHeight() * 16);

    _optionToggleType = computed(() => this.togglePosition() === 'none' ? null : this.multiple() ? 'check' : 'radio');
    _optionIconType = computed(() => {
        const iconType = this.iconType();
        return !iconType || iconType === 'none' ? null : iconType;
    });
    _optionTogglePosition = computed(() => {
        const togglePosition = this.togglePosition();
        return !togglePosition || togglePosition === 'none' ? 'after' : togglePosition;
    });
    _optionIconPosition = computed(() => this._optionTogglePosition() === 'after' ? 'before' : 'after');

    protected _showIcon = computed(() => this.iconMember() && this._iconTemplate() != null);
    _iconTemplate = computed(() => this.iconMember() ? this._optTemplates().find(t => t.name() === this.iconType())?.template : undefined);
    _indexTemplate = computed(() =>
        this.showIndex()
            ? this._optTemplates().find(t => t.name() === 'index')?.template
            : undefined);
    _titleTemplate = computed(() =>
        this.showTitle()
            ? this._optTemplates().find(t => t.name() === 'title')?.template
            : undefined);

    //#endregion

    enabled = computed(() => { return !this._isDisabled() && !this.readOnly(); });

    listDataHeight = computed(() => (this._csDataManager.filteredData().length * this._optionHeight()));

    get searchHeight(): number { return this.showSearch() ? this._searchContainer()?.nativeElement.clientHeight ?? 0 : 0; }

    override get disabled(): boolean {
        return super.disabled;
    }
    override set disabled(value: boolean) {
        super.disabled = value;
        this._isDisabled.set(value);
    }

    isSelected(value: Nullable<TValue>): boolean {
        this._selectionModel.changedSignal();
        return (value == null && this.value == null && !this.multiple())
            || (value != null && this._selectionModel.isSelected(value));
    }

    _isOptionCurrent(option: ICSListOption<TRow, TValue>): boolean {
        return this._csDataManager.isCurrent(option.data());
    }

    _optionSelectChange(option: ICSListOption<TRow, TValue>, selected: boolean): void {
        if (!this.enabled())
            return;

        const predicate = this.selectionPredicate();
        if (typeof predicate === 'function') {
            const data = this._csDataManager.dataTracker().data;
            const dataItem = option.data();
            if (!dataItem)
                return;

            const args: ICSSelectionChangingArgs<TRow, TValue> = {
                data,
                selected: this._selectionModel.selected,
                rowKey: option.value(),
                rowData: dataItem,
                type: selected ? 'select' : 'deselect'
            };
            if (!predicate(args))
                return;
        }

        if (this.stickySelected()) {
            const items = this._items();
            const index = items.indexOf(option as unknown as CSListOption);
            const optionToFocus = items.at(Math.min(items.length - 1, index + 1));
            afterNextRender(() => optionToFocus?.focus(), { injector: this._injector });
        }

        if (selected) {
            // if (!this.multiple()) {
            //     if (option.value == null)
            //         this._selectionModel.clear();
            // }
            //if (option.value() != null)
            this._selectionModel.select(option.value());
        } else {
            //if (option.value() != null)
            this._selectionModel.deselect(option.value());
        }
        untracked(() => this._coreValue.set(this._selectionModel.selected))

        this._emitChangeEvent(option);
    }

    _optionClicked(option: ICSListOption<TRow, TValue>): void {
        this._csDataManager.setCurrent(option.data());
    }

    protected _onFilterInput(event: Event) {
        this.setFilter((event.target as HTMLInputElement)?.value);
    }

    protected _trackBy = (index: number, item: TRow) => {
        return this._csDataManager.valueMember()(item);
    }

    protected _handleKeydown(event: KeyboardEvent) {
        if (!this.enabled)
            return;

        const el = event.target as HTMLElement;
        if (el.tagName !== OPTION_TAG_NAME)
            return;
        switch (event.code) {
            case 'Tab':
                this._searchInput()?.nativeElement?.focus();
                preventEvent(event);
                break;
            case 'Enter':
            case 'Space':
                el.click();
                preventEvent(event);
                break;
            case 'ArrowDown':
            case 'PageDown':
            case 'ArrowUp':
            case 'PageUp': {
                this._focuNextElement(el, event, ARROW_SETPS[event.code]);
                break;
            }
            // case 'ArrowDown': {
            //     const next = this._getNextElement(1);
            //     if (next) {
            //         preventEvent(event);
            //         this._focusElement(next);
            //     }
            //     break;
            // }
            // case 'PageUp':
            //     preventEvent(event);
            //     this._moveByPage(el, -8);
            //     break;
            // case 'PageDown':
            //     preventEvent(event);
            //     this._moveByPage(el, 8);
            //     break;
            // case 'ArrowUp': {
            //     const prev = el.previousElementSibling;
            //     if (prev) {
            //         preventEvent(event);
            //         this._focusElement(prev);
            //     }
            //     break;
            // }
            case "KeyA":
                if (this.multiple() && (event.ctrlKey || event.metaKey)) {
                    preventEvent(event);
                    this.selectAll(true);
                }
                break;
        }
    }

    deselectAll(): void {
        if (!this.multiple())
            return;
        this._coreValue.set(null);
        this._viewport()?.scrollToOffset(0);
        this.selectionChange.emit({ list: this, type: 'deselect', selectedData: [], value: this.value, reason: 'all' });
    }

    selectAll(onlyFiltered = false): void {
        if (!this.multiple())
            return;
        const _data = this._csDataManager.getData(onlyFiltered);
        const activeData = this._csDataManager.getActive(_data);
        if (!activeData)
            return;
        this._coreValue.set(activeData.values);
        this._viewport()?.scrollToOffset(0);
        this.selectionChange.emit({
            list: this,
            type: 'select',
            selectedData: activeData.data ?? [],
            value: activeData.values,
            reason: 'all'
        });
    }

    getSelectedRecords(): TRow[] {
        return this._csDataManager.getSelectedRecords(this._coreValue());
    }

    selectedTitles = computed(() => this._csDataManager.getSelectedTitles(this._coreValue()));

    getSelectedTitles(values: TValue[]) {
        return this._csDataManager.getSelectedTitles(values);
    }

    setFilter(value: Nullable<string>) {
        this._csDataManager.setFilter(value);
    }

    _emitChangeEvent(option: ICSListOption<TRow, TValue>) {
        this.selectionChange.emit({
            list: this, type: option.selected() ? 'select' : 'deselect',
            optionValue: option.value(), optionData: option.data(),
            value: this.value,
            reason: 'option'
        });
        this.valueChange.emit({ value: this.value, reason: 'user' });
    }

    setCurrentItem(item: Nullable<TRow>, autoScroll = true) {
        this._csDataManager.setCurrent(item, autoScroll);
    }

    scrollToIndex(index: number) {
        afterNextRender(() => this._viewport()?.scrollToIndex(index, 'smooth'), { injector: this._injector });
    }

    scrollToStart() {
        this._viewport()?.scrollToIndex(0, 'smooth');
    }

    add(row?: TRow | TRow[], setCurrent = true, autoScroll = true) {
        return this._csDataManager.add(row, setCurrent, autoScroll);
    }

    remove(row?: TRow | TRow[] | null, setCurrent = true) {
        this._csDataManager.remove(row, setCurrent);
    }

    reDraw() {
        this._csDataManager.reDraw();
    }

    private _focuNextElement(el: HTMLElement, event: KeyboardEvent, step: number) {
        const nextOption = this._getNextEnabledOptionByStep(el, step);
        if (nextOption) {
            preventEvent(event);
            scrollIntoViewAndFocus(nextOption._elementRef.nativeElement, this._viewport()?.elementRef.nativeElement);
        }
    }

    private _getNextEnabledOptionByStep(el: HTMLElement, step: number) {
        const items = this._items();
        const index = items.findIndex(o => o._elementRef.nativeElement == el);
        const nextIndex = Math.max(0, Math.min(items.length - 1, index + step));
        let nextOption = items.at(nextIndex);
        step = step > 0 ? 1 : -1;
        while (nextOption?.disabled) {
            nextOption = items.at(nextIndex + step);
        }
        return nextOption;
    }

    focus(options?: FocusOptions) {
        if (!this.enabled)
            return;
        if (!this._initialized) {
            afterNextRender(() => this.focus(), { injector: this._injector });
            return;
        }
        if (this._items()?.length) {
            this._items().at(0)?.focus();
        } else if (this._searchInput && this.showSearch()) {
            this._searchInput()?.nativeElement.focus(options);
        }
        else {
            this._elementRef.nativeElement.focus();
        }
    }

    refreshItem(item: TRow) {
        this._items().find(o => o.data() === item)?.update();
    }

    protected drop(event: CdkDragDrop<TRow[]>) {
        this._csDataManager.swapRecord(event.previousIndex, event.currentIndex);
    }

    protected _setValue(value: Nullable<TValue | TValue[]>, reason: ValueChangeReason) {
        if (!this._initialized) {
            afterNextRender(() => this._setValue(value, reason), { injector: this._injector });
            return;
        }
        let _value = value == null ? [] : !Array.isArray(value) ? [value] : value;
        if (!this.multiple() && _value && _value.length > 1)
            _value = _value.slice(0, 1);
        this._coreValue.set(_value);
        this.valueChange.emit({ value: this.value, reason });
    }

    _notifyTouched() {/** */ }
    protected _notifyValueChange() {/** */ }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected notifyFocused(focused: boolean) {/** */ }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _handleFocusin = (event: FocusEvent) => {
        if (this.disabled) {
            return;
        }
        this.notifyFocused(true);
    };

    private _handleFocusout = () => {
        // Focus takes a while to update so we have to wrap our call in a timeout.
        setTimeout(() => {
            if (!this._containsFocus()) {
                this.notifyFocused(false);
            }
        });
    };

    private _containsFocus() {
        const activeElement = _getFocusedElementPierceShadowDom();
        return activeElement && this._elementRef.nativeElement.contains(activeElement);
    }

    //#region life cycle

    ngAfterViewInit(): void {
        this._initialized = true;
        this._ngZone.runOutsideAngular(() => {
            this._eventManager.listenAndRegister('focusin', this._elementRef.nativeElement, 'focusin', this._handleFocusin);
            this._eventManager.listenAndRegister('focusout', this._elementRef.nativeElement, 'focusout', this._handleFocusout)
        });
    }

    ngOnDestroy(): void {
        this._eventManager.unRegisterAll();
    }

    //#endregion
}