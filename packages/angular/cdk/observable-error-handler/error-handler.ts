import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { IGenericRecord } from "@codinus/types";
import { CODINUS_LOCALIZER } from "@ngx-codinus/cdk/localization";
import { CODINUS_LOGGER_SERVICE } from "@ngx-codinus/cdk/logger";
import { EMPTY, Observable, OperatorFunction, catchError, of, switchMap, throwError } from "rxjs";
import { ErrorHandleType, ICSObservableErrorHandler } from "./types";

@Injectable({ providedIn: 'root' })
export class ObservableErrorHandler implements ICSObservableErrorHandler {

    private _localizer = inject(CODINUS_LOCALIZER, { optional: true });
    private _logger = inject(CODINUS_LOGGER_SERVICE, { optional: true });

    errorHandler<T>(type?: ErrorHandleType, logError?: boolean): OperatorFunction<T, T | null> {
        logError = logError == undefined ? true : !!logError;

        return catchError(e => {
            switch (type) {
                case 'ignore':
                    return of(null);
                case 'original':
                    return throwError(() => e);
                default: {
                    const isTranslate = !type || type === 'string-translate';
                    if (e?.error instanceof Blob && e.error.size > 0) {
                        return new Observable<string>(observer => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                observer.next(e.target?.result as string);
                                observer.complete();
                            };
                            reader.readAsText(e.error);
                        }).pipe(switchMap(blobText => this._throwModifyError(blobText, isTranslate, logError)));
                    } else if (e instanceof HttpErrorResponse) {
                        let stringError: string | IGenericRecord = '';
                        if (typeof e.error === 'string') {
                            if (!e.error.startsWith('<!DOCTYPE html>'))
                                stringError = e.error;
                        } else {
                            stringError = e.error?.localError;
                        }
                        return this._throwModifyError(stringError || e.message || 'HttpErrors.ServerError', isTranslate, logError);
                    } else {
                        const stringError: string | IGenericRecord = typeof e === 'string' ? e : e.error;
                        return this._throwModifyError(stringError || e.message || 'HttpErrors.ServerError', isTranslate, logError);
                    }
                }
            }
        });
    }

    private _throwModifyError(error: string | IGenericRecord, isTranslate?: boolean, logError?: boolean): Observable<never> {

        let errorString = '';
        if (!!isTranslate || typeof error != 'string')
            errorString = this._localizer?.translate(error, true) as string;
        else
            errorString = error;

        if (logError)
            this._logger?.logError(errorString);

        return throwError(() => errorString);
    }
}