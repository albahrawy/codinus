import { InjectionToken } from "@angular/core";
import { IGenericRecord } from "@codinus/types";

export const CODINUS_LOGGER_SERVICE = new InjectionToken<ICSLogger>('codinus_logger_service');

export interface ICSLogger {
    logError(error: string | Error): void;
    logInfo(info: string | IGenericRecord): void;
}