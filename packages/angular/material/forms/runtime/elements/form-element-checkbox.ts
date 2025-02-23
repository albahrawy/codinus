import { Component, computed } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { CSRunTimeFormValidableElementBase } from '../cs-element-base/form-element-validable-base';
import { ELEMENT_IMPORTS } from './_internal';
import { ICSRuntimeFormFieldCheckBox } from './_types';

@Component({
    selector: 'cs-runtime-form-element-checkbox',
    template: `
            <mat-checkbox [labelPosition]="labelPosition()" [class]="config().cssClass" [csFormControlName]="config().dataKey" 
            [defaultValue]="defaultValue()" [asyncValidators]="asyncValidator()" 
            [validators]="validator()">{{(config().label|csTranslate)()}}</mat-checkbox>

    `,
    imports: [...ELEMENT_IMPORTS, MatCheckboxModule, CSTranslatePipe],
})

export class CSFormElementCheckBox extends CSRunTimeFormValidableElementBase<ICSRuntimeFormFieldCheckBox, boolean> {
    protected labelPosition = computed(() => this.config().labelPosition ?? 'after');
}