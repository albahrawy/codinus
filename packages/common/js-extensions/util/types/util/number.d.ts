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
