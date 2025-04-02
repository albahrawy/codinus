import { NgTemplateOutlet } from "@angular/common";
import {
    ChangeDetectionStrategy, Component, ViewEncapsulation,
    booleanAttribute, computed, contentChildren, input
} from "@angular/core";
import { MatCardAppearance, MatCardModule } from '@angular/material/card';
import { MatAccordionDisplayMode, MatAccordionTogglePosition, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from "@angular/material/icon";
import { MatStepperModule, StepperOrientation } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { Nullable } from "@codinus/types";
import { CODINUS_CDK_FLEX_DIRECTIVES, GridFlexContainerBase } from "@ngx-codinus/core/layout";
import { CSTabGroup, CSTabHeaderPosition } from "@ngx-codinus/material/tabs";
import { CSFormAreaType } from "../types";
import { CSFormAreaPanel } from "./cs-form-area-panel";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";

@Component({
    selector: 'cs-form-area',
    templateUrl: './cs-form-area.html',
    styleUrl: './cs-form-area.scss',
    imports: [NgTemplateOutlet, MatCardModule, MatIconModule, CODINUS_CDK_FLEX_DIRECTIVES,
        MatTabsModule, CSTabGroup, MatExpansionModule, MatStepperModule],
    host: {
        'class': 'cs-form-area',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: { displayDefaultIndicatorType: false },
        },
    ],
})
export class CSFormArea extends GridFlexContainerBase {
    //TODO: implement disable proeprty for all display types
    displayType = input<CSFormAreaType>();
    areaName = input<string>();

    cardWhensingle = input(false, { transform: booleanAttribute });
    tabsAnimationDuration = input('500ms', { transform: (v: Nullable<string | number>) => v ?? '500ms' });
    tabsPosition = input('above', { transform: (v: Nullable<CSTabHeaderPosition>) => v ?? 'above' });
    tabsDynamicHeight = input(false, { transform: booleanAttribute });
    tabsPreserveContent = input(false, { transform: booleanAttribute });
    tabsStretch = input(false, { transform: booleanAttribute });

    accordionDisplayMode = input('default', { transform: (v: Nullable<MatAccordionDisplayMode>) => v ?? 'default' });
    accordionHideToggle = input(false, { transform: booleanAttribute });
    accordionMulti = input(false, { transform: booleanAttribute });

    accordionTogglePosition = input('after', { transform: (v: Nullable<MatAccordionTogglePosition>) => v ?? 'after' });
    cardAppearance = input('outlined', { transform: (v: Nullable<MatCardAppearance>) => v ?? 'outlined' });

    stepperOrientation = input('horizontal', { transform: (v: Nullable<StepperOrientation>) => v ?? 'horizontal' });
    stepperLinear = input(false);


    protected _panels = contentChildren(CSFormAreaPanel);

    protected _hasAccordionIcon = computed(() =>
        this.displayType() === 'accordion' && this._panels().some(p => p.icon()));

    protected _choosedDisplayType = computed(() =>
        this._panels().length === 1 && this.cardWhensingle()
            ? 'card'
            : this.displayType());
}