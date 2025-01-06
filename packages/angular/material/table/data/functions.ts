/* eslint-disable @typescript-eslint/no-explicit-any */

import { MatTableDataSource } from '@angular/material/table';
import { ICSHasArrayDataSource, ICSSupportAggregation, ICSSupportDataChangedNotifier } from '@ngx-codinus/core/data';
import { isObservable } from 'rxjs';
import { ICSSupportMatSortDataSource, ICSHasRenderedData, ICSSupportFilter, ICSSupportNotify } from './types';

export function isSupportDataArray<T>(value: unknown | null): value is ICSHasArrayDataSource<T> {
    return Array.isArray((value as { data: T[] })?.data);
}

export function isSupportRenderedData<T>(value: unknown | null): value is ICSHasRenderedData<T> {
    return Array.isArray((value as { renderedData: T[] })?.renderedData);
}

export function isSupportMatSort(value: unknown | null): value is Exclude<ICSSupportMatSortDataSource, null> {
    return (value instanceof MatTableDataSource || (value as { supportMatSort: boolean })?.supportMatSort === true);
}

export function isSupportFilter(value: unknown | null): value is Exclude<ICSSupportFilter, null> {
    return !!value;
    // && (value instanceof MatTableDataSource || (Object.hasOwn(value, 'filter') && Object.hasOwn(value, 'filterPredicate')))
}

export function isSupportAggregation(value: any | null): value is ICSSupportAggregation {
    return typeof value?.aggregate === 'function' && value.aggregate.length === 2
        && typeof value.refreshAggregation === 'function';
}

export function isSupportNotify(value: any | null): value is ICSSupportNotify {
    return typeof value?.notifyChanged === 'function';
}

export function isSupportDataChanged<T>(value: any | null): value is ICSSupportDataChangedNotifier<T> {
    return isObservable(value?.dataChanged);
}