/* eslint-disable @typescript-eslint/no-unused-vars */
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { MatSort, Sort } from '@angular/material/sort';
import { arraySort, getValue } from '@codinus/js-extensions';
import { Nullable } from '@codinus/types';
import { BehaviorSubject, combineLatest, isObservable, merge, Observable, of, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { CSDataAggregator } from './data-aggregator';
import { CSAggregation } from './types';

export abstract class CSDataSourceBase<TData extends object, RData = TData> extends DataSource<RData> {

    /** Stream that emits when a new data array is set on the data source. */
    private readonly _data$ = new BehaviorSubject<Observable<TData[]>>(of([])); // Holds an data observable
    private readonly _sort$ = new BehaviorSubject<Observable<Sort | null | void>>(of(null)); // Holds an sort observable
    private readonly _filter$ = new BehaviorSubject<((data: RData) => boolean) | null>(null); // Holds an filter observable
    private readonly _structureChange$ = new ReplaySubject<void>(); // Holds an filter observable
    private readonly _forceDataChange$ = new ReplaySubject<void>(); // Holds an filter observable

    private _dataChanged = new ReplaySubject<RData[]>(1);

    private _data: TData[] = [];
    private _filteredData: RData[] = [];
    private _renderedData: RData[] = [];
    private _sort: MatSort | null = null;

    readonly dataChanged = this._dataChanged.asObservable().pipe(distinctUntilChanged());

    protected readonly dataAggregator = new CSDataAggregator<RData>();

    protected readonly dataStream$ = this._data$.pipe(
        switchMap(data$ => data$), // Switch to the latest observable
        shareReplay(1) // Cache the latest value
    );

    protected readonly sortStream$ = this._sort$.pipe(
        switchMap(sort$ => sort$), // Switch to the latest observable
        shareReplay(1) // Cache the latest value
    );

    private readonly renderData$ = combineLatest([
        combineLatest([this.dataStream$, this._forceDataChange$.pipe(startWith(null))])
            .pipe(tap(([data]) => this._data = data), map(([d]) => this.transformData(d))),
        this._filter$,
        this.sortStream$,
        this._structureChange$.pipe(startWith(null)),
    ]).pipe(
        map(([data, fp,]) => this._filterData(data, fp)), // Filtering
        map(data => this._orderData(data)), // Sorting
        tap(data => this._onDataChanged(data)), // Aggregation
        shareReplay(1) // Ensures the latest value is cached for new subscribers
    );

    constructor(initialData: TData[] | Observable<TData[]> | null = null) {
        super();
        this.setData(initialData);
    }

    get data() { return this._data; }
    get filteredData() { return this._filteredData; }
    get renderedData() { return this._renderedData; }

    get sort(): MatSort | null { return this._sort; }
    set sort(sort: MatSort | null) {
        this._sort = sort;
        const sortChanges = sort ? merge(sort.sortChange, sort.initialized) : of(null);
        this._sort$.next(sortChanges);
    }

    sortingDataAccessor: (data: RData, sortHeaderId: string) => unknown
        = (data, sortHeaderId) => getValue(data, sortHeaderId);

    setData(data: Nullable<TData[] | Observable<TData[]>>): void {
        const data$ = isObservable(data) ? data : of(data ?? []);
        this._data$.next(data$);
    }

    setFilter(filterPredicate: ((data: RData) => boolean) | null): void {
        this._filter$.next(filterPredicate);
    }

    refresh() {
        this._structureChange$.next();
    }

    notifyChanged() {
        this._forceDataChange$.next();
    }

    protected _orderData(data: RData[]): RData[] {
        // If there is no active sort or direction, return the data without trying to sort.

        const active = this.sort?.active;
        const direction = this.sort?.direction === 'asc' ? 1 : this.sort?.direction === 'desc' ? -1 : 0;
        return this._sortDataCore(data, active, direction);
    }

    protected _onDataChanged(data: RData[]): void {
        this._renderedData = data;
        this.setAggregatedData(data);
        this._dataChanged.next(data);
    }

    protected setAggregatedData(data: RData[]) {
        this.dataAggregator.setData(data);
    }

    protected _sortDataCore(data: RData[], active?: string, direction?: 1 | -1 | 0 | null): RData[] {
        if (!active || !direction)
            return data;
        return arraySort(data, d => this.sortingDataAccessor(d, active), direction);
    }

    protected _filterData(data: RData[], filterPredicate: ((data: RData) => boolean) | null) {
        // If there is a filter string, filter out data that does not contain it.
        // Each data object is converted to a string using the function defined by filterPredicate.
        // May be overridden for customization.
        this._filteredData = filterPredicate == null ? data : this._filterDataCore(data, filterPredicate);

        return this.filteredData;
    }

    protected _filterDataCore(data: RData[], filterPredicate: (data: RData) => boolean): RData[] {
        return data.filter(obj => filterPredicate(obj));
    }

    protected setDataCore(data: TData[]) {
        this._data = data;
    }

    protected abstract transformData(data: TData[]): RData[];

    override connect(collectionViewer: CollectionViewer): Observable<readonly RData[]> {
        return this.renderData$;
    }

    override disconnect(collectionViewer: CollectionViewer): void {
        /** */
    }

    aggregate(key: string, type: CSAggregation): unknown {
        return this.dataAggregator.aggregate(key, type);
    }

    refreshAggregation(key?: string): void {
        this.dataAggregator.refresh(key);
    }
}