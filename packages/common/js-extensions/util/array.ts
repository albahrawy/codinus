/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */
import { isDate, isNumber } from "./is";
import { toNumber } from "./to";
import { IRecord, IFunc } from "@codinus/types";

const MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Utility namespace for array manipulation functions.
 */

/**
 * Returns a new array with only unique elements from the original array.
 *
 * @template T - The type of elements in the array.
 * @param {Array<T>} array - The array from which to remove duplicate elements.
 * @returns {Array<T>} A new array containing only unique elements from the original array.
 */
export function arrayUnique<T>(array: Array<T>): Array<T> {
    return array ? [... new Set(array)] : array;
}

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
export function arrayRange(start: number, end: number): number[] {
    return Array.from(Array(end + 1 - start), (_, index) => index + start);
}


/**
 * Removes elements from an array based on a predicate function.
 *
 * @template T - The type of elements in the array.
 * @param {Array<T>} source - The array from which to remove elements.
 * @param {(value: T, index: number) => boolean} predicate - The function to test each element.
 * @returns {boolean} True if any elements were removed, otherwise false.
 */
export function removeFromArray<T>(source: Array<T>, predicate: (value: T, index: number) => boolean): boolean;
/**
 * Removes the first occurrence of a specific item from an array.
 *
 * @template T - The type of elements in the array.
 * @param {Array<T>} source - The array from which to remove the item.
 * @param {T} item - The item to remove.
 * @returns {number} The index of the removed item, or -1 if the item was not found.
 */
export function removeFromArray<T>(source: Array<T>, item: T): number;
export function removeFromArray<T>(source: Array<T>, predicate: T | ((value: T, index: number) => boolean)): number | boolean {

    if (typeof predicate !== 'function') {
        if (!Array.isArray(source) || !predicate) { return -1; }
        const index = source.indexOf(predicate);
        if (index >= 0) {
            source.splice(index, 1);
            return index;
        }
        return -1;
    } else {
        if (!Array.isArray(source))
            return false;
        let response = false;
        let i = source.length;
        const pred = predicate as ((value: T, index: number) => boolean);
        while (i--) {
            if (pred(source[i], i)) {
                source.splice(i, 1);
                response = true;
            }
        }

        return response;
    }
}


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
export function addToArray<T>(source: Array<T>, ...items: [value: T, condition?: boolean][]): Array<T> {
    if (!source || !items)
        return source;
    source.push(...items.filter(i => i[0] && i[1] !== false).map(i => i[0]));
    return source;
}


/**
 * Populates an array with the provided items based on their conditions.
 *
 * @template T - The type of the items in the array.
 * @param {...[value: T, condition?: boolean][]} items - The items to populate the array with. Each item is a tuple where the first element is the value and the second element is an optional condition. If the condition is `false`, the item will be excluded from the resulting array.
 * @returns {T[]} An array containing the values of the items that meet the condition.
 */
export function arrayPopulate<T>(...items: [value: T, condition?: boolean][]): T[] {
    if (!items)
        return [];
    return items.filter(i => i[0] && i[1] !== false).map(i => i[0]);
}


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
export function arrayToMap<TItem, TKey = string, TValue = TItem>(array: Array<TItem> | ReadonlyArray<TItem>,
    keySelector: (item: TItem, index: number) => TKey,
    valueSelector?: (item: TItem, index: number) => TValue): Map<TKey, TValue> {
    const map = new Map<TKey, TValue>();
    if (!valueSelector)
        valueSelector = t => t as unknown as TValue;
    array.forEach((item, index) => map.set(keySelector(item, index), valueSelector(item, index)));
    return map;
}

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
export function arrayFromMap<TItem, TValue, TKey = string>(map: Map<TKey, TValue>,
    transform?: (key: TKey, value: TValue) => TItem): Array<TItem> {
    if (!transform)
        transform = (k, v) => v as unknown as TItem;
    const resultArray: TItem[] = [];
    map.forEach((v, k) => resultArray.push(transform(k, v)));
    return resultArray;
}

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
export function arrayFromObject<TItem, TResult>(source: IRecord<TItem>,
    transform?: (key: string, value: TItem) => TResult): Array<TResult> {
    if (!transform)
        transform = (k, v) => v as unknown as TResult;
    const resultArray: TResult[] = [];
    for (const key in source)
        resultArray.push(transform(key, source[key]));
    return resultArray;
}


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
export function arrayIntersection<T>(arr1: T[], arr2: T[]): T[] {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    return [...new Set([...set1].filter((item) => set2.has(item)))];
}

/**
 * Calculates the sum of the elements in an array. Optionally, a transform function can be provided
 * to convert each element to a number before summing.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} array - The array of elements to sum.
 * @param {IFunc<T, number>} [transform] - An optional transform function to convert each element to a number.
 * @returns {number} The sum of the elements in the array.
 */
export function arraySum<T>(array: T[], transform?: IFunc<T, number>): number {
    const getter = transform ?? (v => toNumber(v, 0));
    return array.reduce((acc, value) => acc + getter(value), 0) ?? 0;
}


/**
 * Calculates the average of the elements in an array.
 * 
 * @template T - The type of elements in the array.
 * @param {T[]} array - The array of elements to calculate the average from.
 * @param {IFunc<T, number>} [transform] - An optional transform function to apply to each element before averaging.
 * @returns {number} The average of the elements in the array. Returns 0 if the array is empty or not an array.
 */
export function arrayAvg<T>(array: T[], transform?: IFunc<T, number>): number {
    if (!Array.isArray(array) || array.length == 0)
        return 0;
    return arraySum(array, transform) / array.length;
}


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
export function arraySort<T>(array: T[], transform: IFunc<T, unknown> | undefined = undefined, direction: 1 | -1 = 1, locale?: string): T[] {
    return sortCore(array, direction, transform, locale);
}


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
export function arrayToObject<T, O>(source: Array<T> | ReadonlyArray<T>, callback: (value: T, index: number) => [string, O], ignoreNull = false): IRecord<O> {
    return (source as T[]).reduce((ob, currentValue, index) => {
        const [key, value] = callback(currentValue, index);
        if (key != null && (value != null || !ignoreNull))
            ob[key] = value;
        return ob;
    }, {} as IRecord<O>);
}

/**
 * Groups the elements of a given iterable according to the string values returned by a provided callback function. 
 *  
 * @param source - The source array to group it's elements.
 * @param callback A function to execute for each element in the iterable. 
 * It should return a value that can get coerced into a property key (string or symbol) 
 * indicating the group of the current element. The function is called with the following arguments:
 * @returns an object has separate properties for each group, containing arrays with the elements in the group.
*/
export function arrayGroupBy<T>(source: Array<T>, callback: (value: T, index: number) => string): IRecord<T[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nativeGroupBy = (Object as any).groupBy;
    if (typeof nativeGroupBy === 'function') {
        return nativeGroupBy(source, callback);
    }
    return source.reduce((acc, value, index) => {
        const key = callback(value, index);
        acc[key] ??= []
        acc[key].push(value);
        return acc;
    }, {} as IRecord<T[]>);
}

// export const arrays = {
//     unique,
//     joinAsPath,
//     enumerableRange,
//     remove,
//     toMap,
//     intersect,
//     sum,
//     sort,
//     sortDescending
// }

//TODO: add min and max

function sortCore<T>(array: T[], direction: 1 | -1, transform?: IFunc<T, unknown>, locale?: string): T[] {
    if (!Array.isArray(array))
        return array;
    const getter = transform ?? (v => v);
    const safeGetter = (v: T) => convertToSafeValue(getter(v));
    const collator = typeof locale === 'string' ? new Intl.Collator(locale) : undefined;
    return array.sort((a, b) => performSort(safeGetter(a), safeGetter(b), direction, collator));
}

function convertToSafeValue(value: unknown) {
    if (isDate(value))
        return value.valueOf();
    if (isNumber(value)) {
        return value < MAX_SAFE_INTEGER ? value : value + '';
    }
    return value;
}

function performSort(valueA: unknown, valueB: unknown, direction: 1 | -1, collator?: Intl.Collator) {
    const valueAType = typeof valueA;
    const valueBType = typeof valueB;
    if (valueAType !== valueBType) {
        if (valueAType === 'number')
            valueA += '';
        if (valueBType === 'number')
            valueB += '';
    }

    let comparatorResult = 0;
    if (valueA != null && valueB != null) {
        // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
        if (collator && typeof valueA === 'string' && typeof valueB === 'string') {
            comparatorResult = collator.compare(valueA, valueB);
        } else {
            if (valueA > valueB)
                comparatorResult = 1;
            else if (valueA < valueB)
                comparatorResult = -1;
        }
    } else if (valueA != null) {
        comparatorResult = 1;
    } else if (valueB != null) {
        comparatorResult = -1;
    }

    return comparatorResult * direction;
}


/**
 * Adds utility functions as prototype extensions to the Array object.
 * Used to enable Array.prototype methods for convenience.
 */
// export function addProtoTypeExtensions() {
//     // if (!Array.prototype.unique)
//     //     Array.prototype.unique = function () { return unique(this); }
//     // if (!Array.prototype.joinAsPath)
//     //     Array.prototype.joinAsPath = function () { return joinAsPath(...this); }
//     // if (!Array.enumerableRange)
//     //     Array.enumerableRange = enumerableRange;
// }


// Declaration merging for Array prototype extensions
//declare global {

// interface Array<T> {
//     unique(): Array<T>;
//     joinAsPath(): string;
//     remove<T>(source: Array<T>, item: T): number;
//     toMap<V, K = string>(array: Array<V>, keyGetter: IFunc<V, K>): Map<K, V>;
// }

// interface ArrayConstructor {
//     enumerableRange(start: number, end: number): number[];
// }
//}