/**
 * @license
  * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/albahrawy/ngx-codinus/blob/main/LICENSE
 */
import { ListRange } from "@angular/cdk/collections";
import { Directive, inject, Input } from "@angular/core";
import { CSDataSource, CSDataSourceObserver } from "@ngx-codinus/core/data";
import { SMOOTH_SCHEDULER } from "@ngx-codinus/core/shared";
import { auditTime, combineLatest, distinctUntilChanged, map, Observable, of, shareReplay, startWith, tap } from "rxjs";
import { CODINUS_VIRTUAL_TABLE_DATA_HANDLER } from "./types";
import { CSTableVirtualScrollDataHandlerBase } from "./virtual-scroll-data-handler-base";
import { CSTableResponsiveView } from "../responsive";

@Directive({
    selector: 'cdk-table:not([dataSource])[virtual-scroll], mat-table:not([dataSource])[virtual-scroll]',
    providers: [{ provide: CODINUS_VIRTUAL_TABLE_DATA_HANDLER, useExisting: CSTableVirtualScrollDataHandler }],
})
export class CSTableVirtualScrollDataHandler<T> extends CSTableVirtualScrollDataHandlerBase<T> {

    private _responsiveView = inject(CSTableResponsiveView, { optional: true });
    private _dataSourceObserver = new CSDataSourceObserver<T>({ collectionViewer: this });

    protected _data: readonly T[] | null = null;

    private _responsiveViewChange: Observable<number | null> = this._responsiveView?.viewChanged.pipe(map(args => args.columns)) ?? of(null);
    private _responsiveColumns: number | null = null;

    @Input('virtual-scroll')
    get datasource(): CSDataSource<T> {
        return this._dataSourceObserver.dataSource;
    }
    set datasource(value: CSDataSource<T>) {
        this._dataSourceObserver.dataSource = value;
    }

    override readonly dataStream = combineLatest(
        [
            this._dataSourceObserver.dataSourceChanged,
            this._responsiveViewChange.pipe(startWith(null))
        ]).pipe(
            auditTime(0, SMOOTH_SCHEDULER),
            distinctUntilChanged(([pData, pResponsive], [cData, cResponsive]) =>
                (pData === cData || (pData?.length === 0 && cData?.length === 0))
                && pResponsive === cResponsive),
            shareReplay(1),
            tap(([data, columns]) => {
                this._data = data;
                this._responsiveColumns = columns;
            }),
            map(([data, columns]) => {
                const datalength = Math.ceil(columns && columns > 0 ? data.length / columns : data.length);
                return Array(datalength);
            })
        );

    override fetchNextData(range: ListRange): Observable<readonly T[] | null> {

        const _range = { ...range };
        const columns = this._responsiveColumns ?? 0;
        if (columns > 0) {
            _range.start *= columns;
            _range.end *= columns;
        }

        const renderedData = this._data ? this._data.slice(_range.start, _range.end) : null;
        return of(renderedData);
    }
}