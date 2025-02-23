import { Component } from '@angular/core';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { CodinusFormsModule } from '@ngx-codinus/core/forms';
import { CSFormArea } from '../../sections/cs-form-area/cs-form-area';
import { CSFormAreaPanel } from '../../sections/cs-form-area/cs-form-area-panel';
import { CSRunTimeFormElementBase } from '../cs-element-base/form-element-base';
import { CSFormTemplateOutlet } from '../cs-form-template-outlet';
import { CODINUS_RUNTIME_FORM_SECTION } from '../injection-tokens';
import { ICSRunTimeFormFieldArea } from './_types';

@Component({
    selector: 'cs-runtime-form-area',
    template: `
        <cs-form-area [displayType]="config().displayType" [flex-grid-align]="config().flexAlign" 
            [flex-grid-gap]="config().flexGap" [flex-grid-columns]="config().flexColumns" 
            [cardWhensingle]="config().cardWhensingle" [tabsAnimationDuration]="config().tabsAnimationDuration"
            [tabsDynamicHeight]="config().tabsDynamicHeight" [tabsPosition]="config().tabsPosition"
            [tabsPreserveContent]="config().tabsPreserveContent" [tabsStretch]="config().tabsStretch"
            [accordionDisplayMode]="config().accordionDisplayMode"
            [accordionHideToggle]="config().accordionHideToggle" [accordionMulti]="config().accordionMulti"
            [accordionTogglePosition]="config().accordionTogglePosition">
            @for (panel of config().panels; track panel;) {
                <cs-form-area-panel [label]="(panel.label|csTranslate)()" [icon]="panel.labelIcon"
                    [flex-grid-align]="panel.flexAlign" [flex-grid-gap]="panel.flexGap" [flex-grid-columns]="panel.flexColumns" 
                    [labelClass]="panel.labelClass" [bodyClass]="panel.bodyClass"
                    [hidden]="panel.renderState?.hidden()" [invisible]="panel.renderState?.invisible()"
                    [accordionExpanded]="panel.accordionExpanded">
                    @for (element of panel.children; track element) {
                        @if(!element.renderState?.hidden()){
                            <ng-container *csFormTemplateOutlet="element"></ng-container>
                        }
                    }
                </cs-form-area-panel>
            }
        </cs-form-area>
    `,
    imports: [
        CodinusFormsModule, CSFormAreaPanel, CSFormArea, CSFormTemplateOutlet,
        CSTranslatePipe
    ],
    providers: [{ provide: CODINUS_RUNTIME_FORM_SECTION, useExisting: CSFormElementArea }]
})

export class CSFormElementArea extends CSRunTimeFormElementBase<ICSRunTimeFormFieldArea, unknown> {
}