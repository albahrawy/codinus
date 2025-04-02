/**
 * @license
  * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/albahrawy/ngx-codinus/blob/main/LICENSE
 */
import { Directive, effect, inject, input, Input } from "@angular/core";
import { IFunc, Nullable } from "@codinus/types";
import { CSDataSource } from "@ngx-codinus/core/data";
import { CSTableInternalDataSourceDirective } from "../data/internal-datasource.directive";
import { CODINUS_VIRTUAL_TABLE_DATA_HANDLER } from "../scroll/types";
import { CSTableVirtualScrollDataHandler } from '../scroll/virtual-scroll-data-handler';
import { CSTableTreeDataSource } from "./table-tree-data-source";
import { CSTreeNodeItem } from "./types";
import { Observable } from "rxjs";
import { getValue } from "@codinus/js-extensions";


@Directive({
    selector: `cdk-table:not([dataSource]):not([virtual-scroll])[cs-table-tree], 
               mat-table:not([dataSource]):not([virtual-scroll])[cs-table-tree]`,
    exportAs: 'csTableTree',
    hostDirectives: [CSTableInternalDataSourceDirective],
    providers: [{ provide: CODINUS_VIRTUAL_TABLE_DATA_HANDLER, useExisting: CSTableTreeRelationDataHandler }],
})
export class CSTableTreeRelationDataHandler<TData extends object, TKey = unknown> extends CSTableVirtualScrollDataHandler<TData> {

    private _internalDataSource = new CSTableTreeDataSource<TData, TKey>();
    private _dataSourceDirective = inject(CSTableInternalDataSourceDirective<TData>, { self: true });

    /**
     *
     */
    constructor() {
        super();
        this._dataSourceObserver.dataSource = this._internalDataSource;
        this._dataSourceDirective.dataSource.set(this._internalDataSource);

        effect(() => {
            const keyGetter = this.normalizeKeyGetter(this.keyGetter());
            const parentKeyGetter = this.normalizeKeyGetter(this.parentKeyGetter());

            this._internalDataSource.keyGetter = keyGetter;
            this._internalDataSource.parentKeyGetter = parentKeyGetter;
            this._internalDataSource.childrenAccessor = this.childrenAccessor();
        });
    }

    @Input('cs-table-tree')
    override get datasource(): CSDataSource<TData> {
        return this._internalDataSource;
    }
    override set datasource(value: Nullable<TData[] | Observable<TData[]>>) {
        this._internalDataSource.setData(value);
    }

    keyGetter = input<Nullable<IFunc<TData, TKey> | string>>();
    parentKeyGetter = input<Nullable<IFunc<TData, Nullable<TKey>> | string>>();
    childrenAccessor = input<Nullable<IFunc<TData, TData[] | null>>>();

    expandNode(item: CSTreeNodeItem<TData>) {
        this._internalDataSource.expandNode(item);
    }

    collapseNode(item: CSTreeNodeItem<TData>) {
        this._internalDataSource.collapseNode(item);
    }

    toggleNode(item: CSTreeNodeItem<TData>) {
        this._internalDataSource.toggleNode(item);
    }

    private normalizeKeyGetter<TKeyResult>(getter: Nullable<IFunc<TData, TKeyResult>> | string): IFunc<TData, TKeyResult> | null {
        return typeof getter === 'function'
            ? getter
            : typeof getter === 'string'
                ? ((d) => getValue(d, getter))
                : null;
    }
}

