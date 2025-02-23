import { computed, Directive } from "@angular/core";
import { AsyncValidatorFn, ValidatorFn } from "@angular/forms";
import { CSRunTimeFormElementBase } from "./form-element-base";
import { ICSRuntimeFormFieldHasDefaultValue } from "./types";

@Directive()
export abstract class CSRunTimeFormValidableElementBase<TConfig extends ICSRuntimeFormFieldHasDefaultValue, TValue>
    extends CSRunTimeFormElementBase<TConfig, TValue> {

    asyncValidator = this.signalFunctionOf<AsyncValidatorFn>("AsyncValidator");
    validator = this.signalFunctionOf<ValidatorFn>("Validator");
    defaultValue = computed(() => this.getDefaultValue());

    protected getDefaultValue() {
        return this.config().defaultValue;
    }
}