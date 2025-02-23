/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */
import { parseDate } from "./date";
import { isBoolean, isDate, isNumber, isNumberHex, isNumberString, isObject, isPrimitive, isString, isSymbol } from "./is";
import { ValueType } from "../types";

/**
 * Converts a given value to its string representation.
 *
 * @param value - The value to convert to a string. It can be of any type.
 * @returns The string representation of the given value.
 *
 * - If the value is a string, it returns the value as is.
 * - If the value is null or undefined, it returns an empty string.
 * - If the value is an array, it recursively converts each element to a string and joins them with commas.
 * - If the value is a symbol, it returns the symbol's string representation.
 * - If the value is a date, it returns the date's JSON string representation.
 * - If the value is an object, it returns the JSON string representation of the object.
 * - If the value is a number, it handles special cases for NaN and negative zero.
 * - For all other types, it converts the value to a string using template literals.
 */
export function toStringValue(value: unknown): string {
    if (typeof value === 'string')
        return value;

    if (value == null)
        return '';

    if (Array.isArray(value))
        return value.map((other) => other == null ? '' : toStringValue(other)).join(',');

    if (isSymbol(value))
        return value.toString();

    if (isDate(value))
        return value.toJSON();

    if (isObject(value))
        return JSON.stringify(value);

    const result = String(value);
    if (typeof value === 'number') {
        if (isNaN(value)) {
            return 'NaN';
        }
        if (result === '0' && (1 / value) === -(1 / 0)) {
            return '-0';
        }
    }
    return result;
}

/**
 * Converts a given value to a boolean.
 *
 * @param value - The value to convert. It can be of any type.
 * @returns A boolean representation of the given value.
 *
 * The conversion rules are as follows:
 * - If the value is already a boolean, it is returned as is.
 * - If the value is a number, it returns `true` if the number is not zero, otherwise `false`.
 * - If the value is a string representation of a number (including hexadecimal), it returns `true` if the number is not zero, otherwise `false`.
 * - If the value is a string, it returns `true` if the string (case insensitive) is 'true', otherwise `false`.
 * - For all other types, it returns `false`.
 */
export function toBoolean(value: unknown): boolean {
    if (isBoolean(value))
        return value;

    if (isNumber(value))
        return value != 0;

    if (isNumberString(value) || isNumberHex(value))
        return toNumber(value) !== 0;

    if (isString(value))
        return value.toLowerCase() == 'true';

    return false;
}

/**
 * Converts the given value to a number.
 *
 * @param value - The value to convert. Can be of any type.
 * @returns The numeric representation of the value.
 */
export function toNumber(value: unknown): number;
/**
 * Converts a given value to a number. If the conversion fails, returns the provided default value.
 *
 * @param value - The value to be converted to a number.
 * @param defaultValue - The default number to return if the conversion fails.
 * @returns The converted number or the default value if conversion fails.
 */
export function toNumber(value: unknown, defaultValue: number): number;
/**
 * Converts a given value to a number. If the conversion fails, returns the specified default value.
 *
 * @param value - The value to be converted to a number.
 * @param defaultValue - The value to return if the conversion fails.
 * @returns The converted number, or the default value if the conversion fails.
 */
export function toNumber(value: unknown, defaultValue: null): number | null;
/**
 * Converts a given value to a number if possible. If the conversion is not possible,
 * returns a default value.
 *
 * @param value - The value to be converted to a number. Can be of any type.
 * @param defaultValue - The value to return if the conversion is not possible. Defaults to 0.
 * @returns The converted number, or the default value if conversion is not possible.
 */
export function toNumber(value: unknown, defaultValue: number | null = 0): number | null {
    if (typeof value === 'number')
        return value;

    if (value == null)
        return defaultValue;
    if (isNumber(value))
        return value;

    if (isSymbol(value))
        return defaultValue;

    if (!isPrimitive(value)) {
        const other = typeof value.valueOf === 'function' ? value.valueOf() : value;
        value = isPrimitive(other) ? other : `${other}`;
    }

    if (typeof value === 'string') {
        const newValue = value.trim().toLowerCase();
        value = +newValue;
    }
    if (isNumber(value))
        return value;
    return defaultValue;
}

/**
 * Converts a given value to an integer.
 *
 * This function attempts to convert the provided value to a number and then
 * truncates it to an integer. If the resulting number is `Infinity` or
 * `-Infinity`, it returns the maximum safe integer value with the appropriate
 * sign.
 *
 * @param value - The value to be converted to an integer.
 * @returns The integer representation of the provided value.
 */
export function toInt(value: unknown): number {
    const newValue = toNumber(value, 0);
    if (newValue === Infinity || newValue === -Infinity)
        return (newValue < 0 ? -1 : 1) * Number.MAX_SAFE_INTEGER;
    return newValue - (newValue % 1);
}

/**
 * Converts a value to a number and returns it if it's positive; otherwise, returns a fallback value.
 *
 * @param {unknown} value - The value to convert.
 * @returns {number | null} The positive number or 0.
 */
export function getPositiveOrFallback(value: unknown): number;
/**
 * Converts the given value to a positive number. If the conversion fails,
 * the provided default value is returned.
 *
 * @param value - The value to be converted to a positive number.
 * @param fallback - The default value to return if the conversion fails.
 * @returns The positive number converted from the value, or the default value if conversion fails.
 */
export function getPositiveOrFallback(value: unknown, fallback: number): number;
/**
 * Converts a value to a number and returns it if it's positive; otherwise, returns a fallback value.
 *
 * @param {unknown} value - The value to convert.
 * @param {null} fallback - The fallback value is null.
 * @returns {number | null} The positive number or null.
 */
export function getPositiveOrFallback(value: unknown, fallback: null): number | null;
export function getPositiveOrFallback(value: unknown, fallback: number | null = 0): number | null {
    const result = toNumber(value);
    return (result >= 0) ? result : fallback;
}

/**
 * Converts a given value to a Date object without a time.
 *
 * @param value - The value to be converted to a Date. It can be of any type.
 * @param parseFormat - An optional parameter specifying the format(s) to parse the date. It can be a string or an array of strings.
 * @returns A Date object if the conversion is successful, otherwise null.
 */
export function toDate(value: unknown, parseFormat?: string | string[]): Date | null {
    return parseDate(value, parseFormat, false);
}

/**
 * Converts a given value to a Date object with time.
 *
 * @param value - The value to be converted to a Date. It can be of any type.
 * @param parseFormat - An optional parameter specifying the format(s) to parse the date. It can be a string or an array of strings.
 * @returns A Date object if the conversion is successful, otherwise null.
 */
export function toDateTime(value: unknown, parseFormat?: string | string[]): Date | null {
    return parseDate(value, parseFormat);
}

/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {'boolean'} valueType - The target type: 'boolean'.
 * @returns {boolean} The converted value as a boolean.
 */
export function valueType<T>(value: T, valueType: 'boolean'): boolean;

/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {'date'} valueType - The target type: 'date'.
 * @returns {Date} The converted value as a Date.
 */
export function valueType<T>(value: T, valueType: 'date'): Date;

/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {'dateTime'} valueType - The target type: 'dateTime'.
 * @returns {Date} The converted value as a Date.
 */
export function valueType<T>(value: T, valueType: 'dateTime'): Date;

/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {'int'} valueType - The target type: 'int'.
 * @returns {number} The converted value as a number.
 */
export function valueType<T>(value: T, valueType: 'int'): number;

/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {'number'} valueType - The target type: 'number'.
 * @returns {number} The converted value as a number.
 */
export function valueType<T>(value: T, valueType: 'number'): number;

/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {'string'} valueType - The target type: 'string'.
 * @returns {string} The converted value as a string.
 */
export function valueType<T>(value: T, valueType: 'string'): string;

/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {ValueType} valueType - The target type.
 * @returns {unknown} The converted value.
 * @throws Will throw an error if the valueType is unsupported.
 */
export function valueType<T>(value: T, valueType: ValueType): unknown;
export function valueType<T>(value: T, valueType: ValueType): unknown {
    switch (valueType) {
        case 'boolean':
            return toBoolean(value);
        case 'date':
            return toDate(value);
        case 'dateTime':
            return toDateTime(value);
        case 'int':
            return toInt(value);
        case 'number':
            return toNumber(value);
        case 'string':
            return toStringValue(value);
        default:
            throw new Error(`Unsupported value type: ${valueType}`);
    }
}