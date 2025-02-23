import { computed, Directive, effect, inject, input, output, Signal } from "@angular/core";
import { outputFromObservable, toSignal } from "@angular/core/rxjs-interop";
import { MatTableDataSource } from "@angular/material/table";
import { arrayRange, isFunction, isObject, removeFromArray } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { CSAggregation, CSDataSource } from "@ngx-codinus/core/data";
import { debounceTime, Observable, of, ReplaySubject, switchMap } from "rxjs";
import { CODINUS_TABLE_API_REGISTRAR, ICSTableApiRegistrar } from "../api";
import { isSupportAggregation, isSupportDataArray, isSupportDataChanged, isSupportFilter, isSupportNotify } from "./functions";
import { CODINUS_DATA_SOURCE_DIRECTIVE, CSModifyMode, ICSDataModifedArgs } from "./types";


@Directive()
export abstract class CSTableDataSourceDirectiveBase<TRecord = unknown> {

    private _apiRegistrar = inject<ICSTableApiRegistrar<TRecord>>(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });

    private dataSourceChanged$ = new ReplaySubject<CSDataSource<TRecord>>(1);
    abstract dataSource: Signal<CSDataSource<TRecord>>;

    constructor() {
        effect(() => this.dataSourceChanged$.next(this.dataSource()));
        this._apiRegistrar?.register('dataSourceDirective', this);
    }

    private dataChanged$: Observable<TRecord[]> = this.dataSourceChanged$
        .pipe(switchMap(d =>
            isSupportDataChanged<TRecord>(d)
                ? d.dataChanged.pipe(debounceTime(1))
                : of(this._getDataArray(d))
        ));

    private _inlineData = toSignal(this.dataChanged$);

    dataModified = output<ICSDataModifedArgs<TRecord>>();
    dataSourceChanged = outputFromObservable(this.dataSourceChanged$);
    dataChanged = outputFromObservable(this.dataChanged$);

    getData = computed(() => this._getDataArray(this.dataSource(), this._inlineData()), { equal: () => false });

    private _getDataArray(dataSource: Nullable<CSDataSource<TRecord>>, defualtValue: Nullable<TRecord[]> = null) {
        return isSupportDataArray<TRecord>(dataSource)
            ? dataSource.data
            : Array.isArray(dataSource)
                ? dataSource
                : defualtValue ?? [];
    }

    notifyChanged() {
        this.refreshAggregation();
        const ds = this.dataSource();
        if (isSupportNotify(ds))
            ds.notifyChanged();
        else if (ds instanceof MatTableDataSource)
            ds._updateChangeSubscription();
    }

    notifyModified(type: CSModifyMode, affected?: TRecord[]) {
        this.dataModified.emit({ api: this._apiRegistrar?.getApi(), type, affected: affected, data: this.getData() });
    }

    aggregate(key: string, type: CSAggregation): unknown {
        const ds = this.dataSource();
        return isSupportAggregation(ds) ? ds.aggregate(key, type) : null;
    }

    refreshAggregation(key?: string): void {
        const ds = this.dataSource();
        if (isSupportAggregation(ds))
            ds.refreshAggregation(key);
    }

    clearFilter() {
        this.setFilter(() => true, '');
    }

    setFilter(predicate: (data: unknown) => boolean, filter: string) {
        const ds = this.dataSource();
        if (isSupportFilter(ds)) {
            ds.filterPredicate = predicate;
            ds.filter = filter;
        }
    }

    addRecords(records?: TRecord[] | number, options?: { index?: number, scroll?: boolean }): void {
        let reqRecords: TRecord[];
        if (!records)
            records = 1;

        if (typeof records === 'number')
            reqRecords = arrayRange(1, records).map(() => ({} as TRecord));
        else
            reqRecords = records.filter(r => isObject(r));

        if (!reqRecords.length)
            return;

        const data = this.getData();
        const index = options?.index;
        let scrollInfo: number | 'end';
        if (index && index >= 0) {
            data.splice(index, 0, ...reqRecords);
            scrollInfo = index;
        }
        else {
            data.push(...reqRecords);
            scrollInfo = 'end';
        }

        this.notifyChanged();
        this.notifyModified('add', reqRecords);

        if (options?.scroll !== false) {
            setTimeout(() => {
                if (scrollInfo === 'end')
                    this._apiRegistrar?.getApi().scrollToEnd();
                else
                    this._apiRegistrar?.getApi().scrollToIndex(scrollInfo);

                this._apiRegistrar?.getApi().selectionModel?.select(reqRecords[0], true);
            });
        }
    }

    removeRecords(predicate: TRecord[] | number | ((row: TRecord) => boolean), selectPrevious?: boolean): void {
        if (predicate == null)
            return;
        const data = this.getData();
        if (!data.length)
            return;
        if (isFunction(predicate)) {
            predicate = data.filter(predicate);
        }
        let records;
        let prevIndex: number | null = null;
        if (typeof predicate === 'number') {
            if (predicate >= 0) {
                const deleted = data.splice(predicate, 1);
                records = deleted;
                prevIndex = predicate - 1;
            }
        }
        else {
            records = [];
            if (!predicate.length)
                return;
            predicate.forEach(p => {
                const deleted = removeFromArray(data, p);
                if (deleted >= 0) {
                    records.push(p);
                    prevIndex = Math.max(prevIndex ?? 0, deleted - 1);
                }

            });
        }

        if (selectPrevious && prevIndex != null) {
            let lastprevIndex = Math.max(0, prevIndex);
            setTimeout(() => {
                lastprevIndex = Math.min(lastprevIndex, data.length);
                const toBeSelected = data.at(lastprevIndex);
                if (toBeSelected) {
                    this._apiRegistrar?.getApi().scrollToIndex(lastprevIndex);
                    this._apiRegistrar?.getApi().selectionModel?.select(toBeSelected);
                }
            });

        }

        this.notifyChanged();
        this.notifyModified('remove', records);
    }
}


@Directive({
    selector: `mat-table:not([virtual-scroll])[dataSource],
               cdk-table:not([virtual-scroll])[dataSource]`,
    exportAs: 'csDatasourceDirective',
    providers: [{ provide: CODINUS_DATA_SOURCE_DIRECTIVE, useExisting: CSTableDataSourceDirective }]
})
export class CSTableDataSourceDirective<TRecord = unknown> extends CSTableDataSourceDirectiveBase {
    override dataSource = input<CSDataSource<TRecord>>();

}

@Directive({
    selector: `mat-table:not([dataSource])[virtual-scroll],
               cdk-table:not([dataSource])[virtual-scroll]`,
    exportAs: 'csDatasourceDirective',
    providers: [{ provide: CODINUS_DATA_SOURCE_DIRECTIVE, useExisting: CSTableVirtualDataSourceDirective }]
})
export class CSTableVirtualDataSourceDirective<TRecord = unknown> extends CSTableDataSourceDirectiveBase {
    override dataSource = input<CSDataSource<TRecord>>(null, { alias: 'virtual-scroll' });

}