/**
 * @license
  * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/albahrawy/ngx-codinus/blob/main/LICENSE
 */
import { ListRange } from "@angular/cdk/collections";
import { Directive, inject } from "@angular/core";
import { Observable, combineLatest, distinctUntilChanged, map, of, shareReplay, startWith } from "rxjs";
import { CODINUS_VIRTUAL_TABLE_DATA_HANDLER, CSTableVirtualScrollDataHandler } from "../scroll";
import { CSTableResponsiveView } from "./responsive-view";

@Directive({
    selector: 'cdk-table[responsive][virtual-scroll], mat-table[responsive][virtual-scroll]',
    providers: [{
        provide: CODINUS_VIRTUAL_TABLE_DATA_HANDLER,
        useExisting: CSTableResposiveVirtualScrollDataHandler
    }],
})
export class CSTableResposiveVirtualScrollDataHandler<T> extends CSTableVirtualScrollDataHandler<T> {

    private responsiveView = inject(CSTableResponsiveView);
    private _currentViewColumns = 0;

    override readonly dataStream = combineLatest([
        this.responsiveView.viewChanged.pipe(//startWith({ cells: 0, columns: 0 }),
            shareReplay(1),
            distinctUntilChanged((curr, prev) => curr.cells === prev.cells && curr.columns === prev.columns)
        ), this.dataSourceChanged])
        .pipe(map(([view, data]) => {
            const datalength = Math.ceil(view.columns > 0 ? data.length / view.columns : data.length);
            this._currentViewColumns = view.columns;
            return Array(datalength);
        }), distinctUntilChanged((curr, prev) => curr.length === prev.length));

    override fetchNextData(range: ListRange): Observable<readonly T[] | null> {
        const _range = { ...range };
        if (this._currentViewColumns > 0) {
            _range.start *= this._currentViewColumns;
            _range.end *= this._currentViewColumns;
        }
        const renderedData = this._data ? this._data.slice(_range.start, _range.end) : null;
        return of(renderedData);
    }
}
