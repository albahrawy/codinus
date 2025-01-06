import { Nullable } from "@codinus/types";
import { ICSTableApi } from "../api";
import { MatSort } from "@angular/material/sort";

export type CSFormatterFn<V> = (value: Nullable<V>, lang?: string) => string | null;
export type CSAggregationFn<T> = ((key: string, data?: T[]) => unknown);

export type CSModifyMode = 'add' | 'update' | 'remove';

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
    effected?: TData[];
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