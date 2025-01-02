import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IStringRecord } from '@codinus/types';
import { CODINUS_REACTIVE_FORMS } from '@ngx-codinus/core/forms';
import { CODINUS_CDK_FLEX_DIRECTIVES } from '@ngx-codinus/core/layout';
import { CSLocalizableInput } from '../../sections/cs-localizable-input/cs-localizable-input';
import { CSRunTimeFormValidableElementBase } from '../cs-element-base/form-element-validable-base';
import { ICSRuntimeFormFieldLocalizable } from './_types';

@Component({
    selector: 'cs-runtime-form-element-localizable',
    template: `
            <cs-localizable-input   [layout-flex]="config().layout" [flex-columns]="config().columns" 
            [layout-flex-align]="config().align" [flex-gap]="config().gap"
            [csFormControlName]="config().dataKey" [required]="config().required" 
            [asyncValidators]="asyncValidator()" [validators]="validator()">
            </cs-localizable-input>
    `,
    imports: [ReactiveFormsModule, CODINUS_REACTIVE_FORMS, CSLocalizableInput, CODINUS_CDK_FLEX_DIRECTIVES],
})

export class CSFormElementLocalizable extends CSRunTimeFormValidableElementBase<ICSRuntimeFormFieldLocalizable, IStringRecord> {
}
