import { Injectable } from '@angular/core';
import { IValueFormatter } from './types';
import { formatDate, formatNumber, isDate, isNumber, toStringValue } from '@codinus/js-extensions';

@Injectable({ providedIn: 'root' })
export class DefaultValueFormatter implements IValueFormatter {

    format(value: unknown, formatString?: string | undefined): string | null {
        if (formatString) {
            if (isNumber(value))
                return formatNumber(value, formatString);
            else if (isDate(value))
                return formatDate(value, formatString);
        }
        return toStringValue(value);
    }
}