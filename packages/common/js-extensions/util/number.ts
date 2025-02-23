/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */


const formatCache = new Map<string, Intl.NumberFormatOptions | undefined>();
const numberFormatRegex = /\{[0.%#,]+}/g;

/**
 * Checks if the given value has a specific flag set.
 * @param {number} value - The value to check the flag against.
 * @param {number} flag - The flag value to be checked.
 * @returns {boolean} - True if the value has the flag set, false otherwise.
 */
export function hasFlag(value: number, flag: number): boolean {
    return (value & flag) === flag;
}

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
export function toBitValues(value: number): number[] {
    const data: number[] = [];
    let d = 1;
    while (value > 0) {
        if (value & 1)
            data.push(d);
        d = d << 1;
        value = value >>> 1;
    }
    return data;
}

/**
 * Pads a number to a specified length with a character (optional).
 * @param {number} value - The number to pad.
 * @param {number} length - The desired length of the padded number.
 * @param {string} [char] - The character to use for padding. Default is '0'.
 * @returns {string} - The padded number as a string.
 */
export function padStart(value: number, length: number, char?: string): string {
    return value?.toString().padStart(length, char);
}

/**
 * Checks if a number is between a specified range (inclusive).
 * @param {number} value - The number to check.
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 * @returns {boolean} - True if the number is between the specified range, false otherwise.
 */
export function numberBetween(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

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
export function generateFormatOption(formatString?: string): Intl.NumberFormatOptions | undefined {
    const options: Intl.NumberFormatOptions = {};
    if (formatString) {
        if (formatString.includes('%')) { options.style = 'percent'; }
        if (formatString.includes(',')) { options.useGrouping = true; }
        const pointPosition = formatString.indexOf('.');
        if (pointPosition > -1) {
            options.maximumFractionDigits = formatString.replace('%', '').length - pointPosition - 1;
            options.minimumFractionDigits = options.maximumFractionDigits;
        } else {
            options.maximumFractionDigits = 0;
        }
    }

    return Object.keys(options).length ? options : undefined;
}


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
export function formatNumber(value: number, formatString?: string, locale?: string): string {
    if (formatString) {
        if (numberFormatRegex.test(formatString))
            return formatString.replace(numberFormatRegex, (match) => formatCore(value, match.slice(1, -1), locale));
        else
            return formatCore(value, formatString, locale);
    }
    return value.toLocaleString(locale);
}

function formatCore(value: number, format: string, locale?: string) {
    let options = formatCache.get(format);
    if (!options) {
        options = generateFormatOption(format);
        formatCache.set(format, options);
    }
    return value.toLocaleString(locale, options);
}

/**
 * Formats a file size number into a human-readable format based on the provided locale.
 * @param {number} size - The file size in bytes.
 * @param {string} [locale] - The locale to use for formatting. If not provided, the default locale is used.
 * @returns {string} - The formatted file size as a string with appropriate units.
 */
export function formatFileSize(size: number, locale?: string): string {
    if (!isFinite(size) || size <= 0) {
        return '0 bytes';
    }
    const unitDisplay = locale?.startsWith('ar') ? 'long' : 'short';
    const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'];
    const sizeNumber = Math.floor(Math.log(size) / Math.log(1024));
    const finalSize = +(size / (1 << (10 * sizeNumber))).toFixed(2);
    // The unitDisplay variable is set to 'long' for Arabic locales and 'short' for others.
    return new Intl.NumberFormat(locale, { style: 'unit', unitDisplay, unit: units[sizeNumber] }).format(finalSize);
}

/**
 * Adds prototype extensions to the Number object.
 * This function extends the Number object with additional utility methods for formatting and flag operations.
 */
// export function addProtoTypeExtensions() {
// if (!Number.generateFormatOption)
//     Number.generateFormatOption = generateFormatOption;
// if (!Number.prototype.format)
//     Number.prototype.format = function (f, locale) { return format(<number>this, f, locale) };
// if (!Number.prototype.hasFlag)
//     Number.prototype.hasFlag = function (flag) { return hasFlag(<number>this, flag) };
// if (!Number.prototype.toBitValues)
//     Number.prototype.toBitValues = function () { return toBitValues(<number>this) };
// if (!Number.prototype.padStart)
//     Number.prototype.padStart = function (length, char = '0') { return padStart(<number>this, length, char) };
// if (!Number.prototype.formatFileSize)
//     Number.prototype.formatFileSize = function (locale) { return formatFileSize(<number>this, locale) };
// }


// export const numbers = {
//     hasFlag,
//     toBitValues,
//     padStart,
//     between,
//     generateFormatOption,
//     format,
//     formatFileSize
// }

// Declaration merging for Number prototype extensions
// declare global {

//     interface Number {
//         toBitValues(): number[];
//         format(formatString: string, locale?: string): string;
//         formatFileSize(locale?: string): string;
//         padStart(length: number, char?: string): string;
//         hasFlag(flag: number): boolean;
//     }

//     interface NumberConstructor {
//         generateFormatOption(formatString: string): Intl.NumberFormatOptions | undefined;
//     }
// }