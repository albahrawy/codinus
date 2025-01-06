import { computed, Directive, effect, inject, input, output } from "@angular/core";
import { outputFromObservable, toObservable, toSignal } from "@angular/core/rxjs-interop";
import { MatTableDataSource } from "@angular/material/table";
import { enumerableRange, isFunction, isObject, removeFromArray } from "@codinus/js-extensions";
import { CSAggregation, CSDataSource } from "@ngx-codinus/core/data";
import { debounceTime, Observable, of, switchMap } from "rxjs";
import { CODINUS_TABLE_API_REGISTRAR, ICSTableApiRegistrar } from "../api";
import { isSupportAggregation, isSupportDataArray, isSupportDataChanged, isSupportFilter, isSupportNotify } from "./functions";
import { CSModifyMode, ICSDataModifedArgs } from "./types";


@Directive({
    selector: `mat-table[virtual-scroll],
               cdk-table[virtual-scroll], 
               mat-table[dataSource],
               cdk-table[dataSource]`,
    exportAs: 'csDatasourceDirective'
})
export class CSTableDataSourceDirective<TRecord = unknown> {

    private _apiRegistrar = inject<ICSTableApiRegistrar<TRecord>>(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });

    private currentDataSource = computed(() => this.vsDataSource() ?? this.dataSource());

    constructor() {
        effect(() => this.dataSourceChanged.emit(this.currentDataSource()));
        this._apiRegistrar?.register('dataSourceDirective', this);
    }

    private dataChanged$: Observable<TRecord[]> = toObservable(this.currentDataSource)
        .pipe(switchMap(d =>
            isSupportDataChanged(d)
                ? d.dataChanged.pipe(debounceTime(1))
                : isSupportDataArray(d)
                    ? of(d.data)
                    : Array.isArray(d)
                        ? of(d)
                        : of([])
        ));

    dataModified = output<ICSDataModifedArgs<TRecord>>();
    dataSourceChanged = output<CSDataSource<TRecord>>();
    dataChanged = outputFromObservable(this.dataChanged$);

    getData = toSignal(this.dataChanged$, { initialValue: [] });

    dataSource = input<CSDataSource<TRecord>>();
    vsDataSource = input<CSDataSource<TRecord>>(null, { alias: 'virtual-scroll' });

    notifyChanged() {
        this.refreshAggregation();
        const ds = this.currentDataSource();
        if (isSupportNotify(ds))
            ds.notifyChanged();
        else if (ds instanceof MatTableDataSource)
            ds._updateChangeSubscription();
    }

    notifyModified(type: CSModifyMode, effected?: TRecord[]) {
        this.dataModified.emit({ api: this._apiRegistrar?.getApi(), type, effected, data: this.getData() });
    }

    // getData(): TRecord[] {
    //     const ds = this.currentDataSource();
    //     return isSupportDataArray<TRecord>(ds)
    //         ? ds.data
    //         : Array.isArray(ds)
    //             ? ds
    //             : [];
    // }

    // getRenderedData(): TRecord[] {
    //     const ds = this.currentDataSource();
    //     return isSupportRenderedData<TRecord>(ds) ? ds.renderedData : [];
    // }

    aggregate(key: string, type: CSAggregation): unknown {
        const ds = this.currentDataSource();
        return isSupportAggregation(ds) ? ds.aggregate(key, type) : null;
    }

    refreshAggregation(key?: string): void {
        const ds = this.currentDataSource();
        if (isSupportAggregation(ds))
            ds.refreshAggregation(key);
    }

    clearFilter() {
        this.setFilter(() => true, '');
    }

    setFilter(predicate: (data: unknown) => boolean, filter: string) {
        const ds = this.currentDataSource();
        if (isSupportFilter(ds)) {
            ds.filterPredicate = predicate;
            ds.filter = filter;
        }
    }

    addRecords(records?: TRecord[] | number, options?: { index?: number, scroll?: boolean }) {
        let reqRecords: TRecord[];
        if (!records)
            records = 1;

        if (typeof records === 'number')
            reqRecords = enumerableRange(1, records).map(() => ({} as TRecord));
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

                this._apiRegistrar?.getApi().selectionModel?.selectRow(reqRecords[0]);
            });
        }
    }

    removeRecords(predicate: TRecord[] | number | ((row: TRecord) => boolean), selectPrevious?: boolean) {
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
                    this._apiRegistrar?.getApi().selectionModel?.selectRow(toBeSelected);
                }
            });

        }

        this.notifyChanged();
        this.notifyModified('remove', records);
    }
}
