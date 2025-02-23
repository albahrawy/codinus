import { Component, computed } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { CSRunTimeFormValidableElementBase } from '../cs-element-base/form-element-validable-base';
import { ELEMENT_IMPORTS } from './_internal';
import { ICSRuntimeFormFieldSlideToggle } from './_types';

@Component({
    selector: 'cs-runtime-form-element-slide-toggle',
    template: `
            <mat-slide-toggle [labelPosition]="labelPosition()" [class]="config().cssClass" [csFormControlName]="config().dataKey" 
            [defaultValue]="defaultValue()" [asyncValidators]="asyncValidator()" 
            [validators]="validator()">{{(config().label|csTranslate)()}}</mat-slide-toggle>

    `,
    imports: [...ELEMENT_IMPORTS, MatSlideToggleModule, CSTranslatePipe],
})

export class CSFormElementSlideToggle extends CSRunTimeFormValidableElementBase<ICSRuntimeFormFieldSlideToggle, boolean> {
    protected labelPosition = computed(() => this.config().labelPosition ?? 'after');
}