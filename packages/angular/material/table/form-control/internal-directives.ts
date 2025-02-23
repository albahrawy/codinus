import { Directive, signal } from "@angular/core";
import { CSDataSource } from "@ngx-codinus/core/data";
import { ICSTableApiEditable } from "../api/types";
import { CSTableDataSourceDirectiveBase } from "../data/datasource.directive";
import { CODINUS_DATA_SOURCE_DIRECTIVE } from "../data/types";
import { CSTableApiEditModelBase } from "../editors/table-api-editable-model";

export class CSTableApiEditModel
    extends CSTableApiEditModelBase implements ICSTableApiEditable {

    get editable() { return true; }
    set editable(value: boolean) { throw new Error("Editable property is read only for CSTableFormInput") }
}

@Directive({
    selector: `mat-table-input-datasource`,
    providers: [{ provide: CODINUS_DATA_SOURCE_DIRECTIVE, useExisting: CSTableInputDataSourceDirective }]
})
export class CSTableInputDataSourceDirective<TRecord = unknown> extends CSTableDataSourceDirectiveBase<TRecord> {
    override dataSource = signal<CSDataSource<TRecord>>(null);

}