/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */
import { Constructor } from "@codinus/types";
type TypeArrayLike = Float32Array | Float64Array | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray;
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
export {};
/**
 * Adds utility functions as prototype extensions to the object.
 * Used to enable Object.prototype methods for convenience.
 */
