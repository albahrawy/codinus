import { Component } from '@angular/core';
import { CSRunTimeFormValidableElementBase } from '../cs-element-base/form-element-validable-base';
import { ICSRuntimeFormFieldText } from './_types';
import { ELEMENT_IMPORTS } from './_internal';

@Component({
    selector: 'cs-runtime-form-element-text',
    template: `
            <input matInput [readonly]="config().readOnly" [initialDisableStatus]="config().disabled"
            [required]="!!config().required" type="text" [maxlength]="config().maxlength!"
            [minlength]="config().minlength!" [allowClear]="config().allowClear"
            [csFormControlName]="config().dataKey" [defaultValue]="defaultValue()" 
            [asyncValidators]="asyncValidator()" [validators]="validator()" />
    `,
    imports: [...ELEMENT_IMPORTS],
})

export class CSFormElementText extends CSRunTimeFormValidableElementBase<ICSRuntimeFormFieldText, string> { }