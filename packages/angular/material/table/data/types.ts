import { Nullable } from "@codinus/types";
import { ICSTableApi } from "../api";
import { MatSort } from "@angular/material/sort";
import { InjectionToken, OutputEmitterRef } from "@angular/core";
import { CSAggregation, CSDataSource } from "@ngx-codinus/core/data";

export const CODINUS_DATA_SOURCE_DIRECTIVE = new InjectionToken<ICSTableDataSourceDirective<unknown>>('codinus_data_source_directive');

export type CSFormatterFn<V> = (value: Nullable<V>, lang?: string) => string | null;
export type CSAggregationFn<T> = ((key: string, data?: T[]) => unknown);
export type CSValueGetter<TRow, TValue> = (data: TRow | null, key?: string) => Nullable<TValue>;
export type CSModifyMode = 'add' | 'update' | 'remove';

export interface ICSTableDataSourceDirective<TRecord> {
    getData(): TRecord[];
    dataSourceChanged: OutputEmitterRef<CSDataSource<TRecord>>;
    dataModified: OutputEmitterRef<ICSDataModifedArgs<TRecord>>;
    aggregate(key: string, type: CSAggregation): unknown;
    refreshAggregation(key?: string): void;
    clearFilter(): void;
    setFilter(predicate: (data: unknown) => boolean, filter: string): void;
    addRecords(records?: TRecord[] | number, options?: { index?: number, scroll?: boolean }): void;
    removeRecords(predicate: TRecord[] | number | ((row: TRecord) => boolean), selectPrevious?: boolean): void;
    notifyChanged(): void;
    notifyModified(type: CSModifyMode, affected?: TRecord[]): void;
}

export interface ICSColumnDataAccessor<T, V> {
    getValue: (data: T | null) => Nullable<V>;
    setValue(data: T, value: Nullable<V>): void;
    getFooterValue: () => Nullable<V> | unknown;
    formatValue: CSFormatterFn<V>;
    formatFooter: CSFormatterFn<V>;
}

export interface ICSColumnDataDef<T, V> {
    dataKey(): string;
    readOnly(): boolean
    readonly cellValueAccessor: () => ICSColumnDataAccessor<T, V>;
}

export interface ICSDataModifedArgs<TData = unknown> {
    type: CSModifyMode;
    api?: ICSTableApi<TData>;
    data: Nullable<Array<TData>>;
    affected?: TData[];
}

export interface ICSHasRenderedData<T> {
    renderedData: Array<T>;
}

export interface ICSSupportMatSortDataSource {
    sort: MatSort | null;
}

export interface ICSSupportFilter {
    filterPredicate: (data: unknown) => boolean;
    filter: string;
}

export interface ICSSupportNotify {
    notifyChanged(): void;
}