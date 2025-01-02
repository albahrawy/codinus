import { InjectionToken } from "@angular/core";
import { OperatorFunction } from "rxjs";

export const CODINUS_OBSERVABLE_ERROR_HANDLER = new InjectionToken<ICSObservableErrorHandler>('codinus-observable-error-handler');
export type ErrorHandleType = 'string' | 'string-translate' | 'original' | 'ignore' | '';
export interface ICSObservableErrorHandler {
    errorHandler<T>(type?: ErrorHandleType, errorLog?: boolean): OperatorFunction<T, T | null>;
}