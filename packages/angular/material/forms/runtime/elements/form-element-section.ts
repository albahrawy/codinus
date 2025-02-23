import { Component } from '@angular/core';
import { CodinusFormsModule } from '@ngx-codinus/core/forms';
import { CSFormSection } from '../../sections/cs-form-section';
import { CSRunTimeFormValidableElementBase } from '../cs-element-base/form-element-validable-base';
import { CSFormTemplateOutlet } from '../cs-form-template-outlet';
import { CODINUS_RUNTIME_FORM_SECTION } from '../injection-tokens';
import { ICSRuntimeFormFieldSection } from './_types';

@Component({
    selector: 'cs-runtime-form-section',
    template: `
            <cs-form-section #section [required]="!!config().required" 
            [csFormControlName]="config().dataKey" [asyncValidators]="asyncValidator()" [validators]="validator()">
            @for (element of config().children; track element) {
                @if(!element.renderState?.hidden()){
                    <ng-container *csFormTemplateOutlet="element;section:section"></ng-container>
                }
            }
            </cs-form-section>
    `,
    imports: [CodinusFormsModule, CSFormSection, CSFormTemplateOutlet],
    providers: [{ provide: CODINUS_RUNTIME_FORM_SECTION, useExisting: CSFormElementSection }]
})

export class CSFormElementSection extends CSRunTimeFormValidableElementBase<ICSRuntimeFormFieldSection, unknown> { }
