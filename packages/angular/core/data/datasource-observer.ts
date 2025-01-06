import { CollectionViewer, isDataSource } from "@angular/cdk/collections";
import { Observable, ReplaySubject, Subscription, pairwise, shareReplay, startWith, switchMap } from "rxjs";
import { convertToObservable } from "./functions";
import { CSDataSource } from "./types";
import { effect, Signal } from "@angular/core";

export interface ICSDataSourceObserverConfig<TRecord> {
    collectionViewer?: CollectionViewer | null;
    autoSubscribe?: (data: readonly TRecord[]) => void;
    host?: { dataSource: Signal<CSDataSource<TRecord>> }
}

export class CSDataSourceObserver<TRecord> {
    private _datasource: CSDataSource<TRecord>;
    private readonly _dataSourceChanges = new ReplaySubject<CSDataSource<TRecord>>();
    private _scubscription?: Subscription;

    constructor(private config?: ICSDataSourceObserverConfig<TRecord>) {
        if (config?.autoSubscribe)
            this.subscribe(config.autoSubscribe);
        const host = config?.host;
        if (host)
            effect(() => this.dataSource = host.dataSource());
    }

    get dataSource(): CSDataSource<TRecord> {
        return this._datasource;
    }
    set dataSource(value: CSDataSource<TRecord>) {
        this._datasource = value;
        this._dataSourceChanges.next(value);
    }
    readonly dataSourceChanged = this._dataSourceChanges.pipe(
        // Start off with null `DataSource`.
        startWith(null),
        // Bundle up the previous and current data sources so we can work with both.
        pairwise(),
        // Use `_changeDataSource` to disconnect from the previous data source and connect to the
        // new one, passing back a stream of data changes which we run through `switchMap` to give
        // us a data stream that emits the latest data from whatever the current `DataSource` is.
        switchMap(([prev, cur]) => this._changeDataSource(prev, cur)),
        // Replay the last emitted data when someone subscribes.
        shareReplay(1),
    );

    subscribe(subscriber: (data: readonly TRecord[]) => void) {
        this._scubscription?.unsubscribe();
        this._scubscription = this.dataSourceChanged.subscribe(subscriber);
    }

    destroy() {
        this._scubscription?.unsubscribe();
    }

    private _changeDataSource(oldDs: CSDataSource<TRecord> | null, newDs: CSDataSource<TRecord> | null): Observable<readonly TRecord[]> {
        if (isDataSource(oldDs))
            oldDs?.disconnect(this.config?.collectionViewer as CollectionViewer);
        return convertToObservable(newDs, this.config?.collectionViewer);
    }
}