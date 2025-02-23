/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */
import { Constructor } from "@codinus/types";

// // eslint-disable-next-line @typescript-eslint/no-namespace
// export namespace is {
type TypeArrayLike = Float32Array | Float64Array | Int8Array | Int16Array | Int32Array
    | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray;

const typeArrayReqx = /^\[object (?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)Array\]$/;
const arrowFuncRegx = /\([a-z|A-Z|0-9|_|\s|,|:]*\)[\s|:|a-z|A-Z|0-9|_|<|>]*=>/;
const funcRegx = /function[\s|a-z|A-Z|0-9|_]*\([a-z|A-Z|0-9|_|\s|,|:]*\)\s*{/;
const classReqx = /^\s*class/;
const hexRegex = /^0x[0-9a-fA-F]+$/;
const imageExtensions = ['jpg', 'png', 'gif', 'bmp', 'jpeg', 'jpe', 'tif', 'tiff'];

const getType = (value: unknown) => Object.prototype.toString.call(value).slice(8, -1);

const isType = <T>(value: unknown, type: string, instance: T): value is T => typeof value === type || value instanceof (instance as any);

/**
 * Checks if the given value is an instance of HTMLElement.
 *
 * @param value - The value to check.
 * @returns True if the value is an HTMLElement, otherwise false.
 */
export const isHTMLElement = (value: any): value is HTMLElement => {
    return value != null && (
        (window.HTMLElement && value instanceof HTMLElement) ||
        (typeof value === "object" && value.nodeType === 1 && value.nodeName)
    );
}


/**
 * Checks if a value is a plain object.
 *
 * @param value - The value to check.
 * @returns True if the value is a plain object, otherwise false.
 */
export const isObject = (value: unknown): value is Record<string, any> => typeof value === 'object' && value?.constructor === Object;


/**
 * Checks if the given value is a class.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a class, otherwise `false`.
 */
export const isClass = (value: unknown): boolean => !!value && typeof value === 'object' && classReqx.test(value.constructor.toString());


/**
 * Checks if the given value is of type string.
 *
 * @param value - The value to check.
 * @returns True if the value is a string, otherwise false.
 */
export const isString = (value: unknown): value is string => isType(value, 'string', String);


/**
 * Checks if the given value is of type boolean.
 *
 * @param value - The value to check.
 * @returns True if the value is a boolean, otherwise false.
 */
export const isBoolean = (value: unknown): value is boolean => isType(value, 'boolean', Boolean);


/**
 * Checks if the given value is a finite number and not NaN.
 *
 * @param value - The value to check.
 * @returns True if the value is a finite number and not NaN, otherwise false.
 */
export const isNumber = (value: unknown): value is number => isType(value, 'number', Number) && Number.isFinite(value) && !Number.isNaN(value);


/**
 * Checks if the provided value is of type `bigint`.
 *
 * @param value - The value to check.
 * @returns A boolean indicating whether the value is a `bigint`.
 */
export const isBigInt = (value: unknown): value is bigint => isType(value, 'bigint', BigInt);


/**
 * Checks if the given value is a hexadecimal number string.
 *
 * @param value - The value to check.
 * @returns True if the value is a hexadecimal number string, false otherwise.
 */
export const isNumberHex = (value: unknown): value is string => typeof value === 'string' && hexRegex.test(value);


/**
 * Checks if the given value is a string that represents a valid number.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a string that can be converted to a number and back to the same string, otherwise `false`.
 */
export const isNumberString = (value: unknown): boolean => typeof value === 'string' && !!value && (+value).toString() === value;


/**
 * Checks if a value is of type symbol.
 *
 * @param value - The value to check.
 * @returns True if the value is a symbol, otherwise false.
 */
export const isSymbol = (value: unknown): value is symbol => typeof value == 'symbol' || getType(value) === 'Symbol';


/**
 * Checks if the provided value is an array or a readonly array.
 *
 * @template T - The type of elements in the array.
 * @param value - The value to check.
 * @returns True if the value is an array or a readonly array, otherwise false.
 */
export function isArray<T>(value: T[] | readonly T[] | unknown): value is Array<T> | ReadonlyArray<T> {
    return Array.isArray?.(value) || value instanceof Array;
}

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
export const isTypedArray = (value: unknown): value is TypeArrayLike => value != null && typeArrayReqx.test(Object.prototype.toString.call(value));

/**
 * Checks if the provided value is an array-like object representing function arguments.
 *
 * @param value - The value to check.
 * @returns True if the value is an array-like object representing function arguments, otherwise false.
 */
export const isArgumentsArray = (value: unknown): value is ArrayLike<unknown> => getType(value) === 'Arguments';

/**
 * Checks if the given value is a function.
 *
 * @param value - The value to check.
 * @returns True if the value is a function, otherwise false.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const isFunction = (value: unknown): value is Function => typeof value === 'function';

/**
 * Checks if the given value is a string that matches the pattern of a function or an arrow function.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a string and matches the function or arrow function pattern, otherwise `false`.
 */
export const isFunctionString = (value: unknown): boolean => typeof value === 'string' && (funcRegx.test(value) || arrowFuncRegx.test(value));

/**
 * Checks if the given value is a Date object.
 *
 * @param value - The value to check.
 * @returns True if the value is a Date object, otherwise false.
 */
export const isDate = (value: unknown): value is Date => value instanceof Date || getType(value) === 'Date';

/**
 * Checks if the provided value is a Map.
 *
 * @param value - The value to check.
 * @returns True if the value is a Map, otherwise false.
 */
export const isMap = (value: unknown): value is Map<unknown, unknown> => value instanceof Map || getType(value) === 'Map';

/**
 * Checks if the provided value is a Set.
 *
 * @param value - The value to check.
 * @returns True if the value is a Set, otherwise false.
 */
export const isSet = (value: unknown): value is Set<unknown> => value instanceof Set || getType(value) === 'Set';


/**
 * Checks if the given file extension corresponds to an image file.
 *
 * @param extension - The file extension to check.
 * @returns `true` if the extension is an image file extension, otherwise `false`.
 */
export const isImageFile = (extension: string): boolean => imageExtensions.includes(extension?.toLowerCase());

/**
 * Checks if a value is a primitive type.
 *
 * A primitive type is `null`, `undefined`, `string`, `number`, `boolean`, `symbol`, or `bigint`.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a primitive type, otherwise `false`.
 */
export const isPrimitive = (value: unknown): boolean => value == null || (typeof value != 'object' && typeof value != 'function');

/**
 * Checks if the given value is an instance of RegExp.
 *
 * @param value - The value to check.
 * @returns True if the value is a RegExp instance, otherwise false.
 */
export const isRegExp = (value: unknown): value is RegExp => value instanceof RegExp;


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
export function isEmpty(value: unknown): boolean {
    if (value == null)
        return true;
    if (isBoolean(value))
        return false;
    if (isArray(value) || isString(value) || isTypedArray(value) || isArgumentsArray(value))
        return !value.length;
    if (isMap(value) || isSet(value))
        return !value.size;
    if (isObject(value))
        return !Object.values(value).some(v => v != null);
    return !value;
}

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
export function isEqual(first: unknown, second: unknown): boolean {
    if (first == null && second == null || first === second)
        return true;

    if (getType(first) != getType(second))
        return false;

    if (isDate(first) && isDate(second))
        return first.valueOf() === second.valueOf();

    if (isObject(first) && isObject(second)) {
        const keys1 = Object.keys(first);
        if (keys1.length !== Object.keys(second).length)
            return false;
        return keys1.every(k => isEqual(first[k], second[k]));
    }

    if (isArray(first) && isArray(second)) {
        if (first.length !== second.length)
            return false;
        const counts = new Map();
        const updateMap = (reqKey: unknown, addition: 1 | -1) => {
            if (isObject(reqKey) || isArray(reqKey) || isDate(reqKey)) {
                for (const selfKey of counts.keys())
                    if (isEqual(selfKey, reqKey)) {
                        reqKey = selfKey;
                        break;
                    }
            }
            counts.set(reqKey, (counts.get(reqKey) ?? 0) + addition);
        }
        first.forEach((v: unknown) => updateMap(v, 1));
        second.forEach((v: unknown) => updateMap(v, -1));
        return Array.from(counts.values()).every((count) => count === 0);
    }

    return first === second;
}


/**
 * Checks if a given value is an instance of a specified constructor.
 *
 * @param Ctor - The constructor function to check against.
 * @param value - The value to check.
 * @returns `true` if the value is an instance of the constructor or matches certain conditions for objects, otherwise `false`.
 */
export function is(Ctor: Constructor, value: unknown): boolean {
    return value instanceof Ctor || value != null &&
        (value.constructor === Ctor || (Ctor.name === 'Object' && typeof value === 'object'));
}

/**
 * Adds utility functions as prototype extensions to the object.
 * Used to enable Object.prototype methods for convenience.
 */
// export function addProtoTypeExtensions() { }
