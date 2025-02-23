import { Component } from '@angular/core';
import { CSMaskInput } from '@ngx-codinus/material/inputs';
import { CSRunTimeFormValidableElementBase } from '../cs-element-base/form-element-validable-base';
import { ELEMENT_IMPORTS } from './_internal';
import { ICSRuntimeFormFieldMaskedText } from './_types';

@Component({
    selector: 'cs-runtime-form-element-masked',
    template: `
            <input matInput [readonly]="config().readOnly"
            [required]="!!config().required" type="text" [maxlength]="config().maxlength!"
            [minlength]="config().minlength!" [allowClear]="config().allowClear" 
            [mask]="config().mask" [placeHolderChar]="config().placeHolderChar"
            [csFormControlName]="config().dataKey" [defaultValue]="defaultValue()" 
            [useUnmaskValue]="config().useUnmaskValue" [clearOnInvalid]="config().clearOnInvalid"
            [asyncValidators]="asyncValidator()" [validators]="validator()" />
    `,
    imports: [...ELEMENT_IMPORTS, CSMaskInput],
})

export class CSFormElementMaskedText extends CSRunTimeFormValidableElementBase<ICSRuntimeFormFieldMaskedText, string> { }