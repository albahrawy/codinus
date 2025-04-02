import { Directive, effect, input } from "@angular/core";
import { Nullable } from "@codinus/types";
import { CSCDKTableReorderColumns } from "../columns/reorder.directive";
import { CSTableDirective, CSTableDirectiveBase } from "../cs-table/cs-table.directive";
import { ICSTableTreeColumn } from "../cs-table/types";

@Directive({
    selector: `mat-table[cs-table][cs-table-tree]`,
    exportAs: 'csTableTree',
    host: { 'class': 'cs-table' },
    providers: [
        { provide: CSCDKTableReorderColumns, useExisting: CSTableTreeDirective },
        { provide: CSTableDirective, useExisting: CSTableTreeDirective },
    ]
})
export class CSTableTreeDirective<TRecord> extends CSTableDirectiveBase<TRecord> {
    treeColumn = input<Nullable<ICSTableTreeColumn<TRecord, unknown>>>(); // The column that contains the tree structure
    /**
     *
     */
    constructor() {
        super();
        effect(() => this._treeColumn.set(this.treeColumn()));
    }
}