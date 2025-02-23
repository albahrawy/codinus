import {
    CSCheckboxRequiredValidator, CSEmailValidator, csFormControlNameAsyncValidator,
    csFormControlNameValidator, CSGroupValidator, CSMaxLengthValidator, CSMaxValidator,
    CSMinLengthValidator, CSMinValidator, CSPatternValidator, CSRequiredValidator, CSSectionArrayValidator
} from './directives/validators';
import {
    CSCheckboxControlValueAccessor, CSDefaultValueAccessor, CSRadioControlValueAccessor,
    CSRangeValueAccessor, CSSelectControlValueAccessor, CSSelectMultipleControlValueAccessor
} from "./directives/value_accessors";
import { CSFormControlName, CSSectionFormControlName } from "./directives/form-control-name";
import { CSFormGroupDirective } from "./directives/form-group-directive";
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

export * from './directives/form-control-name';
export * from './directives/form-group-directive';
export * from './directives/form-group-directive-base';
export * from './directives/validators';
export * from './directives/value_accessors';
export * from './directives/injector-tokens';
export * from './models/form-group';
export * from './models/section-form-control';
export * from './functions';

const CODINUS_FORM_VALIDATOR_DIRECTIVES = [
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
];

const CODINUS_DEFAULT_VALUE_ACCESSORS = [
    CSDefaultValueAccessor,
    CSCheckboxControlValueAccessor,
    CSRadioControlValueAccessor,
    CSRangeValueAccessor,
    CSSelectMultipleControlValueAccessor,
    CSSelectControlValueAccessor
];

const CODINUS_REACTIVE_FORMS = [
    ReactiveFormsModule, CSFormControlName, CSFormGroupDirective, CSSectionFormControlName,
    ...CODINUS_DEFAULT_VALUE_ACCESSORS,
    ...CODINUS_FORM_VALIDATOR_DIRECTIVES,
];


@NgModule({
    imports: CODINUS_REACTIVE_FORMS,
    exports: CODINUS_REACTIVE_FORMS,
})
export class CodinusFormsModule { }