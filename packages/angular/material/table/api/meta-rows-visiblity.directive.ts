import { CdkFooterRowDef, CdkHeaderRowDef, CdkTable } from '@angular/cdk/table';
import { AfterViewInit, Directive, booleanAttribute, effect, inject, input } from '@angular/core';
import { booleanTrueAttribute } from '@ngx-codinus/core/shared';
import { StandardMetaRowModel } from './meta-row-model';
import { CODINUS_TABLE_API_REGISTRAR } from './types';

@Directive({
    selector: `mat-table:not([cs-table])[showHeader],cdk-table:not([cs-table])[showHeader],
               mat-table:not([cs-table])[showFooter],cdk-table:not([cs-table])[showFooter],
               mat-table:not([cs-table])[showFilter],cdk-table:not([cs-table])[showFilter]`,
})
export class CSTableMetaRowsVisiblity implements AfterViewInit {

    private _allHeaderRowDefs: CdkHeaderRowDef[] = [];
    private _realHeaderRowDefs: CdkHeaderRowDef[] = [];
    private _filterRowDefs: CdkHeaderRowDef[] = [];
    private _contentFooterRowDefs: CdkFooterRowDef[] = [];
    private _table = inject(CdkTable, { self: true });
    private _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });

    constructor() {
        this._apiRegistrar?.register('metaRowDirective', new StandardMetaRowModel(this));
        effect(() => this._updateHeaderState(this.showHeader(), this.showFilter()));
        effect(() => this._updateFooterState(this.showFooter()));
    }

    //#region inputs

    showHeader = input(true, { transform: booleanTrueAttribute });
    showFilter = input(true, { transform: booleanTrueAttribute });
    showFooter = input(false, { transform: booleanAttribute });

    //#endregion

    ngAfterViewInit() {
        this._allHeaderRowDefs = this._table._contentHeaderRowDefs.toArray();
        this._realHeaderRowDefs = this._allHeaderRowDefs.filter(v => v.constructor.name !== '_CdkFilterRowDef');
        this._filterRowDefs = this._allHeaderRowDefs.filter(v => v.constructor.name === '_CdkFilterRowDef');
        this._contentFooterRowDefs = this._table._contentFooterRowDefs.toArray();
    }

    private _updateHeaderState(header: boolean, filter: boolean) {

        if (!this._table._contentHeaderRowDefs)
            return;

        if (header && filter) {
            this._table._contentHeaderRowDefs.reset(this._allHeaderRowDefs);
        } else if (header && !filter) {
            this._table._contentHeaderRowDefs.reset(this._realHeaderRowDefs);
        } else if (filter && !header) {
            this._table._contentHeaderRowDefs.reset(this._filterRowDefs);
        } else {
            this._table._contentHeaderRowDefs.reset([]);
        }

        this._table.removeHeaderRowDef(null as unknown as CdkHeaderRowDef);
        // _headerRowDefChanged = true;
    }

    private _updateFooterState(footer: boolean) {
        if (!this._table._contentFooterRowDefs)
            return;
        let changed = false;
        if (footer && this._table._contentFooterRowDefs.length == 0) {
            this._table._contentFooterRowDefs.reset(this._contentFooterRowDefs);
            changed = true;
        } else if (!footer && this._table._contentFooterRowDefs.length > 0) {
            this._table._contentFooterRowDefs.reset([]);
            changed = true;
        }
        if (changed)
            this._table.removeFooterRowDef(null as unknown as CdkFooterRowDef);
    }
}