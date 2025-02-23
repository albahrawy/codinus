import { ChangeDetectionStrategy, Component, TemplateRef, booleanAttribute, computed, input, viewChild } from "@angular/core";
import { arrayPopulate, toNumber } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { GridFlexContainerBase } from "@ngx-codinus/core/layout";

const FORM_AREA_HIDEEN_CSS_CLASS = 'cs-form-area-hidden-panel';

@Component({
    selector: 'cs-form-area-panel',
    template: `<ng-template #template><ng-content></ng-content></ng-template>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CSFormAreaPanel extends GridFlexContainerBase {

    label = input<Nullable<string>>(null);
    icon = input<Nullable<string>>(null);
    hidden = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
    invisible = input(false, { transform: booleanAttribute });
    labelClass = input('', { transform: (v: Nullable<string>) => v ?? '' });
    bodyClass = input('', { transform: (v: Nullable<string>) => v ?? '' });
    accordionExpanded = input(false, { transform: booleanAttribute });

    template = viewChild.required('template', { read: TemplateRef });

    tabLabelClasses = computed(() => arrayPopulate([FORM_AREA_HIDEEN_CSS_CLASS, this.invisible()], [this.labelClass()]));
    tabBodyClasses = computed(() => arrayPopulate([FORM_AREA_HIDEEN_CSS_CLASS, this.invisible()], [this.bodyClass()]));

    flexGridColumn = input<Nullable<string | number[]>>(null, { alias: 'flex-grid-column-span' });
    flexOrder = input(null, { alias: 'flex-grid-order', transform: (v: Nullable<string | number>) => v == null ? null : toNumber(v) });
    flexNewRow = input(false, { transform: booleanAttribute, alias: 'flex-grid-new-row' });
}