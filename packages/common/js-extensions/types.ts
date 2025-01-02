export type ValueMap = {
    boolean: boolean;
    date: Date | undefined;
    dateTime: Date | undefined;
    int: number;
    number: number;
    string: string;
};

export type ValueType = keyof ValueMap | '';

export interface INumberFormatOptions extends Intl.NumberFormatOptions {
    padChar?: string,
    padLength?: number,
}