import { Directive, booleanAttribute, computed, input } from "@angular/core";
import { toNumber } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { createMediaColumnProperty } from "./functions";

@Directive({
    selector: ':not([layout-flex-element])[flex-grid-element]',
    host: {
        'class': 'cs-flex-grid-element',
        '[class.cs-flex-grid-element-new-row]': 'flexNewRow()',
        '[class.cs-flex-grid-element-full-row]': 'flexFullRow()',
        '[style.order]': 'order()',
        '[style.--cs-flex-grid-column-span]': '_spans().default',
        '[style.--cs-flex-grid-column-span-xs]': '_spans().xs',
        '[style.--cs-flex-grid-column-span-sm]': '_spans().sm',
        '[style.--cs-flex-grid-column-span-md]': '_spans().md',
        '[style.--cs-flex-grid-column-span-lg]': '_spans().lg',
        '[style.--cs-flex-grid-column-span-xl]': '_spans().xl',
        '[style.--cs-flex-grid-column-span-sl]': '_spans().sl',
    },
})
export class CSGridFlexElementDirective {

    protected _spans = computed(() => createMediaColumnProperty(this.gridColumn()));

    gridColumn = input<Nullable<string | number[]>>(null, { alias: 'flex-grid-column-span' });
    order = input(null, { alias: 'flex-grid-order', transform: (v: Nullable<string | number>) => v == null ? null : toNumber(v) });
    flexNewRow = input(false, { transform: booleanAttribute, alias: 'flex-grid-new-row' });
    flexFullRow = input(false, { transform: booleanAttribute, alias: 'flex-grid-full-row' });

}