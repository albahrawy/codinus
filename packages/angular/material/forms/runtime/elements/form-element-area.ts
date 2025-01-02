import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { CODINUS_REACTIVE_FORMS } from '@ngx-codinus/core/forms';
import { CSFormArea } from '../../sections/cs-form-area/cs-form-area';
import { CSFormAreaPanel } from '../../sections/cs-form-area/cs-form-area-panel';
import { CSRunTimeFormElementBase } from '../cs-element-base/form-element-base';
import { CSRunTimeFormTemplate } from '../cs-form-template.pipe';
import { ICSRunTimeFormFieldArea } from './_types';

@Component({
    selector: 'cs-runtime-form-area',
    template: `
        <cs-form-area [displayType]="config().displayType" [layout-flex]="config().layout"
            [flex-gap]="config().gap" [flex-columns]="config().columns" [layout-flex-align]="config().align"
            [cardWhensingle]="config().cardWhensingle" [tabsAnimationDuration]="config().tabsAnimationDuration"
            [tabsDynamicHeight]="config().tabsDynamicHeight" [tabsPosition]="config().tabsPosition"
            [tabsPreserveContent]="config().tabsPreserveContent" [tabsStretch]="config().tabsStretch"
            [accordionDisplayMode]="config().accordionDisplayMode"
            [accordionHideToggle]="config().accordionHideToggle" [accordionMulti]="config().accordionMulti"
            [accordionTogglePosition]="config().accordionTogglePosition">
            @for (panel of config().panels; track panel;) {
                <cs-form-area-panel [label]="(panel.label|csTranslate)()" [icon]="(panel.icon|csTranslate)()"
                    [layout-flex]="panel.layout" [flex-gap]="panel.gap" [layout-flex-align]="panel.align" 
                    [flexLimit]="panel.limit"  [labelClass]="panel.labelClass" [bodyClass]="panel.bodyClass"]
                    [hidden]="panel.renderState?.hidden()" [invisible]="panel.renderState?.invisible()"
                    [accordionExpanded]="panel.accordionExpanded">
                    @for (element of panel.children; track element) {
                        @if(!element.renderState?.hidden()){
                            <ng-container *ngTemplateOutlet="templates()|csFormTemplate:element.templateName:element.type; 
                            context: {$implicit:element,section:parentSection}"></ng-container>
                        }
                    }
                </cs-form-area-panel>
            }
        </cs-form-area>
    `,
    imports: [
        ReactiveFormsModule, CODINUS_REACTIVE_FORMS, CSFormAreaPanel, CSFormArea, NgTemplateOutlet,
        CSTranslatePipe, CSRunTimeFormTemplate
    ],
})

export class CSFormElementArea extends CSRunTimeFormElementBase<ICSRunTimeFormFieldArea, unknown> {
}