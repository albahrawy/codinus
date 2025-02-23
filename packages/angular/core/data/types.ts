import { DataSource } from "@angular/cdk/collections";
import { OutputEmitterRef, Signal } from "@angular/core";
import { IArglessFunc, IFunc, Nullable, ValueGetter } from "@codinus/types";
import { Observable } from "rxjs";

type BaseDataSource<T> = readonly T[] | Observable<T[]> | DataSource<T> | undefined | null;

export type ValueChangeReason = 'value' | 'accessor' | 'user';
export type CSAggregation = 'sum' | 'max' | 'min' | 'count' | 'avg' | 'first' | 'last';
export type DataSourceFunc<T> = IArglessFunc<BaseDataSource<T>>;
export type CSDataSource<T> = BaseDataSource<T> | DataSourceFunc<T>;
export type CSStringFilterPredicate<T> = (data: T, filter: Nullable<string>) => boolean;


export interface ICSDataAggregator<T> {
    setData(data: T[]): void;
    aggregate(key: string, type: CSAggregation): unknown;
    refresh(key?: string): void;
}

export interface ICSSupportAggregation {
    aggregate(key: string, type: CSAggregation): unknown;
    refreshAggregation(key?: string): void;
}

export interface ICSSupportListBinder<TRow, TValue> {
    readonly displayMember: () => ValueGetter<TRow>;
    readonly valueMember?: () => ValueGetter<TRow, TValue>;
    readonly disableMember?: () => ValueGetter<TRow, boolean>;
    readonly iconMember?: () => ValueGetter<TRow>;
}

export interface ICSListBinder<TRow, TValue> {
    readonly displayMember: Signal<IFunc<TRow, string>>;
    readonly valueMember: Signal<IFunc<TRow, TValue>>;
    readonly disableMember?: Signal<IFunc<TRow, boolean> | null>;
    readonly iconMember?: Signal<IFunc<TRow, string> | null>;
}

export interface ICSSupportDataChangedNotifier<T = unknown> {
    dataChanged: Observable<T[]>;
}

export interface ICSHasArrayDataSource<T> {
    data: Array<T>;
}

export interface CSDataTracker<TRow> {
    varsion: number,
    dataSwapped: boolean,
    data: TRow[]
}

export interface ICSValueChangeArgs<TValue> {
    readonly value: TValue;
    reason: ValueChangeReason;
}

export type CurrentChangingFn<TRecord> = Nullable<(current: Nullable<TRecord>, newItem: Nullable<TRecord>) => boolean>;

export interface IDataManagerSupport<TRecord, TValue = unknown> extends ICSSupportListBinder<TRecord, TValue> {
    currentChanged: OutputEmitterRef<Nullable<TRecord>>;
    activateFirstItem: () => boolean;
    filterPredicate?: () => Nullable<CSStringFilterPredicate<TRecord>>;
    currentChanging?: () => CurrentChangingFn<TRecord>;
    hasCustomFilter?: () => boolean;
    scrollToIndex(index: number, record?: TRecord): void;
    _hasfilterStrategy?: () => boolean;
    _applyFilterStartegy?(data: readonly TRecord[], filter: Nullable<string>, predicate: CSStringFilterPredicate<TRecord>): TRecord[];
    _dataRemoveHandler?: (rows: TRecord[]) => Nullable<TRecord>;
    _dataAddHandler?: (rows: TRecord[]) => Nullable<TRecord>;
    _isRecordPartOfData?: (data: readonly TRecord[], record: Nullable<TRecord>) => boolean;
}