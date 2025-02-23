import { Directive, booleanAttribute, computed, input } from "@angular/core";
import { getProperCssValue } from "@codinus/dom";
import { toNumber } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { createFlexMediaInfo } from "./functions";

@Directive({
    selector: ':not(cs-form-area-panel)[layout-flex-element]',
    host: {
        'class': 'layout-flex-element',
        '[style.order]': 'order()',
        '[style.--layout-flex-basis]': 'basis().default',
        '[class.--flex-limit]': 'flexLimit()',
        '[style.--layout-flex-basis-xs]': 'basis().xs',
        '[style.--layout-flex-basis-sm]': 'basis().sm',
        '[style.--layout-flex-basis-md]': 'basis().md',
        '[style.--layout-flex-basis-lg]': 'basis().lg',
        '[style.--layout-flex-basis-xl]': 'basis().xl',
        '[style.--layout-flex-basis-sl]': 'basis().sl',
    },
})
export class LayoutFlexElementDirective {

    protected basis = computed(() => createFlexMediaInfo(this.flexBasis(), v => getProperCssValue(v)));

    flexBasis = input<Nullable<string>>(null, { alias: 'flex-basis' });
    flexLimit = input(false, { transform: booleanAttribute, alias: 'flex-limit' });
    order = input(null, { alias: 'flex-order', transform: (v: Nullable<string | number>) => v == null ? null : toNumber(v) });

}