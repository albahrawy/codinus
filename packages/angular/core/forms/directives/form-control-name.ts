import {
    AfterViewInit, Directive, Injector, Input, OnDestroy, Signal, computed, effect, forwardRef, inject, input, output, signal, ɵWritable
} from '@angular/core';
import {
    ControlContainer, Form, FormControl, FormControlName, FormGroupDirective,
    NG_ASYNC_VALIDATORS, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl
} from "@angular/forms";
import { Nullable } from '@codinus/types';
import { selectValidControlAccessor } from '@ngx-codinus/core/shared';
import { isFormSection } from '../functions';
import { CSFormGroup } from '../models/form-group';
import { CSFormGroupDirective } from './form-group-directive';
import { CSFormGroupDirectiveBase } from './form-group-directive-base';
import { CODINUS_FORM_SECTION, CODINUS_RUNTIME_CONTROL_CONTAINER, ICSFormSection } from './injector-tokens';

declare module "@angular/forms" {
    interface AbstractControlDirective {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        _setAsyncValidators(validators: readonly (Function | Validator)[] | null): void;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        _setValidators(validators: readonly (Function | Validator)[] | null): void;
    }
    interface AbstractControl {
        /** @internal */
        _boundConfig: () => unknown;
        /** @internal */
        _updateValue(): void;
        readonly _status: Signal<FormControlStatus | undefined>;
    }
}

@Directive()
export abstract class CSAbstractFormControlName extends NgControl implements OnDestroy, AfterViewInit {

    private _activeFormDirective: FormGroupDirective | null = null;

    protected _parent = inject(ControlContainer, { optional: true, host: true, skipSelf: true }) ??
        inject(CODINUS_RUNTIME_CONTROL_CONTAINER, { optional: true, skipSelf: true });

    private _valueAccessors = inject(NG_VALUE_ACCESSOR, { optional: true, self: true });
    private _injectedValidators = inject(NG_VALIDATORS, { optional: true, self: true });
    private _injectedAsyncValidators = inject(NG_ASYNC_VALIDATORS, { optional: true, self: true });

    formValueChange = output<unknown>();

    constructor() {
        super();
        this.valueAccessor = selectValidControlAccessor(this._valueAccessors, true);
        this._setValidators(this._injectedValidators);
        this._setAsyncValidators(this._injectedAsyncValidators);
        this._unRegister();
        if (isFormSection(this._parent))
            this._parent.registerDir(this);

        effect(() => {
            const newName = this.csFormControlName() ?? null;
            if (newName == this.name)
                return;
            const oldName = this.name;
            if (this._hasBeenSet)
                this._unRegister();

            this.name = newName;
            this._register();
            this._hasBeenSet = true;

            this.refreshRegistrations(newName, oldName as string);
        });
    }

    ngAfterViewInit(): void {
        if (this._control()) {
            // this._liveValue.set(this._control.value);
        }
    }

    protected _control = signal<FormControl | null>(null);
    private _isDisabled = false;

    /** @internal */
    private readonly _liveValue = signal<unknown>(undefined);

    readonly signalValue = this._liveValue.asReadonly();
    readonly signalValid = computed(() => this._control()?._status() === 'VALID');

    override viewToModelUpdate(newValue: unknown): void {
        this.formValueChange.emit(newValue);
        this._liveValue.set(newValue);
    }

    override get path(): string[] {
        return controlPath(this.name == null ? this.name : this.name.toString(), this._parent);
    }

    get formDirective(): CSFormGroupDirective | null {
        return this._parent ? <CSFormGroupDirective>this._parent.formDirective : null;
    }

    override get control(): FormControl | null { return this._control(); }

    boundConfig: unknown;
    private _hasBeenSet = false;

    csFormControlName = input<Nullable<string>>(null);

    abstract get defaultValue(): unknown;

    @Input()
    get isDisabled(): boolean { return this._isDisabled || !!this.control?.disabled }
    set isDisabled(value: boolean) {
        const _ctrl = this._control();
        if (_ctrl) {
            if (value && !_ctrl.disabled)
                _ctrl.disable({ emitEvent: false });
            else if (!value && _ctrl.disabled)
                _ctrl.enable({ emitEvent: false });
        }

        this._isDisabled = value;
    }

    refresh(): void {
        const old_parent = this._activeFormDirective;
        this._checkParent();
        const new_parent = this._activeFormDirective;

        if (old_parent != new_parent) {
            old_parent?.removeControl(this as unknown as FormControlName);
            if (this.name && new_parent)
                this.setControl(new_parent);
            this.refreshRegistrations(this.csFormControlName(), null);
        }
    }

    private _register() {
        this._checkParent();
        if (this.name && this._activeFormDirective)
            this.setControl(this._activeFormDirective);
    }

    private setControl(groupDirective: FormGroupDirective) {
        const ctrl = groupDirective.addControl(this as unknown as FormControlName);
        ctrl._boundConfig = () => this.boundConfig;
        this._liveValue.set(ctrl.value);
        this._control.set(ctrl);
    }

    private _checkParent(): void {
        this._activeFormDirective = getActiveFormDirective(this.formDirective);
        if (!(this._activeFormDirective instanceof CSFormGroupDirectiveBase))
            throw new Error(
                `csFormControlName must be used with a parent csFormGroup directive. 
                You'll want to use it in a parent <cs-form-section> 
                Or a parent with an csFormGroup directive. `);
    }

    private _unRegister() {
        this._activeFormDirective?.removeControl(this as unknown as FormControlName);
        this._liveValue.set(null);
    }

    protected abstract refreshRegistrations(newValue: Nullable<string>, oldValue: Nullable<string>): void;

    ngOnDestroy(): void {
        this._unRegister();
        if (isFormSection(this._parent))
            this._parent.unRegisterDir(this);
    }

}


@Directive({
    selector: `:not(cs-form-section):not(cs-localizable-input)[csFormControlName]`,
    exportAs: 'csFormControlName',
    providers: [
        { provide: NgControl, useExisting: forwardRef(() => CSFormControlName) },
        { provide: CSAbstractFormControlName, useExisting: forwardRef(() => CSFormControlName) }
    ]
})
export class CSFormControlName extends CSAbstractFormControlName implements OnDestroy, AfterViewInit {

    private _defaultValue: unknown;

    @Input()
    get defaultValue(): unknown { return this.control?.defaultValue || this._defaultValue; }
    set defaultValue(value: unknown) {
        const ctrl = this._control();
        if (ctrl) {
            (ctrl as ɵWritable<FormControl>).defaultValue = value;
        }
        this._defaultValue = value;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected refreshRegistrations(newValue: string | null, oldValue: string | null) {/** */ }
}


@Directive({
    selector: 'cs-form-section[csFormControlName],cs-localizable-input[csFormControlName]',
    providers: [
        { provide: NgControl, useExisting: forwardRef(() => CSSectionFormControlName) },
        { provide: CSAbstractFormControlName, useExisting: forwardRef(() => CSSectionFormControlName) }]
})
export class CSSectionFormControlName extends CSAbstractFormControlName {
    private _sectionForm: ICSFormSection | null = null;
    private _injector = inject(Injector, { self: true });

    protected override refreshRegistrations(newValue: string | null, oldValue: string | null): void {
        if (newValue == null || oldValue == null) {
            this._verifySectionForm();
            this._sectionForm?.refreshRegistrations();
        }
    }

    private _verifySectionForm() {
        if (!this._sectionForm)
            this._sectionForm = this._injector.get(CODINUS_FORM_SECTION, null, { self: true });
    }

    override get defaultValue(): unknown {
        this._verifySectionForm();
        if (!this._sectionForm || !(this._sectionForm.form instanceof CSFormGroup))
            return null;
        return this._sectionForm.form.getDefaultValue();
    }
}

function getActiveFormDirective(formDirective: Form | null): FormGroupDirective | null {

    while (isFormSection(formDirective) && !formDirective.hasNgControl) {
        formDirective = formDirective.parentCSFormGroupDirective;
    }

    return formDirective as FormGroupDirective;
}

function controlPath(name: string | null, parent: ControlContainer | null): string[] {
    if (parent?.path && name)
        return [...parent.path, name];
    return [];
}