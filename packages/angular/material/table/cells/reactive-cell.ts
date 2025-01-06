import { CdkColumnDef } from "@angular/cdk/table";
import { Component, computed, inject } from "@angular/core";
import { CODINUS_LOCALIZER, CSDefaultLocalizer } from "@ngx-codinus/cdk/localization";
import { CSDefaultColumnDataDef, CSTableColumnDataDef, CSTableDataSourceDirective } from "../data";
import { CSRowDataDirective } from "../data/row-data.directive";

@Component({
    selector: 'mat-cell[reactive],cdk-cell[reactive]',
    template: `<span class="cs-table-cell-text">{{formattedValue()}}</span>`,
    hostDirectives: [CSRowDataDirective],
})
export class CSTableReactiveCell {
    private columnDataDef = inject(CSTableColumnDataDef, { optional: true }) ??
        new CSDefaultColumnDataDef(inject(CdkColumnDef));
    protected localizer = inject(CODINUS_LOCALIZER, { optional: true }) ?? inject(CSDefaultLocalizer);
    private dataSourceDirective = inject(CSTableDataSourceDirective);
    private rowdataDirective = inject(CSRowDataDirective, { self: true });

    value = computed(() => {
        this.dataSourceDirective.getData();
        return this.columnDataDef.cellValueAccessor().getValue(this.rowdataDirective.data);
    });

    formattedValue = computed(() => {
        return this.columnDataDef.cellValueAccessor()
            .formatValue(this.value(), this.localizer.currentLang());
    });
}