import { IGenericRecord, Nullable } from "@codinus/types";
import { isObject } from "./is";
import { jsonStringify } from "./json";
import { toStringValue } from "./to";

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