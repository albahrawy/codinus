
import { Directive, Injector, Input, Provider, forwardRef, inject } from "@angular/core";
import {
    NG_VALIDATORS, MaxValidator, MinValidator, RequiredValidator, CheckboxRequiredValidator, EmailValidator,
    MinLengthValidator, MaxLengthValidator, PatternValidator,
    Validator,
    AbstractControl,
    ValidationErrors,
    FormGroup,
    AsyncValidatorFn,
    ValidatorFn,
    Validators,
    AsyncValidator,
    NG_ASYNC_VALIDATORS,
} from "@angular/forms";

import { jsonMap } from "@codinus/js-extensions";
import { ICSFormValidator, CODINUS_FORM_SECTION, CODINUS_FORM_VALIDATOR } from "./injector-tokens";
import { Observable, of } from "rxjs";

const MAX_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CSMaxValidator),
    multi: true,
};

const MIN_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CSMinValidator),
    multi: true,
};

const REQUIRED_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CSRequiredValidator),
    multi: true,
};

const REQUIRED_DATE_RANGE_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CSRequiredDateRangeValidator),
    multi: true,
};

const CHECKBOX_REQUIRED_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CSCheckboxRequiredValidator),
    multi: true,
};

const EMAIL_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CSEmailValidator),
    multi: true,
};

const MIN_LENGTH_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CSMinLengthValidator),
    multi: true,
};

const MAX_LENGTH_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CSMaxLengthValidator),
    multi: true,
};

const PATTERN_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CSPatternValidator),
    multi: true,
};

const GROUP_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CSGroupValidator),
    multi: true,
};

const Array_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CSSectionArrayValidator),
    multi: true,
};


@Directive({
    selector: `input[type=number][max][csFormControlName],
               input:not([type=number])[inputType=numeric][max][csFormControlName]`,
    providers: [MAX_VALIDATOR],
})
export class CSMaxValidator extends MaxValidator { }


@Directive({
    selector: `input[type=number][min][csFormControlName],
               input:not([type=number])[inputType=numeric][min][csFormControlName]`,
    providers: [MIN_VALIDATOR],
})
export class CSMinValidator extends MinValidator { }


@Directive({
    selector: ':not([type=checkbox]):not(cs-localizable-input):not(cs-date-range-input)[required][csFormControlName]',
    providers: [REQUIRED_VALIDATOR],
})
export class CSRequiredValidator extends RequiredValidator { }

@Directive({
    selector: 'cs-date-range-input[csFormControlName][required]',
    providers: [REQUIRED_DATE_RANGE_VALIDATOR],
})
export class CSRequiredDateRangeValidator extends RequiredValidator { }

@Directive({
    selector: 'input[type=checkbox][required][csFormControlName]',
    providers: [CHECKBOX_REQUIRED_VALIDATOR],
})
export class CSCheckboxRequiredValidator extends CheckboxRequiredValidator { }

@Directive({
    selector: '[email][csFormControlName]',
    providers: [EMAIL_VALIDATOR],
})
export class CSEmailValidator extends EmailValidator { }

@Directive({
    selector: '[minlength][csFormControlName]',
    providers: [MIN_LENGTH_VALIDATOR],
})
export class CSMinLengthValidator extends MinLengthValidator { }

@Directive({
    selector: '[maxlength][csFormControlName]',
    providers: [MAX_LENGTH_VALIDATOR],
})
export class CSMaxLengthValidator extends MaxLengthValidator { }

@Directive({
    selector: '[pattern][csFormControlName]',
    providers: [PATTERN_VALIDATOR],
})
export class CSPatternValidator extends PatternValidator { }

@Directive({
    selector: '[csFormControlName][validators]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => csFormControlNameValidator),
        multi: true,
    }],
})
export class csFormControlNameValidator implements Validator {

    private _validators: ValidatorFn | ValidatorFn[] | null = null;
    private _validatorFn: ValidatorFn | null = null;

    @Input()
    get validators(): ValidatorFn | ValidatorFn[] | null { return this._validators; }
    set validators(value: ValidatorFn | ValidatorFn[] | null | undefined) {
        this._validators = value ?? null;
        if (value != null) {
            this._validatorFn = Validators.compose(Array.isArray(value) ? value : [value]);
        }
    }

    validate(control: AbstractControl): ValidationErrors | null {
        if (!this._validatorFn)
            return null;
        return this._validatorFn(control);
    }
}

@Directive({
    selector: '[csFormControlName][asyncValidators]',
    providers: [{
        provide: NG_ASYNC_VALIDATORS,
        useExisting: forwardRef(() => csFormControlNameAsyncValidator),
        multi: true,
    }],
})
export class csFormControlNameAsyncValidator implements AsyncValidator {

    private _asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | null = null;
    private _activeValidatorFn: AsyncValidatorFn | null = null;

    @Input()
    get asyncValidators(): AsyncValidatorFn | AsyncValidatorFn[] | null { return this._asyncValidators; }
    set asyncValidators(value: AsyncValidatorFn | AsyncValidatorFn[] | null | undefined) {
        this._asyncValidators = value ?? null;
        if (value != null) {
            this._activeValidatorFn = Validators.composeAsync(Array.isArray(value) ? value : [value]);
        }
    }

    validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        if (!this._activeValidatorFn)
            return of(null);
        return this._activeValidatorFn(control);
    }
}

@Directive({
    selector: 'cs-form-section[csFormControlName],cs-localizable-input[required]',
    providers: [GROUP_VALIDATOR],
})
export class CSGroupValidator implements Validator {
    private _injector = inject(Injector);
    private _formGroup?: FormGroup | null = null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate(control: AbstractControl): ValidationErrors | null {
        const grp = this.getFormGroup();
        if (grp && !grp.valid)
            return jsonMap(grp.controls, v => v.errors, true);
        return null;
    }

    private getFormGroup() {
        if (this._formGroup == null)
            this._formGroup = this._injector.get(CODINUS_FORM_SECTION, null, { self: true })?.form;

        return this._formGroup;
    }
}

@Directive()
export abstract class CSFormValidator implements Validator {
    private _injector = inject(Injector);
    private _validator?: ICSFormValidator | null = null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate(control: AbstractControl): ValidationErrors | null {
        const validator = this.getValidator();
        if (validator)
            return validator.validate();
        return null;
    }

    private getValidator() {
        if (this._validator == null)
            this._validator = this._injector.get(CODINUS_FORM_VALIDATOR, null, { self: true });

        return this._validator;
    }
}

@Directive({
    selector: 'cs-form-section-array[csFormControlName],cs-form-section-array[formControlName],cs-form-section-array[formControl],cs-form-section-array[ngModel]',
    providers: [Array_VALIDATOR],
})
export class CSSectionArrayValidator extends CSFormValidator {
}

export const CODINUS_FORM_VALIDATOR_DIRECTIVES = [
    CSMaxValidator,
    CSMinValidator,
    CSRequiredValidator,
    CSCheckboxRequiredValidator,
    CSEmailValidator,
    CSMinLengthValidator,
    CSMaxLengthValidator,
    CSPatternValidator,
    CSGroupValidator,
    CSSectionArrayValidator,
    csFormControlNameValidator,
    csFormControlNameAsyncValidator
] as const;