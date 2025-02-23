import { CdkColumnDef } from '@angular/cdk/table';
import {
    Component, Directive, Input, OnInit, booleanAttribute,
    computed, inject, input
} from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CODINUS_TABLE_API_REGISTRAR } from '../api';
import { CSTableColumnDataDef } from '../data/dataDef.directive';
import { isSupportMatSort } from '../data/functions';
import { CODINUS_DATA_SOURCE_DIRECTIVE, ICSSupportMatSortDataSource } from '../data/types';

//TODO: think about local compare
@Component({
    selector: 'mat-header-cell[sortable], cdk-header-cell[sortable]',
    template: `<span class="cs-table-header-cell-body" [mat-sort-header]="dataKey()" [disabled]="!sortable()">
        <ng-content></ng-content></span>`,
    imports: [MatSortModule]
})
export class CSColumnSortable {

    protected readonly dataKey;
    sortable = input(false, { transform: booleanAttribute });

    constructor() {
        const _dataDef = inject(CSTableColumnDataDef, { optional: true });
        if (_dataDef) {
            this.dataKey = computed(() => _dataDef.dataKey());
        }
        else {
            const key = inject(CdkColumnDef).name;
            this.dataKey = () => key;
        }
    }
}

@Directive({
    selector: 'mat-table[sortable],cdk-table[sortable]',
    providers: [{ provide: MatSort, useExisting: CSTableSortableDirective }]
})
export class CSTableSortableDirective extends MatSort implements OnInit {

    private dataSourceDirective = inject(CODINUS_DATA_SOURCE_DIRECTIVE, { optional: true });
    private _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });
    private _prevDs?: ICSSupportMatSortDataSource;

    override ngOnInit(): void {
        this._apiRegistrar?.register('sortableDirective', this);
        this.dataSourceDirective?.dataSourceChanged
            .subscribe(ds => {
                if (this._prevDs)
                    this._prevDs.sort = null;
                if (isSupportMatSort(ds)) {
                    ds.sort = this;
                    this._prevDs = ds;
                }
            })
        super.ngOnInit();
    }

    @Input({ transform: booleanAttribute })
    get sortable(): boolean { return !this.disabled; }
    set sortable(value: boolean) { this.disabled = !value; }
}