export type ValueType = 'boolean' | 'date' | 'dateTime' | 'int' | 'number' | 'string';

export interface INumberFormatOptions extends Intl.NumberFormatOptions {
    padChar?: string,
    padLength?: number,
}