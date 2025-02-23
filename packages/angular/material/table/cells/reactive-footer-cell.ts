import { Component, computed, inject } from "@angular/core";
import { CODINUS_LOCALIZER, CSDefaultLocalizer } from "@ngx-codinus/cdk/localization";
import { CODINUS_DATA_SOURCE_DIRECTIVE, CSTableColumnDataDef } from "../data";

@Component({
    selector: 'mat-footer-cell[reactive],cdk-footer-cell[reactive]',
    template: `<span class="cs-table-cell-text cs-table-footer-cell-text">{{formattedValue()}}</span>`,
})
export class CSTableFooterReactiveCell {
    private columnDataDef = inject(CSTableColumnDataDef);
    protected localizer = inject(CODINUS_LOCALIZER, { optional: true }) ?? inject(CSDefaultLocalizer);
    private dataSourceDirective = inject(CODINUS_DATA_SOURCE_DIRECTIVE);

    value = computed(() => {
        this.dataSourceDirective.getData();
        return this.columnDataDef.cellValueAccessor().getFooterValue();
    });

    formattedValue = computed(() => {
        return this.columnDataDef.cellValueAccessor().formatFooter(this.value(), this.localizer.currentLang());
    });
}