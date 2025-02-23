import { getValue } from "./objects";

/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */
const formatByRegx = /{([^{]+)}/g;
const camelCaseRegx = new RegExp(['[A-Z][a-z]+', '[A-Z]+(?=[A-Z][a-z])', '[A-Z]+', '[a-z]+', '[0-9]+'].join('|'), 'g');


function trimCore(type: 'trailing' | 'head', value: string, ...chars: string[]): string {
    if (!value)
        return value;

    const trimFunc = type === 'trailing' ? value.trimEnd : value.trimStart;
    value = trimFunc.call(value);

    if (!chars || chars.length === 0)
        return value;

    const trimSet = new Set(chars.join('').split(''));
    const sArray = value.split('');

    let index = type === 'trailing' ? sArray.length - 1 : 0;
    const step = type === 'trailing' ? -1 : 1;

    while (index >= 0 && index < sArray.length) {
        if (!trimSet.has(sArray[index]))
            break;
        index += step;
    }

    return type === 'trailing' ? sArray.slice(0, index + 1).join('') : sArray.slice(index).join('');
}

/**
* Replaces placeholders in the input string with corresponding values from the provided object.
* @param {string} value - The input string containing placeholders in the format `{key}`.
* @param {any} obj - The object containing the values to be used as replacements for the placeholders.
* @returns {string} The formatted string with placeholders replaced by their corresponding values from the object.
*/
export function formatStringBy(value: string, obj: unknown): string {
    return value?.replace(formatByRegx, (_, key) => getValue(obj, key, ''));
}

/**
* Converts a string to camelCase format by removing spaces, hyphens, and apostrophes
* and capitalizing the first letter of each word (except the first word).
* @param {string} value - The input string to convert to camelCase.
* @returns {string} The camelCase formatted string.
*/
export function toCamelCase(value: string): string {
    return (value.match(camelCaseRegx) || [])
        .map((word, index) => index ? toFirstUpperCase(word.toLowerCase()) : word.toLowerCase())
        .join('');
}

/**
* Capitalizes the first letter of the input string.
* @param {string} value - The input string to capitalize the first letter.
* @returns {string} The input string with the first letter capitalized.
*/
export function toFirstUpperCase(value: string): string {
    if (value && value.length > 0)
        value = value.charAt(0).toUpperCase() + value.slice(1);
    return value;
}

/**
* Removes specified characters from the end (trailing) of the input string.
* @param {string} value - The input string to trim.
* @param {...string[]} chars - Optional list of characters to be trimmed from the end of the input string.
* If not provided, whitespace characters will be removed.
* @returns {string} The input string with specified characters trimmed from the end.
*/
export function trimStringTrailing(value: string, ...chars: string[]): string {
    return trimCore('trailing', value, ...chars);
}

/**
* Removes specified characters from the beginning (head) of the input string.
* @param {string} value - The input string to trim.
* @param {...string[]} chars - Optional list of characters to be trimmed from the beginning of the input string.
* If not provided, whitespace characters will be removed.
* @returns {string} The input string with specified characters trimmed from the beginning.
*/
export function trimStringHead(value: string, ...chars: string[]): string {
    return trimCore('head', value, ...chars);
}
/**
 * 
 * @param {string} value - The input string to trim.
 * @param {number} start - The index of the first character to remove. 
 * @param {number} end - The index of the last character to remove.  
 * @returns {string} A new string containing the original string without the specific range .
 */
export function removeFromString(value: string, start: number, end: number): string {
    return value.slice(0, start) + value.slice(end + 1);
}

// Asynchronous functions for conversion
async function bytesToBase64DataUrl(bytes: Uint8Array, type = "application/octet-stream"): Promise<string | null> {
    return await new Promise((resolve, reject) => {
        const reader = Object.assign(new FileReader(), {
            onload: () => resolve(reader.result as string),
            onerror: () => reject(reader.error),
        });
        reader.readAsDataURL(new File([bytes], "", { type }));
    });
}

async function dataUrlToBytes(dataUrl: string) {
    const res = await fetch(dataUrl);
    return new Uint8Array(await res.arrayBuffer());
}

/**
 * Converts a Unicode string to a Base64 encoded string.
 *
 * This function takes a Unicode string, encodes it into a UTF-8 byte array,
 * and then converts that byte array into a Base64 encoded data URL.
 *
 * @param unicodeString - The Unicode string to be converted.
 * @returns A promise that resolves to the Base64 encoded string, or null if the conversion fails.
 */
export async function stringToBase64(unicodeString: string): Promise<string | null> {
    // Convert Unicode string to UTF-8 byte array
    const utf8Bytes = new TextEncoder().encode(unicodeString);
    // Convert byte array to Base64 data URL
    const base64DataUrl = await bytesToBase64DataUrl(utf8Bytes);
    return base64DataUrl;
}

/**
 * Converts a Base64 data URL back to a Unicode string.
 *
 * @param base64DataUrl - The Base64 encoded data URL to be converted.
 * @returns A promise that resolves to the decoded Unicode string.
 */
export async function base64ToString(base64DataUrl: string) {
    // Convert Base64 data URL back to byte array
    const utf8Bytes = await dataUrlToBytes(base64DataUrl);
    // Convert byte array back to Unicode string
    const unicodeString = new TextDecoder().decode(utf8Bytes);
    return unicodeString;
}

//     /**
//      * Adds utility functions as prototype extensions to the string.
//      * Used to enable string.prototype methods for convenience.
//      */
//     export function addProtoTypeExtensions() {
//         if (!String.prototype.formatBy)
//             String.prototype.formatBy = function (obj) { return formatBy(<string>this, obj); }
//         if (!String.prototype.toCamelCase)
//             String.prototype.toCamelCase = function () { return toCamelCase(<string>this); }
//         if (!String.prototype.toFirstUpperCase)
//             String.prototype.toFirstUpperCase = function () { return toFirstUpperCase(<string>this); }
//         if (!String.prototype.trimHead)
//             String.prototype.trimHead = function (...chars) { return trimHead(<string>this, ...chars); }
//         if (!String.prototype.trimTrailing)
//             String.prototype.trimTrailing = function (...chars) { return trimTrailing(<string>this, ...chars); }
//     }

// // Declaration merging for string prototype extensions
// declare global {
//     interface String {
//         formatBy(obj: {}): string;
//         toCamelCase(): string | undefined;
//         toFirstUpperCase(): string;
//         trimHead(...chars: string[]): string;
//         trimTrailing(...chars: string[]): string;
//     }
// }