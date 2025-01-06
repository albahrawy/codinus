import {
    AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnChanges, forwardRef, inject
} from "@angular/core";

import { ControlContainer, FormGroupDirective } from "@angular/forms";
import { isEmpty, isObject } from "@codinus/js-extensions";
import {
    CODINUS_FORM_SECTION, CSAbstractFormControlName, CSFormGroupDirectiveBase,
    CSSectionFormControl, CSSectionFormControlName, ICSFormSection
} from "@ngx-codinus/core/forms";

import { MAT_FORM_FIELD } from "@angular/material/form-field";
import { IGenericRecord } from "@codinus/types";
import { CSMatFormFieldControl, IMatFormFieldSupport } from "@ngx-codinus/material/inputs";

//TODO: think about validation in case of no formcontrol
@Component({
    selector: 'cs-form-section',
    template: `<ng-content></ng-content>`,
    styles: [`
        :host {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                outline: none;
              }
        `],
    host: {
        '[attr.tabindex]': '-1',
        '[attr.aria-label]': 'ariaLabel || null',
        'ngSkipHydration': '',
        '(focusin)': '_onFocusIn($event)',
        '(focusout)': '_onFocusOut($event)',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [CSMatFormFieldControl],
    providers: [
        { provide: MAT_FORM_FIELD, useValue: null },
        { provide: ControlContainer, useExisting: forwardRef(() => CSFormSection) },
        { provide: FormGroupDirective, useExisting: forwardRef(() => CSFormSection) },
        { provide: CODINUS_FORM_SECTION, useExisting: forwardRef(() => CSFormSection) },

    ]
})
export class CSFormSection<TValue extends IGenericRecord = IGenericRecord> extends CSFormGroupDirectiveBase
    implements ICSFormSection, IMatFormFieldSupport<TValue | null>, AfterViewInit, OnChanges {

    // we need it for csSectionFormControlName
    private _isFormSection = true;

    private _csFormNameDirectives = new Set<CSAbstractFormControlName>([]);

    readonly _elementRef = inject(ElementRef, { self: true });
    protected readonly _mfc = inject(CSMatFormFieldControl, { self: true }).setComponent(this);
    get hasNgControl() { return !!this._mfc.ngControl?.name; }

    override get value(): TValue | null {
        return this._mfc.ngControl
            ? this._mfc.ngControl.value
            : null;
    }

    protected _onFocusIn() {
        this._mfc.setFocused(true);
    }

    protected _onFocusOut(event: FocusEvent) {
        if (this._elementRef.nativeElement.contains(event.relatedTarget as Element))
            return;
        if (!this.disabled)
            this._mfc.notifyTouched();
        this._mfc.setFocused(false);
    }

    refreshRegistrations(): void {
        this._csFormNameDirectives.forEach(d => d.refresh());
        const ngControl = this._mfc.ngControl;
        if (ngControl instanceof CSSectionFormControlName && ngControl.control instanceof CSSectionFormControl) {
            ngControl.control._setSubForm(ngControl.name ? this.form : null);
        }
    }

    registerDir(dir: CSAbstractFormControlName) {
        this._csFormNameDirectives.add(dir);
    }

    unRegisterDir(dir: CSAbstractFormControlName) {
        this._csFormNameDirectives.delete(dir);
    }
    //#region valueAccessor


    writeValue(obj: unknown): void {
        const _value = this.verifyWriteValue((isObject(obj) && !isEmpty(obj) ? obj : {}) as TValue) ?? {};
        this.form.reset(_value, { emitEvent: false });
    }

    protected verifyWriteValue(value: TValue): TValue | null {
        return value;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    //#endregion

    //#region MatFormFieldControl

    get shouldLabelFloat(): boolean { return true; }
    get empty(): boolean { return isEmpty(this.value); }

    override get disabled(): boolean { return super.disabled ?? false; }
    override set disabled(value: boolean) {
        if (value && !super.disabled)
            this.form.disable();
        else if (!value && super.disabled)
            this.form?.enable();
        this._mfc.changeState();
    }

    focus() {
        this._elementRef.nativeElement?.focus?.();
    }
    //#endregion
}