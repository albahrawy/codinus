import { ChangeDetectionStrategy, Component, TemplateRef, booleanAttribute, computed, input, viewChild } from "@angular/core";
import { populateArray } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { LayoutFlexContainerBaseDirective } from "@ngx-codinus/core/layout";

const FORM_AREA_HIDEEN_CSS_CLASS = 'cs-form-area-hidden-panel';

@Component({
    selector: 'cs-form-area-panel',
    template: `<ng-template #template><ng-content></ng-content></ng-template>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CSFormAreaPanel extends LayoutFlexContainerBaseDirective {

    label = input<string | null>(null);
    icon = input<string | null>(null);
    hidden = input(false, { transform: booleanAttribute });
    invisible = input(false, { transform: booleanAttribute });
    labelClass = input('', { transform: (v: Nullable<string>) => v ?? '' });
    bodyClass = input('', { transform: (v: Nullable<string>) => v ?? '' });
    accordionExpanded = input(false, { transform: booleanAttribute });

    template = viewChild.required('template', { read: TemplateRef });

    tabLabelClasses = computed(() => populateArray([FORM_AREA_HIDEEN_CSS_CLASS, this.invisible()], [this.labelClass()]));
    tabBodyClasses = computed(() => populateArray([FORM_AREA_HIDEEN_CSS_CLASS, this.invisible()], [this.bodyClass()]));
}