/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

//@ts-expect-error path
import { Constructor, IFunc, IGenericRecord, IRecord, Nullable } from "codinus-types";

/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */
declare type TypeArrayLike = Float32Array | Float64Array | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray;
declare type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never
declare type SpreadTwo<L, R> = Id<{ [K in keyof L | keyof R]: K extends keyof L & keyof R ? L[K] & R[K]
    : K extends keyof L ? L[K] : K extends keyof R ? R[K] : never; }>;
declare type Spread<A extends [...any]> = A extends [infer L, ...infer R] ? SpreadTwo<L, Spread<R>> : unknown;

declare type _StringOf<N extends number, R extends unknown[]> = R['length'] extends N ? R : _StringOf<N, [string, ...R]>;
declare type StringOf<N extends number> = N extends N ? number extends N ? string[] : _StringOf<N, []> : never;
declare type IDateLocale = {
    dayNames?: {
        long?: StringOf<7>;
        short?: StringOf<7>;
        narrow?: StringOf<7>;
    };
    monthNames?: {
        long?: StringOf<12>;
        short?: StringOf<12>;
        narrow?: StringOf<12>;
    };
    dateNames?: StringOf<31>;
    weekStartsOn?: number;
};

declare type ObjectCallBackType<TSource, TReturn, TKey extends keyof TSource = keyof TSource & string> = (key: TKey, value: TSource[TKey]) => TReturn;

export declare type ValueType = 'boolean' | 'date' | 'dateTime' | 'int' | 'number' | 'string';

export declare type MergedObject<T extends [...any]> = Spread<T>;
/**
 * Returns a new array with only unique elements from the original array.
 *
 * @template T - The type of elements in the array.
 * @param {Array<T>} array - The array from which to remove duplicate elements.
 * @returns {Array<T>} A new array containing only unique elements from the original array.
 */
export declare function arrayUnique<T>(array: Array<T>): Array<T>;

/**
 * Generates an array of numbers within a specified range.
 *
 * @param start - The starting number of the range (inclusive).
 * @param end - The ending number of the range (inclusive).
 * @returns An array of numbers from start to end, inclusive.
 *
 * @example
 * ```typescript
 * const range = arrayRange(1, 5);
 * console.log(range); // Output: [1, 2, 3, 4, 5]
 * ```
 */
export declare function arrayRange(start: number, end: number): number[];


/**
 * Removes elements from an array based on a predicate function.
 *
 * @template T - The type of elements in the array.
 * @param {Array<T>} source - The array from which to remove elements.
 * @param {(value: T, index: number) => boolean} predicate - The function to test each element.
 * @returns {boolean} True if any elements were removed, otherwise false.
 */
export declare function removeFromArray<T>(source: Array<T>, predicate: (value: T, index: number) => boolean): boolean;
/**
 * Removes the first occurrence of a specific item from an array.
 *
 * @template T - The type of elements in the array.
 * @param {Array<T>} source - The array from which to remove the item.
 * @param {T} item - The item to remove.
 * @returns {number} The index of the removed item, or -1 if the item was not found.
 */
export declare function removeFromArray<T>(source: Array<T>, item: T): number;
export declare function removeFromArray<T>(source: Array<T>, predicate: T | ((value: T, index: number) => boolean)): number | boolean;

/**
 * Adds items to the source array based on a condition.
 *
 * @template T - The type of elements in the array.
 * @param {Array<T>} source - The source array to which items will be added.
 * @param {...[value: T, condition?: boolean][]} items - The items to be added, each item is a tuple where the first element is the value to add and the second element is an optional condition.
 * @returns {Array<T>} The updated source array.
 *
 * @example
 * const source = [1, 2, 3];
 * addToArray(source, [4, true], [5, false], [6]);
 * // source is now [1, 2, 3, 4, 6]
 */
export declare function addToArray<T>(source: Array<T>, ...items: [value: T, condition?: boolean][]): Array<T>;

/**
 * Populates an array with the provided items based on their conditions.
 *
 * @template T - The type of the items in the array.
 * @param {...[value: T, condition?: boolean][]} items - The items to populate the array with. Each item is a tuple where the first element is the value and the second element is an optional condition. If the condition is `false`, the item will be excluded from the resulting array.
 * @returns {T[]} An array containing the values of the items that meet the condition.
 */
export declare function arrayPopulate<T>(...items: [value: T, condition?: boolean][]): T[];

/**
 * Converts an array or readonly array into a Map.
 *
 * @template TItem - The type of the items in the array.
 * @template TKey - The type of the keys in the resulting Map. Defaults to string.
 * @template TValue - The type of the values in the resulting Map. Defaults to TItem.
 * 
 * @param {Array<TItem> | ReadonlyArray<TItem>} array - The array to convert into a Map.
 * @param {IFunc<TItem, TKey>} keySelector - A function that extracts the key for each item in the array.
 * @param {IFunc<TItem, TValue>} [valueSelector] - An optional function that extracts the value for each item in the array. If not provided, the item itself is used as the value.
 * 
 * @returns {Map<TKey, TValue>} A Map where the keys are generated by the keyGetter function and the values are generated by the valueGetter function.
 */
export declare function arrayToMap<TItem, TKey = string, TValue = TItem>(array: Array<TItem> | ReadonlyArray<TItem>,
    keySelector: (item: TItem, index: number) => TKey,
    valueSelector?: (item: TItem, index: number) => TValue): Map<TKey, TValue>;

/**
 * Converts a Map to an array using an optional getter function.
 *
 * @template TItem - The type of the items in the resulting array.
 * @template TValue - The type of the values in the map.
 * @template TKey - The type of the keys in the map. Defaults to string.
 * 
 * @param {Map<TKey, TValue>} map - The map to convert to an array.
 * @param {(key: TKey, value: TValue) => TItem} [transform] - An optional function to transform each key-value pair into an item for the array.
 * @returns {Array<TItem>} An array containing the items generated from the map.
 */
export declare function arrayFromMap<TItem, TValue, TKey = string>(map: Map<TKey, TValue>,
    transform?: (key: TKey, value: TValue) => TItem): Array<TItem>;

/**
 * Converts an object to an array using an optional getter function.
 *
 * @template TItem - The type of the items in the resulting array.
 * @template TValue - The type of the values in the object.
  * 
 * @param {IRecord<TItem>} source - The object to convert to an array.
 * @param {(key: string, value: TItem) => TResult} [transform] - An optional function to transform each key-value pair into an item for the array.
 * @returns {Array<TResult>} An array containing the items generated from the map.
 */
export declare function arrayFromObject<TItem, TResult>(source: IRecord<TItem>,
    transform?: (key: string, value: TItem) => TResult): Array<TResult>;

/**
 * Returns an array containing the intersection of two arrays.
 * The intersection of two arrays is a new array that contains all of the elements that are present in both arrays.
 *
 * @template T - The type of elements in the arrays.
 * @param arr1 - The first array.
 * @param arr2 - The second array.
 * @returns An array containing the elements that are present in both `arr1` and `arr2`.
 *
 * @example
 * ```typescript
 * const array1 = [1, 2, 3, 4];
 * const array2 = [3, 4, 5, 6];
 * const result = arrayIntersection(array1, array2);
 * console.log(result); // Output: [3, 4]
 * ```
 */
export declare function arrayIntersection<T>(arr1: T[], arr2: T[]): T[];

/**
 * Calculates the sum of the elements in an array. Optionally, a transform function can be provided
 * to convert each element to a number before summing.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} array - The array of elements to sum.
 * @param {IFunc<T, number>} [transform] - An optional transform function to convert each element to a number.
 * @returns {number} The sum of the elements in the array.
 */
export declare function arraySum<T>(array: T[], transform?: IFunc<T, number>): number;

/**
 * Calculates the average of the elements in an array.
 * 
 * @template T - The type of elements in the array.
 * @param {T[]} array - The array of elements to calculate the average from.
 * @param {IFunc<T, number>} [transform] - An optional transform function to apply to each element before averaging.
 * @returns {number} The average of the elements in the array. Returns 0 if the array is empty or not an array.
 */
export declare function arrayAvg<T>(array: T[], transform?: IFunc<T, number>): number;

/**
 * Sorts an array based on a transformation function and direction.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} array - The array to be sorted.
 * @param {IFunc<T, unknown>} [transform] - An optional transformation function to apply to each element before sorting.
 * @param {1 | -1} [direction=1] - The direction of the sort: 1 for ascending, -1 for descending.
 * @param {string} [locale] - An optional locale string to use for locale-sensitive string comparisons.
 * @returns {T[]} - The sorted array.
 */
export declare function arraySort<T>(array: T[], transform: IFunc<T, unknown> | undefined, direction: 1 | -1, locale?: string): T[];

/**
 * Converts an array or readonly array into an object using a callback function to generate key-value pairs.
 *
 * @template T - The type of elements in the source array.
 * @template O - The type of values in the resulting object.
 * @param {Array<T> | ReadonlyArray<T>} source - The source array to convert.
 * @param {(value: T, index: number) => [string, O]} callback - A function that takes an element and its index and returns a tuple containing the key and value for the object.
 * @param {boolean} [ignoreNull=false] - Whether to ignore null values in the resulting object.
 * @returns {IRecord<O>} The resulting object with keys and values generated by the callback function.
 */
export declare function arrayToObject<T, O>(source: Array<T> | ReadonlyArray<T>, callback: (value: T, index: number) => [string, O], ignoreNull): IRecord<O>;

/**
 * Groups the elements of a given iterable according to the string values returned by a provided callback function. 
 *  
 * @param source - The source array to group it's elements.
 * @param callback A function to execute for each element in the iterable. 
 * It should return a value that can get coerced into a property key (string or symbol) 
 * indicating the group of the current element. The function is called with the following arguments:
 * @returns an object has separate properties for each group, containing arrays with the elements in the group.
*/
export declare function arrayGroupBy<T>(source: Array<T>, callback: (value: T, index: number) => string): IRecord<T[]>;

/**
 * Registers locale-specific information for formatting dates.
 * @param {string} code - The locale code.
 * @param {IDateLocale} info - The locale-specific information.
 */
export declare function registerDateLocale(code: string, info: IDateLocale): void;
/**
 * Parses a date string according to the specified format.
 *
 * @param value - The date string to parse.
 * @param parseFormat - The format to use for parsing the date string.
 * @param preserveTime - Optional. If true, preserves the time component of the date. Defaults to false.
 * @returns The parsed Date object if the input is valid, otherwise null.
 */
export declare function parseDateExact(value: string, parseFormat: string, preserveTime?: boolean): Date | null;
/**
 * Parses a given value into a Date object based on the provided format(s).
 *
 * @param value - The value to be parsed. It can be a string, number, or Date object.
 * @param parseFormat - Optional. The format(s) to use for parsing the string value. It can be a single format string or an array of format strings.
 * @param preserveTime - Optional. A boolean indicating whether to preserve the time component of the parsed date. Defaults to true.
 * @returns A Date object if the value can be parsed successfully; otherwise, null.
 */
export declare function parseDate(value: unknown, parseFormat?: string | string[], preserveTime?: boolean): Date | null;
/**
 * Formats a given date according to the specified format string and locale.
 *
 * @param dateValue - The date to be formatted.
 * @param formatString - An optional string specifying the format. If not provided, a default format will be used.
 * @param locale - An optional string specifying the locale to be used for formatting.
 * @returns The formatted date string, or null if the input date is invalid.
 */
export declare function formatDate(dateValue: Date, formatString?: string, locale?: string): string | null;
/**
 * Formats a given Date object to an ISO string.
 *
 * @param dateValue - The Date object to format.
 * @param onlyDate - Optional boolean indicating whether to format only the date part (without time).
 * @returns The formatted ISO string.
 * @throws RangeError - If the provided dateValue is invalid.
 */
export declare function formatToISOString(dateValue: Date, onlyDate?: boolean): string;
/**
 * Checks if the provided value is a valid Date object.
 * @param value - The value to check.
 * @returns True if the value is a valid Date object, otherwise false.
 */
export declare function isValidDate(value: unknown): value is Date;
/**
 * Gets an array of month names in the specified style and locale.
 * @param {'long' | 'short' | 'narrow'} [style='long'] - The style of month names to return (long, short, or narrow).
 * @param {string} [locale] - The locale code used for getting the month names. If not provided, the default locale will be used.
 * @returns {string[]} - An array of month names based on the specified style and locale.
 */
export declare function getMonthNames(style?: 'long' | 'short' | 'narrow', locale?: string): string[];
/**
 * Returns an array of date names for the specified locale.
 *
 * @param locale - Optional. A string with a BCP 47 language tag, or an array of such strings. If not provided, the default locale will be used.
 * @returns An array of date names for the specified locale.
 */
export declare function getDateNames(locale?: string): string[];
/**
 * Gets an array of day names in the specified style and locale.
 * @param {'long' | 'short' | 'narrow'} [style='long'] - The style of day names to return (long, short, or narrow).
 * @param {string} [locale] - The locale code used for getting the day names. If not provided, the default locale will be used.
 * @returns {string[]} - An array of day names based on the specified style and locale.
 */
export declare function getDayOfWeekNames(style?: 'long' | 'short' | 'narrow', locale?: string): string[];
/**
 * Gets the year name of the provided Date object in the specified locale.
 * @param {Date} date - The Date object to get the year name from.
 * @param {string} [locale] - The locale code used for getting the year name. If not provided, the default locale will be used.
 * @returns {string} - The year name of the Date object in the specified locale.
 */
export declare function getYearName(date: Date, locale?: string): string | null;
/**
 * Gets the first day of the week based on the locale.
 * @returns {number} - The first day of the week (0 for Sunday, 1 for Monday, etc.).
 */
export declare function getFirstDayOfWeek(): number;
/**
 * Gets the number of days in the specified month.
 * @param {number} month - The month number (1-12) to get the days for.
 * @param {number} [year] - The year to get the days for. If not provided, the current year will be used.
 * @returns {number} - The number of days in the specified month.
 */
export declare function daysInMonth(month: number, year?: number): number;
/**
 * Checks if the specified year is a leap year.
 * @param {number} year - The year to check.
 * @returns {boolean} - True if the year is a leap year, otherwise false.
 */
export declare function isLeapYear(year?: number): boolean;
/**
 * Adds the specified number of years to the given date.
 * @param {Date} date - The date to which years will be added.
 * @param {number} years - The number of years to add. Positive values will add years to the future, and negative values will subtract years from the past.
 * @returns {Date} - A new Date object representing the result of adding the years.
 */
export declare function addYears(date: Date, years: number): Date;
/**
 * Adds the specified number of months to the given date.
 * @param {Date} date - The date to which months will be added.
 * @param {number} months - The number of months to add. Positive values will add months to the future, and negative values will subtract months from the past.
 * @returns {Date} - A new Date object representing the result of adding the months.
 */
export declare function addMonths(date: Date, months: number): Date;
/**
 * Adds the specified number of days to the given date.
 * @param {Date} date - The date to which days will be added.
 * @param {number} days - The number of days to add. Positive values will add days to the future, and negative values will subtract days from the past.
 * @returns {Date} - A new Date object representing the result of adding the days.
 */
export declare function addDays(date: Date, days: number): Date;
/**
 * Returns the closest date to the provided date from an array of dates.
 * @param {Date} date - The date to compare.
 * @param {Date[]} datesArray - The array of dates to compare against.
 * @returns {Date | null} - The closest date from the array, or null if the input date is invalid.
 */
export declare function dateClosest(date: Date, datesArray: Array<Date>): Date | null;
/**
 * Compares two dates and returns 1 if the first date is greater, -1 if the second date is greater, or 0 if they are equal.
 * @param {Date} first - The first date to compare.
 * @param {Date} second - The second date to compare.
 * @returns {1 | -1 | 0} - The result of the comparison.
 * @throws {Error} - If either of the input dates is invalid.
 */
export declare function dateCompare(first: Date, second: Date): 1 | -1 | 0;
/**
 * Returns the difference between two dates in the specified interval.
 * @param {Date} first - The first date.
 * @param {Date} second - The second date.
 * @param {'d' | 'M' | 'y' | 'h' | 'm' | 's' | 'ms'} [interval='d'] - The interval to calculate the difference in.
 * @returns {number} - The difference between the two dates in the specified interval.
 * @throws {Error} - If either of the input dates is invalid.
 */
export declare function dateDifferent(first: Date, second: Date, interval?: 'd' | 'M' | 'y' | 'h' | 'm' | 's' | 'ms'): number;

/**
 * Generates a new GUID (Globally Unique Identifier).
 * @returns {string} - A new GUID string.
 */
export declare function createGUID(): string;

/**
 * Validates whether the provided string is a valid GUID.
 * @param {string} guid - The GUID string to be validated.
 * @returns {boolean} - True if the provided string is a valid GUID, false otherwise.
 */
export declare function isValidGUID(guid?: string): boolean;

/**
 * Appends a value to a FormData object.
 *
 * @param formData - The FormData object to append to.
 * @param name - The name of the field whose data is contained in `value`.
 * @param value - The value to append. Can be a string, Blob, array, or object.
 * @param fileName - Optional. The filename to use if the value is a Blob.
 *
 * @remarks
 * - If `name` is falsy or `value` is null or undefined, the function returns without appending anything.
 * - If `value` is a string, it is appended directly.
 * - If `value` is a Blob, it is appended with the optional `fileName`.
 * - If `value` is an array or an object, it is stringified to JSON and then appended.
 * - For other types of `value`, it is converted to a string and then appended.
 */
export declare function appendToFormData(formData: FormData, name: string, value: unknown, fileName?: string): void;

/**
 * Checks if the given value is an instance of HTMLElement.
 *
 * @param value - The value to check.
 * @returns True if the value is an HTMLElement, otherwise false.
 */
export declare const isHTMLElement: (value: any) => value is HTMLElement;
/**
 * Checks if a value is a plain object.
 *
 * @param value - The value to check.
 * @returns True if the value is a plain object, otherwise false.
 */
export declare const isObject: (value: unknown) => value is Record<string, any>;
/**
 * Checks if the given value is a class Type.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a class type, otherwise `false`.
 */
export declare const isClassType: (value: unknown) => value is new (...args: any[]) => any;
/**
 * Checks if the given value is a class instance.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a class instance, otherwise `false`.
 */
export declare const isClassInstance: (value: unknown) => value is object;
/**
 * Checks if the given value is of type string.
 *
 * @param value - The value to check.
 * @returns True if the value is a string, otherwise false.
 */
export declare const isString: (value: unknown) => value is string;
/**
 * Checks if the given value is of type boolean.
 *
 * @param value - The value to check.
 * @returns True if the value is a boolean, otherwise false.
 */
export declare const isBoolean: (value: unknown) => value is boolean;
/**
 * Checks if the given value is a finite number and not NaN.
 *
 * @param value - The value to check.
 * @returns True if the value is a finite number and not NaN, otherwise false.
 */
export declare const isNumber: (value: unknown) => value is number;
/**
 * Checks if the provided value is of type `bigint`.
 *
 * @param value - The value to check.
 * @returns A boolean indicating whether the value is a `bigint`.
 */
export declare const isBigInt: (value: unknown) => value is bigint;
/**
 * Checks if the given value is a hexadecimal number string.
 *
 * @param value - The value to check.
 * @returns True if the value is a hexadecimal number string, false otherwise.
 */
export declare const isNumberHex: (value: unknown) => value is string;
/**
 * Checks if the given value is a string that represents a valid number.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a string that can be converted to a number and back to the same string, otherwise `false`.
 */
export declare const isNumberString: (value: unknown) => boolean;
/**
 * Checks if a value is of type symbol.
 *
 * @param value - The value to check.
 * @returns True if the value is a symbol, otherwise false.
 */
export declare const isSymbol: (value: unknown) => value is symbol;
/**
 * Checks if the provided value is an array or a readonly array.
 *
 * @template T - The type of elements in the array.
 * @param value - The value to check.
 * @returns True if the value is an array or a readonly array, otherwise false.
 */
export declare function isArray<T>(value: T[] | readonly T[] | unknown): value is Array<T> | ReadonlyArray<T>;
/**
 * Checks if the provided value is a typed array.
 *
 * This function verifies whether the given value is a typed array by
 * checking if it is not null and matches the regular expression for
 * typed arrays.
 *
 * @param value - The value to check.
 * @returns True if the value is a typed array, false otherwise.
 */
export declare const isTypedArray: (value: unknown) => value is TypeArrayLike;
/**
 * Checks if the provided value is an array-like object representing function arguments.
 *
 * @param value - The value to check.
 * @returns True if the value is an array-like object representing function arguments, otherwise false.
 */
export declare const isArgumentsArray: (value: unknown) => value is ArrayLike<unknown>;
/**
 * Checks if the given value is a function.
 *
 * @param value - The value to check.
 * @returns True if the value is a function, otherwise false.
 */
export declare const isFunction: (value: unknown) => value is Function;
/**
 * Checks if the given value is a string that matches the pattern of a function or an arrow function.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a string and matches the function or arrow function pattern, otherwise `false`.
 */
export declare const isFunctionString: (value: unknown) => boolean;
/**
 * Checks if the given value is a Date object.
 *
 * @param value - The value to check.
 * @returns True if the value is a Date object, otherwise false.
 */
export declare const isDate: (value: unknown) => value is Date;
/**
 * Checks if the provided value is a Map.
 *
 * @param value - The value to check.
 * @returns True if the value is a Map, otherwise false.
 */
export declare const isMap: (value: unknown) => value is Map<unknown, unknown>;
/**
 * Checks if the provided value is a Set.
 *
 * @param value - The value to check.
 * @returns True if the value is a Set, otherwise false.
 */
export declare const isSet: (value: unknown) => value is Set<unknown>;
/**
 * Checks if the given file extension corresponds to an image file.
 *
 * @param extension - The file extension to check.
 * @returns `true` if the extension is an image file extension, otherwise `false`.
 */
export declare const isImageFile: (extension: string) => boolean;
/**
 * Checks if a value is a primitive type.
 *
 * A primitive type is `null`, `undefined`, `string`, `number`, `boolean`, `symbol`, or `bigint`.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a primitive type, otherwise `false`.
 */
export declare const isPrimitive: (value: unknown) => boolean;
/**
 * Checks if the given value is an instance of RegExp.
 *
 * @param value - The value to check.
 * @returns True if the value is a RegExp instance, otherwise false.
 */
export declare const isRegExp: (value: unknown) => value is RegExp;
/**
 * Checks if a value is empty.
 *
 * A value is considered empty if it is:
 * - `null` or `undefined`
 * - An array, string, typed array, or arguments array with a length of 0
 * - A Map or Set with a size of 0
 * - An object with no own enumerable properties
 * - Any other value is considered empty
 *
 * @param value - The value to check for emptiness.
 * @returns `true` if the value is empty, otherwise `false`.
 */
export declare function isEmpty(value: unknown): boolean;
/**
 * Compares two values to determine if they are equal.
 *
 * This function performs a deep comparison between two values to determine if they are equivalent.
 * It supports comparison of primitive values, objects, arrays, and dates.
 *
 * @param first - The first value to compare.
 * @param second - The second value to compare.
 * @returns `true` if the values are equal, `false` otherwise.
 */
export declare function isEqual(first: unknown, second: unknown): boolean;
/**
 * Checks if a given value is an instance of a specified constructor.
 *
 * @param Ctor - The constructor function to check against.
 * @param value - The value to check.
 * @returns `true` if the value is an instance of the constructor or matches certain conditions for objects, otherwise `false`.
 */
export declare function is(Ctor: Constructor, value: unknown): boolean;

/**
 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string and return empty string when error occured. 
 * @param value A JavaScript value, usually an object or array, to be converted.
 * @param replacer A function that transforms the results.
 * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @returns valid JSON string or empty string.
 */
export declare function jsonStringify(value: unknown, replacer?: (this: unknown, key: string, value: unknown) => unknown, space?: string | number): string;

/**
 * Converts a JavaScript Object Notation (JSON) string into an object.
 * @param input A valid JSON string or JSON object or an array
 * @param reviver A function that transforms the results. This function is called for each member of the object.
 * If a member contains nested objects, the nested objects are transformed before the parent object is.
 * @returns input object or array or parsed object from JSON string if value. otherwise null.
 */
export declare function jsonParse<T = unknown>(input: string | T, reviver?: (this: unknown, key: string, value: unknown) => unknown): T | null;
/**
 * Transform a JavaScript Object Notation (JSON) object which has nested properties into flat JSON object.
 * @param source A JavaScript nested object to be flatten.
 * @param connector the character used to connect nested keys. default value is '-'
 * @returns object contains one level with all nested properties.
 */
export declare function jsonFlatten(source: IGenericRecord, connector: string);
/**
 * An iterative method. It calls a provided callback function once for each property in a JSON object.
 * @param source A JavaScript value, usually an object.
 * @param callback A function to execute for each proeprty in the object. The function is called with the arguments:key and value.
 * @param filter A function to execute if exists for each proeprty in the object before executing a callback function and executes callback only if it returns true.
 */
export declare function jsonForEach<TItem>(source: { [key: string]: TItem }, callback: (key: string, value: TItem) => void,
    filter?: (key: string, value: TItem) => boolean);

/**
 * An iterative method. It calls a provided callback function once for each property in an object and constructs a new object from the results.
 * @param source A JavaScript value, usually an object.
 * @param callback A function to execute for each property in the object. Its return value is added as a value for the key in the new object.
 * The function is called with the following arguments value and key.
 * @param ignoreNull true to eliminate keys with null or undefined value from the new object. default is false.
 * @returns A new object with each property with key and value being the result of the callback function.
 */
export declare function jsonMap<T>(source: IRecord<T>, callback: (value: T, key: string) => unknown, ignoreNull: boolean);

/**
 * An iterative method. It calls a provided callback function once for each property in an object and constructs a new Array from the results.
 * @param source A JavaScript value, usually an object.
 * @param callback A function to execute for each property in the object. Its return value is added as an item in the new Array.
 * The function is called with the following arguments value and key.
 * @param ignoreNull true to eliminate keys with null or undefined value from the new array. default is false.
 * @returns A new Array contains each property value being the result of the callback function.
 */
export declare function jsonToArray<T, O>(source: IRecord<T>, callback: (value: T, key: string, index: number) => O, ignoreNull: boolean);

/**
 * Convert JSON object to array of key-value pair.
 * @param source A JavaScript value, usually an object.
 * @param ignoreNull true to eliminate keys with null or undefined value from the returned result. default is true.
 * @returns Array of key-value pair from Object key and value.
 */
export declare function jsonToKeyValueArray<TValue>(source: Nullable<IRecord<TValue>>, ignoreNull: boolean): ({ key: string; value: TValue; })[];
/**
 * Converts a JavaScript value to a an XML string. 
 * @param obj A JavaScript value, usually an object to be converted.
 * @param rootKey XML root node name. default is 'Data' 
 * @param placeInNode true to create sub node for each property. otherwise create an attribute. default is false.
 * @returns valid XML string.
 */

export declare function jsonToXml(obj: IGenericRecord, rootKey: string, placeInNode: boolean): string;

/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */
/**
 * Checks if the given value has a specific flag set.
 * @param {number} value - The value to check the flag against.
 * @param {number} flag - The flag value to be checked.
 * @returns {boolean} - True if the value has the flag set, false otherwise.
 */
export declare function hasFlag(value: number, flag: number): boolean;
/**
 * Converts a given number into an array of bit values.
 * Each bit value represents the power of 2 corresponding to the set bits in the binary representation of the input number.
 *
 * @param value - The number to be converted into bit values.
 * @returns An array of numbers, each representing a power of 2 corresponding to the set bits in the input number.
 *
 * @example
 * ```typescript
 * toBitValues(5); // returns [1, 4] because 5 in binary is 101
 * toBitValues(10); // returns [2, 8] because 10 in binary is 1010
 * ```
 */
export declare function toBitValues(value: number): number[];
/**
 * Pads a number to a specified length with a character (optional).
 * @param {number} value - The number to pad.
 * @param {number} length - The desired length of the padded number.
 * @param {string} [char] - The character to use for padding. Default is '0'.
 * @returns {string} - The padded number as a string.
 */
export declare function padStart(value: number, length: number, char?: string): string;
/**
 * Checks if a number is between a specified range (inclusive).
 * @param {number} value - The number to check.
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 * @returns {boolean} - True if the number is between the specified range, false otherwise.
 */
export declare function numberBetween(value: number, min: number, max: number): boolean;
/**
 * Generates an `Intl.NumberFormatOptions` object based on the provided format string.
 *
 * @param formatString - An optional string that specifies the desired number format.
 *                       - If the string includes '%', the style will be set to 'percent'.
 *                       - If the string includes ',', grouping will be enabled.
 *                       - The number of fraction digits will be determined by the position of '.' in the string.
 *                         If '.' is present, the number of digits after it will be used as the fraction digits.
 *                         If '.' is not present, the fraction digits will be set to 0.
 * @returns An `Intl.NumberFormatOptions` object if any options are set, otherwise `undefined`.
 */
export declare function generateFormatOption(formatString?: string): Intl.NumberFormatOptions | undefined;
/**
 * Formats a number according to the specified format string and locale.
 *
 * @param value - The number to format
 * @param formatString - Optional format string that defines how the number should be formatted.
 *                      If the format string contains a pattern like {n}, that section will be
 *                      replaced with the formatted number.
 * @param locale - Optional locale string (e.g., 'en-US', 'de-DE') to determine the formatting rules
 * @returns A string representation of the formatted number
 *
 * @example
 * // Returns "1,234.56"
 * formatNumber(1234.56, undefined, "en-US")
 *
 * @example
 * // With format string containing pattern
 * // Returns "The value is 1,234.56!"
 * formatNumber(1234.56, "The value is {n}!", "en-US")
 */
export declare function formatNumber(value: number, formatString?: string, locale?: string): string;
/**
 * Formats a file size number into a human-readable format based on the provided locale.
 * @param {number} size - The file size in bytes.
 * @param {string} [locale] - The locale to use for formatting. If not provided, the default locale is used.
 * @returns {string} - The formatted file size as a string with appropriate units.
 */
export declare function formatFileSize(size: number, locale?: string): string;
/**
 * Adds prototype extensions to the Number object.
 * This function extends the Number object with additional utility methods for formatting and flag operations.
 */

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

/**
 * Merges multiple objects together, combining their properties into a single object.
 * If there are conflicts between properties, the latter object's property will overwrite the former one.
 * Arrays are merged by removing duplicates.
 *
 * @param objects Rest parameter that accepts an arbitrary number of objects to be merged.
 * @returns The merged object.
 */
export declare function mergeObjects<T extends any[]>(...objects: [...T]): MergedObject<T>;
/**
 * Extracts a subset of properties from an object based on the provided keys and optional filter function.
 *
 * @param source The source object from which to extract the subset.
 * @param keys (Optional) An array of keys to extract from the source object.
 * If not provided, the function returns a shallow copy of the source object.
 * @param filter (Optional) A filter function that determines which properties to include in the subset.
 * Only properties for which the filter function returns `true` will be included.
 * @returns The extracted subset of the source object.
 */
export declare function subsetObject<T extends object>(source: T): T;
export declare function subsetObject<T extends object, K extends keyof T>(source: T, keys: K[]): Pick<T, K>;
export declare function subsetObject<T extends object, K extends keyof T>(source: T, keys: K[], filter?: (k: K, v: T[K]) => boolean): Partial<Pick<T, K>>;
export declare function subsetObject<T extends object, K extends keyof T>(source: T, keys?: K[], filter?: (k: K, v: T[K]) => boolean): unknown;
/**
 * Merges a subset of properties from one object into another object, optionally only if the target object does not already have the properties.
 *
 * @param target The target object to merge the subset into.
 * @param source The source object from which to extract the subset.
 * @param keys An array of keys to extract from the source object and merge into the target object.
 * @param onlyNoneExist (Optional) If `true`, only merge properties if they do not already exist in the target object.
 * @returns The merged target object.
 */
export declare function mergePartial<S extends object, T extends object, K extends keyof S>(target: T, source: S, keys: K[], onlyNoneExist?: boolean): T | MergedObject<[T, Partial<Pick<S, K>>]>;

/**
 * Creates a deep copy of the input value.
 * The function handles primitive types, arrays, objects, dates, typed arrays, and regular expressions.
 *
 * @param value The value to copy.
 * @returns A deep copy of the input value.
 */
export declare function copyObject<T>(value: T): T;

/**
 * Retrieves a value from an object based on the provided path (string or array of keys).
 * If the path does not exist in the object, it returns the specified default value.
 *
 * @param obj The object from which to retrieve the value.
 * @param path The path to the desired value, represented as a dot-separated string or an array of keys.
 * @param defaultValue (Optional) The default value to return if the path does not exist in the object.
 * @returns The value at the specified path or the default value if the path does not exist.
 */
export declare function getValue<T>(obj: unknown, path: string | string[], defaultValue?: T): T;
export declare function getValue(obj: unknown, path: string | string[], defaultValue?: unknown): unknown;

/**
 * Sets a value in an object based on the provided path (string or array of keys).
 * If the path does not exist in the object and `createIfNotExist` is `true`,
 * it creates the necessary nested objects/arrays.
 *
 * @param obj The object in which to set the value.
 * @param path The path to the property, represented as a dot-separated string or an array of keys.
 * @param value The value to set at the specified path.
 * @param createIfNotExist (Optional) If `true`, creates the necessary nested objects/arrays if the path does not exist in the object.
 * @returns The same instance of object.
 */
export declare function setValue<T>(obj: T, path: string | string[], value: unknown, createIfNotExist: boolean): T;

/**
 * An iterative method. It calls a provided callback function once for each property in an object.
 * @param source A JavaScript value, usually an object.
 * @param callback A function to execute for each proeprty in the object. The function is called with the arguments:key and value.
 * @param filter A function to execute if exists for each proeprty in the object before executing a callback function and executes callback only if it returns true.
 */
export declare function objectForEach<TSource>
    (source: TSource, callback: ObjectCallBackType<TSource, void>, filter?: ObjectCallBackType<TSource, boolean>): void;


/**
* Replaces placeholders in the input string with corresponding values from the provided object.
* @param {string} value - The input string containing placeholders in the format `{key}`.
* @param {any} obj - The object containing the values to be used as replacements for the placeholders.
* @returns {string} The formatted string with placeholders replaced by their corresponding values from the object.
*/
export declare function formatStringBy(value: string, obj: unknown): string;

/**
* Converts a string to camelCase format by removing spaces, hyphens, and apostrophes
* and capitalizing the first letter of each word (except the first word).
* @param {string} value - The input string to convert to camelCase.
* @returns {string} The camelCase formatted string.
*/
export declare function toCamelCase(value: string): string;

/**
* Capitalizes the first letter of the input string.
* @param {string} value - The input string to capitalize the first letter.
* @returns {string} The input string with the first letter capitalized.
*/
export declare function toFirstUpperCase(value: string): string;

/**
* Removes specified characters from the end (trailing) of the input string.
* @param {string} value - The input string to trim.
* @param {...string[]} chars - Optional list of characters to be trimmed from the end of the input string.
* If not provided, whitespace characters will be removed.
* @returns {string} The input string with specified characters trimmed from the end.
*/
export declare function trimStringTrailing(value: string, ...chars: string[]): string;

/**
* Removes specified characters from the beginning (head) of the input string.
* @param {string} value - The input string to trim.
* @param {...string[]} chars - Optional list of characters to be trimmed from the beginning of the input string.
* If not provided, whitespace characters will be removed.
* @returns {string} The input string with specified characters trimmed from the beginning.
*/
export declare function trimStringHead(value: string, ...chars: string[]): string;
/**
 * 
 * @param {string} value - The input string to trim.
 * @param {number} start - The index of the first character to remove. 
 * @param {number} end - The index of the last character to remove.  
 * @returns {string} A new string containing the original string without the specific range .
 */
export declare function removeFromString(value: string, start: number, end: number): string;

/**
 * Converts a Unicode string to a Base64 encoded string.
 *
 * This function takes a Unicode string, encodes it into a UTF-8 byte array,
 * and then converts that byte array into a Base64 encoded data URL.
 *
 * @param unicodeString - The Unicode string to be converted.
 * @returns A promise that resolves to the Base64 encoded string, or null if the conversion fails.
 */
export declare function stringToBase64(unicodeString: string): Promise<string | null>;
/**
 * Converts a Base64 data URL back to a Unicode string.
 *
 * @param base64DataUrl - The Base64 encoded data URL to be converted.
 * @returns A promise that resolves to the decoded Unicode string.
 */
export declare function base64ToString(base64DataUrl: string): Promise<string>;