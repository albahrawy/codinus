import { CollectionViewer, isDataSource } from "@angular/cdk/collections";
import { EMPTY, isObservable, Observable, of } from "rxjs";
import { CSDataSource } from "./types";

export function convertToObservable<T>(value: CSDataSource<T>, collectionViewer?: CollectionViewer | null): Observable<readonly T[]> {
    if (typeof value === 'function')
        value = value();

    if (isObservable(value))
        return value;
    else if (Array.isArray(value))
        return of(value);
    else if (isDataSource(value))
        return value.connect(collectionViewer as CollectionViewer);

    return EMPTY;
}