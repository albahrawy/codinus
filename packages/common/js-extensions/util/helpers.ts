import { IGenericRecord, Nullable } from "@codinus/types";
import { isObject } from "./is";
import { jsonStringify } from "./json";
import { toStringValue } from "./to";

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
export function appendToFormData(formData: FormData, name: string, value: unknown, fileName?: string): void {
    if (!name || value == null)
        return;
    if (typeof value === 'string')
        formData.append(name, value);
    else if (value instanceof Blob)
        formData.append(name, value, fileName);
    else if (Array.isArray(value) || isObject(value))
        formData.append(name, jsonStringify(value));
    else
        formData.append(name, toStringValue(value));
}

/**
 * Retrieves a function from an object by its name and binds it to the object.
 *
 * @template T - The type of the function to be retrieved.
 * @param {Nullable<object>} obj - The object from which to retrieve the function.
 * @param {string} functionName - The name of the function to retrieve.
 * @returns {T | null} - The function bound to the object, or null if the function does not exist or the object is null.
 * @throws {Error} - Throws an error if the functionName is null or undefined.
 */
export function getFunction<T extends ((...args: unknown[]) => unknown) | null>(obj: Nullable<object>, functionName: string): T | null {
    if (functionName == null)
        throw new Error("FuntionName is required to find the proper function");

    if (!obj)
        return null;
    const fn = (obj as IGenericRecord)[functionName];

    if (typeof fn === 'function')
        return fn.bind(obj);

    return null;
}