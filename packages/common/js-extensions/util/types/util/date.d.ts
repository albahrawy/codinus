type _StringOf<N extends number, R extends unknown[]> = R['length'] extends N ? R : _StringOf<N, [string, ...R]>;
type StringOf<N extends number> = N extends N ? number extends N ? string[] : _StringOf<N, []> : never;
type IDateLocale = {
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
export {};
/**
 * Adds utility functions as prototype extensions to the Date object.
 * Used to enable Date.prototype methods for convenience.
 */
