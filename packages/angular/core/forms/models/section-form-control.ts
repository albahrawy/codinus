/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormControl, FormControlState, FormGroup } from "@angular/forms";
import { CSSectionFormControlName as CSSectionFormControlName } from "../directives/form-control-name";
import { ɵWritable } from "@angular/core";

export class CSSectionFormControl extends FormControl {

    private _dir?: CSSectionFormControlName;
    private _subFormGroup: FormGroup | null = null;
    private _csPendingValue: any;

    /** @internal */
    setSectionFormName(dir: CSSectionFormControlName) {
        this._dir = dir;
    }

    getDefaultValue() {
        return this._dir?.defaultValue ?? null;
    }

    _setSubForm(subFormGroup: FormGroup | null) {
        if (this._subFormGroup != null && subFormGroup == null) {
            this._subFormGroup.setParent(null);
            this._subFormGroup = null;
            this.updateValueAndValidity();
        } else if (subFormGroup) {
            this._subFormGroup = subFormGroup;
            subFormGroup.setParent(this as any);
            this.updateValueAndValidity();
        }
    }

    get controls() { return this._subFormGroup?.controls ?? {} };

    override _updateValue(): void {
        (this as ɵWritable<this>).value = this._subFormGroup?.value ?? this._csPendingValue;
        this._csPendingValue = null;
    }

    override setValue(value: any, options?: { onlySelf?: boolean; emitEvent?: boolean; emitModelToViewChange?: boolean; emitViewToModelChange?: boolean; }): void {
        this._csPendingValue = value;
        super.setValue(value, options);
    }

    override reset(formState?: any, options?: { onlySelf?: boolean; emitEvent?: boolean; } | undefined): void {
        this._csPendingValue = isFormControlState(formState) ? formState.value : formState;
        super.setValue(formState, options);
    }
}

function isFormControlState(formState: unknown): formState is FormControlState<unknown> {
    return (
        typeof formState === 'object' &&
        formState !== null &&
        Object.keys(formState).length === 2 &&
        'value' in formState &&
        'disabled' in formState
    );
}