import { CdkColumnDef } from "@angular/cdk/table";
import { Component, computed, inject } from "@angular/core";
import { CODINUS_LOCALIZER, CSDefaultLocalizer } from "@ngx-codinus/cdk/localization";
import { CSDefaultColumnDataDef, CSTableColumnDataDef, CSTableDataSourceDirective } from "../data";

@Component({
    selector: 'mat-footer-cell[reactive],cdk-footer-cell[reactive]',
    template: `<span class="cs-table-cell-text cs-table-footer-cell-text">{{formattedValue()}}</span>`,
})
export class CSTableFooterReactiveCell {
    private columnDataDef = inject(CSTableColumnDataDef, { optional: true }) ??
        new CSDefaultColumnDataDef(inject(CdkColumnDef));
    protected localizer = inject(CODINUS_LOCALIZER, { optional: true }) ?? inject(CSDefaultLocalizer);
    private dataSourceDirective = inject(CSTableDataSourceDirective);

    value = computed(() => {
        this.dataSourceDirective.getData();
        return this.columnDataDef.cellValueAccessor().getFooterValue();
    });

    formattedValue = computed(() => {
        return this.columnDataDef.cellValueAccessor().formatFooter(this.value(), this.localizer.currentLang());
    });
}