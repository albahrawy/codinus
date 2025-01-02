import { Pipe, PipeTransform, inject } from '@angular/core';
import { DefaultValueFormatter } from './default-value-formater';
import { CODINUS_VALUE_FORMATTER } from './types';

@Pipe({
    name: 'format'
})

export class FormatPipe implements PipeTransform {
    private readonly formatProvider = inject(CODINUS_VALUE_FORMATTER, { optional: true }) ?? new DefaultValueFormatter();

    transform(value: unknown, formatstring?: string): string | null {
        return this.formatProvider.format(value, formatstring);
    }
}