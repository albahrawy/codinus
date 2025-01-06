/**
 * @license
  * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/albahrawy/ngx-codinus/blob/main/LICENSE
 */
import { ListRange } from "@angular/cdk/collections";
import { Directive, Input } from "@angular/core";
import { CSDataSource, CSDataSourceObserver } from "@ngx-codinus/core/data";
import { Observable, of, tap } from "rxjs";
import { CODINUS_VIRTUAL_TABLE_DATA_HANDLER } from "./types";
import { CSTableVirtualScrollDataHandlerBase } from "./virtual-scroll-data-handler-base";

@Directive({
    selector: 'cdk-table:not([responsive])[virtual-scroll], mat-table:not([responsive])[virtual-scroll]',
    providers: [{ provide: CODINUS_VIRTUAL_TABLE_DATA_HANDLER, useExisting: CSTableVirtualScrollDataHandler }],
})
export class CSTableVirtualScrollDataHandler<T> extends CSTableVirtualScrollDataHandlerBase<T> {

    private _dataSourceObserver = new CSDataSourceObserver<T>({ collectionViewer: this });
    protected _data: readonly T[] | null = null;

    @Input('virtual-scroll')
    get datasource(): CSDataSource<T> {
        return this._dataSourceObserver.dataSource;
    }
    set datasource(value: CSDataSource<T>) {
        this._dataSourceObserver.dataSource = value;
    }

    readonly dataSourceChanged = this._dataSourceObserver.dataSourceChanged.pipe(tap(data => this._data = data));

    override readonly dataStream = this.dataSourceChanged;

    override fetchNextData(range: ListRange): Observable<readonly T[] | null> {
        const renderedData = this._data ? this._data.slice(range.start, range.end) : null;
        return of(renderedData);
    }
}