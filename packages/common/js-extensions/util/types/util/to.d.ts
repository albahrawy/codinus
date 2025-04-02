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
export declare function toStringValue(value: unknown): string;
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
export declare function toBoolean(value: unknown): boolean;
/**
 * Converts the given value to a number.
 *
 * @param value - The value to convert. Can be of any type.
 * @returns The numeric representation of the value.
 */
export declare function toNumber(value: unknown): number;
/**
 * Converts a given value to a number. If the conversion fails, returns the provided default value.
 *
 * @param value - The value to be converted to a number.
 * @param defaultValue - The default number to return if the conversion fails.
 * @returns The converted number or the default value if conversion fails.
 */
export declare function toNumber(value: unknown, defaultValue: number): number;
/**
 * Converts a given value to a number. If the conversion fails, returns the specified default value.
 *
 * @param value - The value to be converted to a number.
 * @param defaultValue - The value to return if the conversion fails.
 * @returns The converted number, or the default value if the conversion fails.
 */
export declare function toNumber(value: unknown, defaultValue: null): number | null;
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
export declare function toInt(value: unknown): number;
/**
 * Converts a value to a number and returns it if it's positive; otherwise, returns a fallback value.
 *
 * @param {unknown} value - The value to convert.
 * @returns {number | null} The positive number or 0.
 */
export declare function getPositiveOrFallback(value: unknown): number;
/**
 * Converts the given value to a positive number. If the conversion fails,
 * the provided default value is returned.
 *
 * @param value - The value to be converted to a positive number.
 * @param fallback - The default value to return if the conversion fails.
 * @returns The positive number converted from the value, or the default value if conversion fails.
 */
export declare function getPositiveOrFallback(value: unknown, fallback: number): number;
/**
 * Converts a value to a number and returns it if it's positive; otherwise, returns a fallback value.
 *
 * @param {unknown} value - The value to convert.
 * @param {null} fallback - The fallback value is null.
 * @returns {number | null} The positive number or null.
 */
export declare function getPositiveOrFallback(value: unknown, fallback: null): number | null;
/**
 * Converts a given value to a Date object without a time.
 *
 * @param value - The value to be converted to a Date. It can be of any type.
 * @param parseFormat - An optional parameter specifying the format(s) to parse the date. It can be a string or an array of strings.
 * @returns A Date object if the conversion is successful, otherwise null.
 */
export declare function toDate(value: unknown, parseFormat?: string | string[]): Date | null;
/**
 * Converts a given value to a Date object with time.
 *
 * @param value - The value to be converted to a Date. It can be of any type.
 * @param parseFormat - An optional parameter specifying the format(s) to parse the date. It can be a string or an array of strings.
 * @returns A Date object if the conversion is successful, otherwise null.
 */
export declare function toDateTime(value: unknown, parseFormat?: string | string[]): Date | null;
/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {'boolean'} valueType - The target type: 'boolean'.
 * @returns {boolean} The converted value as a boolean.
 */
export declare function valueType<T>(value: T, valueType: 'boolean'): boolean;
/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {'date'} valueType - The target type: 'date'.
 * @returns {Date} The converted value as a Date.
 */
export declare function valueType<T>(value: T, valueType: 'date'): Date;
/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {'dateTime'} valueType - The target type: 'dateTime'.
 * @returns {Date} The converted value as a Date.
 */
export declare function valueType<T>(value: T, valueType: 'dateTime'): Date;
/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {'int'} valueType - The target type: 'int'.
 * @returns {number} The converted value as a number.
 */
export declare function valueType<T>(value: T, valueType: 'int'): number;
/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {'number'} valueType - The target type: 'number'.
 * @returns {number} The converted value as a number.
 */
export declare function valueType<T>(value: T, valueType: 'number'): number;
/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {'string'} valueType - The target type: 'string'.
 * @returns {string} The converted value as a string.
 */
export declare function valueType<T>(value: T, valueType: 'string'): string;
/**
 * Converts a value to the specified type.
 *
 * @template T - The type of the input value.
 * @param {T} value - The value to convert.
 * @param {ValueType} valueType - The target type.
 * @returns {unknown} The converted value.
 * @throws Will throw an error if the valueType is unsupported.
 */
export declare function valueType<T>(value: T, valueType: ValueType): unknown;
