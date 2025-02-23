import { computed, Directive, ElementRef, inject } from "@angular/core";
import { CODINUS_LOCALIZER, CSDefaultLocalizer } from "@ngx-codinus/cdk/localization";
import { CSTableColumnDataDef, CODINUS_DATA_SOURCE_DIRECTIVE } from "../data";
import { CSRowDataContextBase } from "../data/data-context.directive";

@Directive()
export abstract class CSTableReactiveCellBase<TRecord, TValue = unknown> extends CSRowDataContextBase<TRecord> {
    protected _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
    protected columnDataDef = inject<CSTableColumnDataDef<TRecord, TValue>>(CSTableColumnDataDef);
    protected localizer = inject(CODINUS_LOCALIZER, { optional: true }) ?? inject(CSDefaultLocalizer);
    private dataSourceDirective = inject(CODINUS_DATA_SOURCE_DIRECTIVE);

    valueAccessor = computed(() => this.columnDataDef.cellValueAccessor());

    value = computed(() => {
        this.dataSourceDirective.getData();
        return this.valueAccessor().getValue(this.rowData);
    });

    formattedValue = computed(() => {
        return this.valueAccessor().formatValue(this.value(), this.localizer.currentLang());
    });
}