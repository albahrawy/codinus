/* eslint-disable @typescript-eslint/no-explicit-any */

import { MatTableDataSource } from '@angular/material/table';
import { ICSHasArrayDataSource, ICSSupportAggregation, ICSSupportDataChangedNotifier } from '@ngx-codinus/core/data';
import { isObservable } from 'rxjs';
import { CSTableTreeDataSource } from '../table-tree/table-tree-data-source';
import { ICSHasRenderedData, ICSSupportMatSortDataSource, ICSSupportNotify, ISupportCSFilter, ISupportMatFilter } from './types';

export function isSupportDataArray<T>(value: unknown | null): value is ICSHasArrayDataSource<T> {
    return Array.isArray((value as { data: T[] })?.data);
}

export function isSupportRenderedData<T>(value: unknown | null): value is ICSHasRenderedData<T> {
    return Array.isArray((value as { renderedData: T[] })?.renderedData);
}

export function isSupportMatSort(value: unknown | null): value is Exclude<ICSSupportMatSortDataSource, null> {
    return (value instanceof MatTableDataSource
        || value instanceof CSTableTreeDataSource
        || (value as { supportMatSort: boolean })?.supportMatSort === true);
}

export function isSupportMatFilter(value: unknown | null): value is Exclude<ISupportMatFilter, null> {
    return !!value && (value instanceof MatTableDataSource || (Object.hasOwn(value, 'filter') && Object.hasOwn(value, 'filterPredicate')))
}

export function isSupportCSFilter(value: any | null): value is Exclude<ISupportCSFilter, null> {
    return !!value && (value instanceof CSTableTreeDataSource || typeof value.setFilter === 'function');
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