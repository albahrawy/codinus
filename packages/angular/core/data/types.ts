import { DataSource } from "@angular/cdk/collections";
import { Signal } from "@angular/core";
import { IArglessFunc, ObjectGetter } from "@codinus/types";
import { Observable } from "rxjs";

type BaseDataSource<T> = readonly T[] | Observable<T[]> | DataSource<T> | undefined | null;

export type Aggregation = 'sum' | 'max' | 'min' | 'count' | 'avg' | 'first' | 'last';
export type DataSourceFunc<T> = IArglessFunc<BaseDataSource<T>>;
export type CSDataSource<T> = BaseDataSource<T> | DataSourceFunc<T>;

export interface ICSDataAggregator<T> {
    setData(data: T[]): void;
    aggregate(key: string, type: Aggregation): unknown;
    refresh(key?: string): void;
}

export interface ICSSupportAggregation {
    aggregate(key: string, type: Aggregation): unknown;
    refreshAggregation(key?: string): void;
}

export interface ISupportDataChangedNotifier<T = unknown> {
    dataChanged: Observable<T[]>;
}

export interface ICSSupportListBinder<TRow, TValue> {
    readonly displayMember: Signal<ObjectGetter<TRow>>;
    readonly valueMember: Signal<ObjectGetter<TRow, TValue>>;
    readonly disableMember?: Signal<ObjectGetter<TRow, boolean>>;
    readonly iconMember?: Signal<ObjectGetter<TRow>>;
}