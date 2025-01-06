import { CdkFooterRowDef, CdkHeaderRowDef, CdkTable } from '@angular/cdk/table';
import { AfterViewInit, Directive, booleanAttribute, effect, inject, input, untracked } from '@angular/core';
import { CODINUS_TABLE_API_REGISTRAR } from './types';
import { forceInputSet } from '@ngx-codinus/core/shared';

@Directive({
    selector: `mat-table[showHeader],cdk-table[showHeader],
               mat-table[showFooter],cdk-table[showFooter],
               mat-table[showFilter],cdk-table[showFilter]`,
})
export class CSTableMetaRowsVisiblity implements AfterViewInit {

    private _allHeaderRowDefs: CdkHeaderRowDef[] = [];
    private _realHeaderRowDefs: CdkHeaderRowDef[] = [];
    private _filterRowDefs: CdkHeaderRowDef[] = [];
    private _contentFooterRowDefs: CdkFooterRowDef[] = [];
    private _table = inject(CdkTable, { self: true });
    private _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });

    constructor() {
        this._apiRegistrar?.register('metaRowDirective', this);
        effect(() => this._updateHeaderState(this.showHeader(), this.showFilter()));
        effect(() => this._updateFooterState(this.showFooter()));
    }

    //#region inputs

    showHeader = input(true, { transform: booleanAttribute })
    showFilter = input(true, { transform: booleanAttribute })
    showFooter = input(false, { transform: booleanAttribute })

    //#endregion

    getVisibility(key: 'header' | 'filter' | 'footer') {
        const propKey = this.getPropKey(key);
        if (!propKey)
            return false;
        return untracked(() => this[propKey]());
    }

    setVisibility(key: 'header' | 'filter' | 'footer', value: boolean) {
        const propKey = this.getPropKey(key);
        if (!propKey)
            return;
        forceInputSet(this[propKey], value);
    }

    ngAfterViewInit() {
        this._allHeaderRowDefs = this._table._contentHeaderRowDefs.toArray();
        this._realHeaderRowDefs = this._allHeaderRowDefs.filter(v => v.constructor.name !== '_CdkFilterRowDef');
        this._filterRowDefs = this._allHeaderRowDefs.filter(v => v.constructor.name === '_CdkFilterRowDef');
        this._contentFooterRowDefs = this._table._contentFooterRowDefs.toArray();
    }

    private getPropKey(key: string) {
        return key === 'header'
            ? 'showHeader'
            : key === 'filter'
                ? 'showFilter'
                : key === 'footer'
                    ? 'showFooter'
                    : null;
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

        //@ts-expect-error call private member
        this._table._headerRowDefChanged = true;
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
            //@ts-expect-error call private member
            this._table._footerRowDefChanged = true;
    }
}