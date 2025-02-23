import { Component, computed } from '@angular/core';
import { jsonParse } from '@codinus/js-extensions';
import { IStringRecord } from '@codinus/types';
import { CodinusFormsModule } from '@ngx-codinus/core/forms';
import { CODINUS_CDK_FLEX_DIRECTIVES } from '@ngx-codinus/core/layout';
import { CSLocalizableInput } from '../../sections/cs-localizable-input/cs-localizable-input';
import { CSRunTimeFormValidableElementBase } from '../cs-element-base/form-element-validable-base';
import { ICSRuntimeFormFieldLocalizable } from './_types';

@Component({
    selector: 'cs-runtime-form-element-localizable',
    template: `
            <cs-localizable-input [flex-grid-columns]="config().flexColumns" 
            [flex-grid-align]="config().flexAlign" [flex-grid-gap]="config().flexGap"
            [csFormControlName]="config().dataKey" [required]="requiredLang()" 
            [asyncValidators]="asyncValidator()" [validators]="validator()">
            </cs-localizable-input>
    `,
    imports: [CodinusFormsModule, CSLocalizableInput, ...CODINUS_CDK_FLEX_DIRECTIVES],
})

export class CSFormElementLocalizable extends CSRunTimeFormValidableElementBase<ICSRuntimeFormFieldLocalizable, IStringRecord> {

    protected requiredLang = computed(() => {
        const configRequired = this.config().required;
        if (typeof configRequired === 'string') {
            if (configRequired) {
                const realValue = configRequired.replace(/'/g, '"');
                return jsonParse<boolean | string[]>(realValue);
            }
        } else
            return configRequired;
        return null;
    });

}
