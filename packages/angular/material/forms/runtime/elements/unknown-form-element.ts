import { Component, ViewEncapsulation } from '@angular/core';
import { CSMatFormFieldControl } from '@ngx-codinus/material/inputs';
import { CSRunTimeFormElementBase } from '../cs-element-base/form-element-base';
import { ICSRuntimeFormFieldBase } from '../cs-element-base/types';

@Component({
    selector: 'cs-runtime-form-element-unknown',
    template: `<div csMatFormFieldControl [floatLabel]="true">Not Implemented</div>`,
    encapsulation: ViewEncapsulation.None,
    imports: [CSMatFormFieldControl],
})
export class CSFormElementUnknown extends CSRunTimeFormElementBase<ICSRuntimeFormFieldBase, null> {
}