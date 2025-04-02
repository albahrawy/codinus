import { BaseRowDef, CdkFooterRowDef, CdkHeaderRowDef, CdkRowDef } from "@angular/cdk/table";
import { contentChildren, Directive, effect, input, SimpleChange } from "@angular/core";
import { booleanTrueAttribute } from "@ngx-codinus/core/shared";

@Directive({
    selector: `cdk-table:not([cs-table])[auto-columns], mat-table:not([cs-table])[auto-columns]`,
})
export class CSTableDisplayedColumns {
    
    private _contentHeaderRowDefs = contentChildren(CdkHeaderRowDef);
    private _contentFooterRowDefs = contentChildren(CdkFooterRowDef);
    private _contentRowDefs = contentChildren(CdkRowDef);

    constructor() {
        effect(() => {
            const columns = this.displayedColumns();
            this._contentHeaderRowDefs().forEach(h => this._assignColumns(h, columns));
            this._contentFooterRowDefs().forEach(f => this._assignColumns(f, columns));
            this._contentRowDefs().forEach(r => this._assignColumns(r, columns));
        });

        effect(() => this._contentHeaderRowDefs().forEach(h => h.sticky = this.stickyHeader()));
        effect(() => this._contentFooterRowDefs().forEach(f => f.sticky = this.stickyFooter()));
    }

    private _assignColumns(rowDef: BaseRowDef, columns: string[]): void {
        rowDef.columns = columns;
        rowDef.ngOnChanges({ columns: new SimpleChange(null, columns, false) });
    }

    displayedColumns = input<string[]>([]);
    stickyHeader = input(true, { transform: booleanTrueAttribute });
    stickyFooter = input(true, { transform: booleanTrueAttribute });
}