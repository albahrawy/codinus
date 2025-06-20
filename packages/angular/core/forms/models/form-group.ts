import { FormGroup, isFormControl } from "@angular/forms";
import { jsonForEach, jsonMap } from "@codinus/js-extensions";
import { IGenericRecord } from "@codinus/types";
import { CSSectionFormControl } from "./section-form-control";
import { computed } from "@angular/core";

export class CSFormGroup extends FormGroup {
    private _csPendingValue: IGenericRecord | null = null;

    constructor(private _initialized = true) {
        super({});
    }

    getPendingValue(name: string) {
        // if (!name)
        //     return this._pendingValue;
        return this._csPendingValue?.[name];
    }

    isValid = computed(() => this._status() === 'VALID');

    override setValue(value: IGenericRecord, options?: { onlySelf?: boolean; emitEvent?: boolean; }): void {
        this._csPendingValue = value;
        jsonForEach(this.controls, (k, c) => c?.setValue(value?.[k], { onlySelf: true, emitEvent: options?.emitEvent }));
        this.updateValueAndValidity(options);
    }

    getDefaultValue(): IGenericRecord {
        return jsonMap(this.controls,
            ctrl => ctrl instanceof CSSectionFormControl || ctrl instanceof CSFormGroup
                ? ctrl.getDefaultValue()
                : isFormControl(ctrl)
                    ? ctrl.defaultValue
                    : undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    override reset(value?: any, options?: { onlySelf?: boolean; emitEvent?: boolean; }): void {
        this._csPendingValue = value;
        super.reset(value, options);
    }

    override updateValueAndValidity(opts?: { onlySelf?: boolean; emitEvent?: boolean; } | undefined): void {
        if (this._initialized)
            super.updateValueAndValidity(opts);
    }

    initialize() {
        this._initialized = true;
        this.updateValueAndValidity();
    }
}