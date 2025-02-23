import { CollectionViewer, isDataSource } from "@angular/cdk/collections";
import { isObservable, Observable, of } from "rxjs";
import { CSDataSource } from "./types";
import { IFunc } from "@codinus/types";
import { isArray } from "@codinus/js-extensions";

export function convertToObservable<T>(value: CSDataSource<T>, collectionViewer?: CollectionViewer | null): Observable<readonly T[]> {
    if (typeof value === 'function')
        value = value();

    if (isObservable(value))
        return value;
    else if (Array.isArray(value))
        return of(value);
    else if (isDataSource(value))
        return value.connect(collectionViewer as CollectionViewer);

    return of([]);
}

export function getDisplayText<TRow, TValue>(displayFn: IFunc<TRow, string>, valueFn: IFunc<TRow, TValue>,
    record?: TRow | TRow[] | readonly TRow[] | null, value?: TValue | null): string | null;
export function getDisplayText<TRow, TValue>(displayFn: IFunc<TRow, string>, valueFn: IFunc<TRow, TValue>,
    data?: TRow[] | readonly TRow[] | null, values?: TValue[] | null): string[] | null;
export function getDisplayText<TRow, TValue>(displayFn: IFunc<TRow, string>, valueFn: IFunc<TRow, TValue>,
    data?: readonly TRow[] | TRow[] | TRow | null, values?: TValue[] | TValue | null): string[] | string | null {

    if (!data || !values || !displayFn || !valueFn)
        return null;
    const _data = isArray(data) ? data : [data];
    const _values = isArray(values) ? values : [values];
    if (!_data.length || !_values.length)
        return null;

    const valuesSet = new Set(_values);
    const texts: string[] = [];
    for (const record of _data) {
        if (valuesSet.has(valueFn(record)))
            texts.push(displayFn(record));
        if (texts.length === valuesSet.size)
            break;
    }

    if (isArray(values))
        return texts;
    return texts.at(0) ?? null;
}