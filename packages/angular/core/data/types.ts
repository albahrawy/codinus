import { DataSource } from "@angular/cdk/collections";
import { Signal } from "@angular/core";
import { IArglessFunc, IFunc, ObjectGetter } from "@codinus/types";
import { Observable } from "rxjs";

type BaseDataSource<T> = readonly T[] | Observable<T[]> | DataSource<T> | undefined | null;

export type CSAggregation = 'sum' | 'max' | 'min' | 'count' | 'avg' | 'first' | 'last';
export type DataSourceFunc<T> = IArglessFunc<BaseDataSource<T>>;
export type CSDataSource<T> = BaseDataSource<T> | DataSourceFunc<T>;

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
    readonly displayMember: Signal<ObjectGetter<TRow>>;
    readonly valueMember: Signal<ObjectGetter<TRow, TValue>>;
    readonly disableMember?: Signal<ObjectGetter<TRow, boolean>>;
    readonly iconMember?: Signal<ObjectGetter<TRow>>;
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