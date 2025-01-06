import { InjectionToken } from "@angular/core";

export const CODINUS_VALUE_FORMATTER = new InjectionToken<IValueFormatter>('codinus_value_formatter');

export interface IValueFormatter {
    format(value: unknown, formatstring?: string, lang?: string): string | null;
}