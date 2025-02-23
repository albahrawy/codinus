import { Component } from '@angular/core';
import { CSNumericInput } from '@ngx-codinus/material/inputs';
import { CSRunTimeFormValidableElementBase } from '../cs-element-base/form-element-validable-base';
import { ELEMENT_IMPORTS } from './_internal';
import { ICSRuntimeFormFieldNumber } from './_types';

@Component({
    selector: 'cs-runtime-form-element-number',
    template: `
            <input matInput [readonly]="config().readOnly" inputType="numeric" [mode]="config().mode"
            [allowArrowKeys]="config().allowArrowKeys" [currency]="config().currency" [step]="config().step"
            [required]="!!config().required" type="text" [max]="config().max!" [min]="config().min!" 
            [allowClear]="config().allowClear" [locale]="config().locale" [thousandSeparator]="config().thousandSeparator" 
            [percentage]="config().percentage" [decimalDigits]="config().decimalDigits" 
            [csFormControlName]="config().dataKey" [defaultValue]="defaultValue()" 
            [showButtons]="config().showButton" [verticalButton]="config().verticalButton"
            [asyncValidators]="asyncValidator()" [validators]="validator()" />
    `,
    imports: [...ELEMENT_IMPORTS, CSNumericInput],
})

export class CSFormElementNumber extends CSRunTimeFormValidableElementBase<ICSRuntimeFormFieldNumber, number> {
}