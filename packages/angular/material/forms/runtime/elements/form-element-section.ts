import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CODINUS_REACTIVE_FORMS } from '@ngx-codinus/core/forms';
import { CSFormSection } from '../../sections/cs-form-section';
import { CSRunTimeFormValidableElementBase } from '../cs-element-base/form-element-validable-base';
import { CSRunTimeFormTemplate } from '../cs-form-template.pipe';
import { ICSRuntimeFormFieldSection } from './_types';

@Component({
    selector: 'cs-runtime-form-section',
    template: `
            <cs-form-section #section [required]="!!config().required" 
            [csFormControlName]="config().dataKey" [asyncValidators]="asyncValidator()" [validators]="validator()">
            @for (element of config().children; track element) {
                @if(!element.renderState?.hidden()){
                    <ng-container *ngTemplateOutlet="templates()|csFormTemplate:element.templateName:element.type; 
                    context: {$implicit:element,section}"></ng-container>
                }
            }
            </cs-form-section>
    `,
    imports: [ReactiveFormsModule, CODINUS_REACTIVE_FORMS, CSFormSection, NgTemplateOutlet, CSRunTimeFormTemplate],
})

export class CSFormElementSection extends CSRunTimeFormValidableElementBase<ICSRuntimeFormFieldSection, unknown> { }
