import {
    Directive, Input, booleanAttribute, computed, contentChildren, effect, inject, input, output, signal, untracked, viewChild
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ValidationErrors } from "@angular/forms";
import { copyObject, getValue, isEmpty, jsonForEach, setValue, toNumber } from "@codinus/js-extensions";
import { IGenericRecord, IRecord, Nullable, ValueGetter } from '@codinus/types';
import { CSFormGroupDirective, ICSFormValidator } from "@ngx-codinus/core/forms";
import { CSOutletDirective } from "@ngx-codinus/core/outlet";
import { booleanTrueAttribute } from "@ngx-codinus/core/shared";
import { ConextMenuOpeningArgs, ICSContextMenuParent } from "@ngx-codinus/material/context-menu";
import { CSMatFormFieldControl } from "@ngx-codinus/material/inputs";
import { ListTogglePosition } from '@ngx-codinus/material/selection-list';
import { CSFormSectionArrayContent } from "./cs-form-section-content";
import { ICSFormElementValueChange } from "../types";

@Directive()
export abstract class CSFormSectionArrayBase<TRow extends IGenericRecord = IGenericRecord>
    implements ICSFormValidator, ICSContextMenuParent {

    //private injector = inject(Injector);
    private _csFormGroupDirective = inject(CSFormGroupDirective, { self: true });

    //private _csFormGroupDirective = new CSFormGroupDirective(null as unknown as ValidatorFn[], null as unknown as AsyncValidatorFn[]);

    private _disabled = false;
    protected _listStructureChaning: 'adding' | 'removing' | 'none' = 'none';
    private _activeItem = signal<Nullable<TRow>>(null);
    protected _validationCache = new Map<TRow, ValidationErrors>();
    private _conditionalContentDef = signal<CSFormSectionArrayContent | undefined>(undefined);

    protected _value: TRow[] | null = null;
    protected readonly _mfc = inject(CSMatFormFieldControl, { self: true }).setComponent(this);
    protected _form = this._csFormGroupDirective.form;

    formValueChanges = toSignal(this._form.valueChanges);

    get groupDirective() {
        return this._csFormGroupDirective;
    }

    hasCurrent = computed(() => this._activeItem() != null);
    currentItem = this._activeItem.asReadonly();
    hasConditionalView = computed(() => this._conditionalContentDef() != null);

    constructor() {
        effect(() => {
            const contentDirective = this.mainContentDef();
            if (!contentDirective)
                return;
            const outlet = this.contentOutlet();
            if (outlet.viewContainerRef.length === 0) {
                this._createEmbededView(outlet, contentDirective);
            }
        });

        effect(() => {
            this.formValueChanges();
            const hasChanges = this._listStructureChaning ==='removing' || this._trackChanges();
            this._listStructureChaning = 'none';
            this._mfc.notifyChange(this._value);
            if (hasChanges)
                this.valueChanged.emit({ value: this._value, source: 'input' });
        });

        effect(() => {
            const outlet = untracked(() => this.conditionalOutlet());
            outlet.viewContainerRef.clear();
            const conditionalView = this._conditionalContentDef();
            if (conditionalView)
                this._createEmbededView(outlet, conditionalView);
        });
    }

    private contentOutlet = viewChild.required('contentOutlet', { read: CSOutletDirective });
    private conditionalOutlet = viewChild.required('conditionalOutlet', { read: CSOutletDirective });
    private contentDefs = contentChildren(CSFormSectionArrayContent, { descendants: true });

    private mainContentDef = computed(() => this.contentDefs().find(d => !d.when()));

    multiple = input(false, { transform: booleanAttribute });
    showSearch = input(true, { transform: booleanTrueAttribute });
    readOnly = input(false, { transform: booleanAttribute });

    displayMember = input<ValueGetter<TRow>>();
    iconMember = input<ValueGetter<TRow>>();
    disableMember = input<ValueGetter<TRow, boolean>>();
    enableDrag = input(true, { transform: booleanTrueAttribute });
    optionHeight = input(40, { transform: (v: Nullable<number | string>) => v ? toNumber(v) : 40 });
    contentWidth = input(70, { transform: (v: Nullable<number | string>) => v ? toNumber(v) : 70 });

    protected listWidth = computed(() => 100 - this.contentWidth());
    protected _togglePosition = computed<ListTogglePosition>(() => this.multiple() ? 'after' : 'none');

    readonly conextMenuOpening = output<ConextMenuOpeningArgs>();
    readonly currentChanged = output<Nullable<TRow>>();
    readonly valueChanged = output<ICSFormElementValueChange<Nullable<TRow[]>>>();
    readonly focusedChanged = output<boolean>();

    @Input()
    get value(): TRow[] | null { return this._value; }
    set value(value: TRow[] | null) {
        if (isEmpty(value))
            this._value = null;
        this._value = value;
        this._validationCache.clear();
        this._mfc.notifyChange(this._value);
        this.valueChanged.emit({ value: this._value, source: 'value' });
    }

    protected _onCurrentChanged(item: Nullable<TRow>) {
        this._conditionalContentDef.set(this.contentDefs().find(d => {
            const when = d.when();
            return !!when && when(d.id(), item);
        }));

        this._activeItem.set(item);
        this._form.reset(item, { emitEvent: false });
        this.currentChanged.emit(item);
    }

    protected _onFocusIn() {
        this._mfc.setFocused(true);
        this.focusedChanged.emit(true);
    }

    protected _onFocusOut(event: FocusEvent) {
        if (this.containsFocus(this._mfc._elementRef.nativeElement, event.relatedTarget as Element))
            return;
        if (!this.disabled)
            this._mfc.notifyTouched();
        this._mfc.setFocused(false);
        this.focusedChanged.emit(false);
    }

    protected containsFocus(formControlElement: Element, relatedTarget: Element | null) {
        return formControlElement.contains(relatedTarget);
    }

    private _createEmbededView(outlet: CSOutletDirective, contentDirective: CSFormSectionArrayContent) {
        outlet.viewContainerRef.createEmbeddedView(contentDirective.templateRef);
    }

    private _trackChanges() {
        const activeItem = this._activeItem();
        if (!activeItem || !this._form.dirty)
            return false;
        let needRefresh = false;
        let hasChanges = false;
        const errors: IRecord<ValidationErrors> = {};
        jsonForEach(this._form.controls, (name, control) => {
            if (getValue(activeItem, name) == control.value)
                return;
            hasChanges = true;
            setValue(activeItem, name, control.value, true);
            if (!control.valid && control.errors)
                errors[name] = control.errors;

            if (this.displayMember() === name || this.iconMember() === name)
                needRefresh = true;
        }, (key, control) => !!key && (control.dirty || !control.valid));

        if (!hasChanges)
            return false;

        if (Object.keys(errors).length > 0)
            this._validationCache.set(activeItem, errors);
        else
            this._validationCache.delete(activeItem);

        if (needRefresh)
            this.refreshItem(activeItem);
        return true;
    }

    protected abstract refreshItem(activeItem: TRow): void;

    //#region validator

    validate(): ValidationErrors | null {
        if (this._validationCache.size == 0)
            return null;
        return Object.fromEntries(this._validationCache);
    }

    //#endregion


    //#region valueAccessor


    writeValue(obj: unknown): void {
        if (obj)
            obj = copyObject(obj);

        this._value = obj as TRow[];
        this._validationCache.clear();
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    //#endregion

    //#region MatFormFieldControl

    get shouldLabelFloat(): boolean { return true; }
    get empty(): boolean { return isEmpty(this.value); }

    @Input({ transform: booleanAttribute })
    get disabled(): boolean { return this._disabled; }
    set disabled(value: boolean) {
        if (value && !this._form.disabled)
            this._form.disable();
        else if (!value && this._form.disabled)
            this._form.enable();
        this._mfc.changeState();
    }

    focus() {
        this._mfc.focusElement();
    }

    //#endregion
}