import { Directive, signal } from "@angular/core";
import { CSDataSource } from "@ngx-codinus/core/data";
import { CSTableDataSourceDirectiveBase } from "./datasource.directive";
import { CODINUS_DATA_SOURCE_DIRECTIVE } from "./types";

@Directive({
    selector: `mat-table-internal-datasource`,
    providers: [{ provide: CODINUS_DATA_SOURCE_DIRECTIVE, useExisting: CSTableInternalDataSourceDirective }]
})
export class CSTableInternalDataSourceDirective<TRecord = unknown> extends CSTableDataSourceDirectiveBase<TRecord> {
    override dataSource = signal<CSDataSource<TRecord>>(null);

}