/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */
// import { arrays } from "./array";
import { arrayRange } from "./array";
import { isDate, isNumber, isString } from "./is";
import { numberBetween } from "./number";


//TODO:fix a bug relted to the time zone
//#region types

type DateParts = { year?: number, month?: number, day?: number, hour?: number, minutes?: number, seconds?: number, milliseconds?: number };
type _StringOf<N extends number, R extends unknown[]> = R['length'] extends N ? R : _StringOf<N, [string, ...R]>;
type StringOf<N extends number> = N extends N ? number extends N ? string[] : _StringOf<N, []> : never;
type IFormatInfo = {
    options?: Intl.DateTimeFormatOptions; tokens?: string[] | null;
    ignoreTimezoneName: boolean; formatMap: string[];
};
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
}

//#endregion

//#region constants

const localsMaps = new Map<string, IDateLocale>();
const formatCache = new Map<string, IFormatInfo>();
const jsonRegx = /(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{0,7}))?(?:Z|(.)(\d{2}):?(\d{2})?)?/;
const defaultFormats = ['dd/MM/yyyy', 'yyyy/MM/dd', 'dd/MM/yyyy HH:mm:ss', 'yyyy/MM/dd HH:mm:ss'];
const formattingTokensRegx = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
const dateFormatRegex = /\{.+}/g;
const daysInMonths = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const intervalInMillisSeconds = new Map<string, number>([
    ["d", 86_400_000], ["ms", 1], ["s", 1_000], ["w", 604_800_000], ['m', 60_000],
    ['h', 3_600_000], ['y', 525_600 * 60_000], ['M', 43_200 * 60_000]
]);

//#endregion

//#region internal functions

function _padStart(n: number) {
    return (n + '').padStart(2, '0');
}

function _getPartType(length: number) {
    return length == 1 ? 'numeric' : '2-digit';
}

function _parseTimePart(value?: string, max = 59): number | undefined {
    const t = Number(value);
    if (!isNaN(t) && numberBetween(t, 0, max))
        return t;
    return 0;
}

function _parseMonth(month?: string): number | undefined {
    const m = Number(month) - 1;
    if (!isNaN(m) && numberBetween(m, 0, 11))
        return m;
    return undefined;
}

function _parseHour(hour?: string, hour24?: string, ampm?: string): number | undefined {
    if (hour && !hour24) {
        const h = Number(hour) + (ampm && ampm[0].toLowerCase() === 'p' ? 12 : 0);
        if (!isNaN(h) && numberBetween(h, 0, 23))
            return h;
    } else if (hour24) {
        const h24 = Number(hour24);
        if (!isNaN(h24) && numberBetween(h24, 0, 23))
            return h24;
    }
    return 0;
}

function _parseFromJson(value: string) {
    if (value?.length < 19 || value[10] != 'T')
        return null;
    const tokens = value.match(jsonRegx);
    if (tokens) {
        if (!numberBetween(+tokens[2] - 1, 1, 11))
            return null;
        if (!numberBetween(+tokens[3], 1, daysInMonth(+tokens[2], +tokens[1])))
            return null;
        if (!numberBetween(+tokens[4], 0, 59) || !numberBetween(+tokens[5], 0, 59) || !numberBetween(+tokens[6], 0, 59))
            return null;

        return new Date(
            Date.UTC(
                +tokens[1],
                +tokens[2] - 1,
                +tokens[3],
                +tokens[4] - (+tokens[9] || 0) * (tokens[8] == '-' ? -1 : 1),
                +tokens[5] - (+tokens[10] || 0) * (tokens[8] == '-' ? -1 : 1),
                +tokens[6],
                +((tokens[7] || '0') + '00').substring(0, 3)
            )
        )
    }
    return null;
}

function _parseExactCore(stringValue: string, formatString: string): Date | null {
    if (!formatString || !stringValue)
        return null;
    stringValue = stringValue.replace(/\s+/g, '');
    formatString = formatString.replace(/\s+/g, '');
    const tokens = formatString.match(formattingTokensRegx);
    if (tokens) {
        let tmpStringValue = stringValue;
        const dateMap = tokens.reduce((c, v) => {
            c.set(v[0], tmpStringValue.substring(0, v.length));
            tmpStringValue = tmpStringValue.slice(v.length);
            return c;
        }, new Map());
        const parts: DateParts = {
            year: +dateMap.get('y'),
            month: _parseMonth(dateMap.get('M')),
            day: +dateMap.get('d'),
            hour: _parseHour(dateMap.get('h'), dateMap.get('H'), dateMap.get('t')),
            minutes: _parseTimePart(dateMap.get('m')),
            seconds: _parseTimePart(dateMap.get('s')),
            milliseconds: _parseTimePart(dateMap.get('f'), 999),
        };
        if (parts.year && parts.month != null && parts.day)
            return new Date(Date.UTC(parts.year, parts.month, parts.day, parts.hour, parts.minutes, parts.seconds, parts.milliseconds));
    }

    return null;
}

function _getLocalInfo(key: 'dayNames' | 'monthNames', style: 'long' | 'short' | 'narrow', locale?: string): string[] | undefined {
    return _getLocalInfoCore(key, locale)?.[style];
}

function _getLocalInfoCore<K extends keyof IDateLocale>(key: K, locale?: string): IDateLocale[K] {
    if (locale)
        return localsMaps.get(locale)?.[key];
    return;
}

function _cloneDate(date?: Date): Date {
    if (!date || !isValidDate(date))
        throw new Error("Invalid Input Date");
    return new Date(date.getTime());
}

function _getFormatInfo(formatString?: string | null) {
    if (!formatString)
        return null;
    const formatCached = formatCache.get(formatString);
    if (formatCached)
        return formatCached;
    const tokens = formatString?.match(formattingTokensRegx);
    if (tokens?.length) {
        const formatMap: string[] = [];
        // TODO: think about UTC timezone
        const options: Intl.DateTimeFormatOptions = { timeZone: "UTC" };
        let ignoreTimezoneName = false;
        tokens.forEach((v, i) => {
            const l = v.length;
            switch (v[0]) {
                case 'd':
                    options.day = _getPartType(l);
                    if (l <= 2) {
                        formatMap[i] = 'day';
                    } else {
                        options.weekday = (l == 3 ? 'short' : 'long');
                        formatMap[i] = 'weekday';
                    }
                    break;
                case 'f':
                case 'F':
                    options.fractionalSecondDigits = Math.min(l, 3) as (1 | 2 | 3);
                    formatMap[i] = 'fractionalSecond';
                    break;
                case 'g':
                    options.era = (l == 1 ? 'narrow' : l == 2 ? 'short' : 'long');
                    formatMap[i] = 'era';
                    break;
                case 'h':
                case 'H':
                    options.hour = _getPartType(l);
                    options.hour12 = v[0] === 'h';
                    formatMap[i] = 'hour';
                    break;
                case 'z':
                case 'Z':
                    options.timeZoneName = l == 1 ? 'shortOffset' : 'longOffset';
                    options.timeZone = undefined;
                    ignoreTimezoneName = true;
                    break;
                case 'k':
                    if (!options.timeZoneName) {
                        options.timeZone = undefined;
                        options.timeZoneName = l == 1 ? 'shortGeneric' : l == 2 ? 'short' : l == 3 ? 'longGeneric' : 'long';
                    }
                    break;
                case 'm':
                    options.minute = _getPartType(l);
                    formatMap[i] = 'minute';
                    break;
                case 'M':
                    if (l <= 2)
                        options.month = _getPartType(l);
                    else
                        options.month = (l == 3 ? 'short' : 'long');
                    formatMap[i] = 'month';
                    break;
                case 's':
                    options.second = _getPartType(l);
                    formatMap[i] = 'second';
                    break;
                case 'y':
                    options.year = l <= 2 ? '2-digit' : 'numeric';
                    formatMap[i] = 'year';
                    break;
            }
        });
        const _formatInfo = { options, tokens, formatMap, ignoreTimezoneName };
        formatCache.set(formatString, _formatInfo);
        return _formatInfo;
    }
    return null;
}

function formatDateCore(dateValue: Date, formatString?: string | null, locale?: string): string | null {
    const formatCached = _getFormatInfo(formatString);
    if (formatCached?.tokens?.length && formatCached?.options) {
        const foramatedParts = new Intl.DateTimeFormat(locale, formatCached.options).formatToParts(dateValue).reduce((r, v) => {
            if (v.type != 'literal')
                r.set(v.type, v.value);
            return r;
        }, new Map<string, string>());
        const tokens = formatCached.tokens.slice();
        for (let i = 0; i < tokens.length; i++) {
            switch (tokens[i]?.[0]) {
                case 'z':
                case 'Z':
                    tokens[i] = foramatedParts.get('timeZoneName')?.replace('GMT', '').trim() || '';
                    break;
                case 'k':
                    tokens[i] = formatCached.ignoreTimezoneName ? '' : foramatedParts.get('timeZoneName') || '';
                    break;
                case 't': {
                    const dayPeriod = foramatedParts.get('dayPeriod') || '';
                    tokens[i] = tokens[i].length == 1 ? dayPeriod[0] : dayPeriod;
                    break;
                }
                default: {
                    const key = formatCached.formatMap[i];
                    if (key) {
                        const formatedValue = foramatedParts.get(key);
                        if (formatedValue)
                            tokens[i] = formatedValue;
                    }
                    break;
                }
            }
        }
        return tokens.join('').trim();
    } else {
        return new Intl.DateTimeFormat(locale).format(dateValue);
    }
}

//#endregion

//#region  locale

/**
 * Registers locale-specific information for formatting dates.
 * @param {string} code - The locale code.
 * @param {IDateLocale} info - The locale-specific information.
 */
export function registerDateLocale(code: string, info: IDateLocale): void {
    if (!code || !info)
        throw new Error("Invlaid locale info");
    localsMaps.set(code, info);
}

//#endregion

//#region parse and format


/**
 * Parses a date string according to the specified format.
 *
 * @param value - The date string to parse.
 * @param parseFormat - The format to use for parsing the date string.
 * @param preserveTime - Optional. If true, preserves the time component of the date. Defaults to false.
 * @returns The parsed Date object if the input is valid, otherwise null.
 */
export function parseDateExact(value: string, parseFormat: string, preserveTime?: boolean): Date | null {
    const dateValue = _parseExactCore(value, parseFormat);
    if (isValidDate(dateValue))
        return preserveTime ? dateValue : new Date(dateValue.toDateString());

    return null;
}


/**
 * Parses a given value into a Date object based on the provided format(s).
 *
 * @param value - The value to be parsed. It can be a string, number, or Date object.
 * @param parseFormat - Optional. The format(s) to use for parsing the string value. It can be a single format string or an array of format strings.
 * @param preserveTime - Optional. A boolean indicating whether to preserve the time component of the parsed date. Defaults to true.
 * @returns A Date object if the value can be parsed successfully; otherwise, null.
 */
export function parseDate(value: unknown, parseFormat?: string | string[], preserveTime = true): Date | null {
    if (!value)
        return null;
    let dateValue: Date | null = null;
    let _isISo = false;
    if (isString(value)) {
        dateValue = new Date(value);
        const _isValid = isValidDate(dateValue);
        _isISo = _isValid && value.endsWith('Z');
        if (!_isValid)
            dateValue = _parseFromJson(value);
        if (!isValidDate(dateValue)) {
            const parseFormats = parseFormat ? (Array.isArray(parseFormat) ? parseFormat : [parseFormat]) : defaultFormats;
            for (const currentFormat of parseFormats) {
                dateValue = parseDateExact(value, currentFormat);
                if (!!dateValue && isValidDate(dateValue))
                    break;
            }
        }
    } else if (isNumber(value)) {
        dateValue = new Date(value);
    } else if (isDate(value)) {
        dateValue = value;
    }
    if (isValidDate(dateValue)) {
        if (_isISo) {
            if (preserveTime)
                return dateValue;
            else
                return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
        } else {
            if (preserveTime)
                return new Date(dateValue.getUTCFullYear(), dateValue.getUTCMonth(), dateValue.getUTCDate(), dateValue.getUTCHours(), dateValue.getUTCMinutes(), dateValue.getUTCSeconds(), dateValue.getUTCMilliseconds());
            else
                return new Date(dateValue.getUTCFullYear(), dateValue.getUTCMonth(), dateValue.getUTCDate());
        }
    }

    return null;
}

/**
 * Formats a given date according to the specified format string and locale.
 *
 * @param dateValue - The date to be formatted.
 * @param formatString - An optional string specifying the format. If not provided, a default format will be used.
 * @param locale - An optional string specifying the locale to be used for formatting.
 * @returns The formatted date string, or null if the input date is invalid.
 */
export function formatDate(dateValue: Date, formatString?: string, locale?: string): string | null {
    if (!dateValue || !isValidDate(dateValue))
        return null;
    if (formatString && dateFormatRegex.test(formatString))
        return formatString.replace(dateFormatRegex, (match) => formatDateCore(dateValue, match.slice(1, -1), locale) ?? '');
    else
        return formatDateCore(dateValue, formatString, locale);

}

/**
 * Formats a given Date object to an ISO string.
 *
 * @param dateValue - The Date object to format.
 * @param onlyDate - Optional boolean indicating whether to format only the date part (without time).
 * @returns The formatted ISO string.
 * @throws RangeError - If the provided dateValue is invalid.
 */
export function formatToISOString(dateValue: Date, onlyDate?: boolean): string {
    if (isNaN(dateValue.getTime()))
        throw new RangeError('Invalid time value');
    if (onlyDate)
        return [dateValue.getFullYear(), _padStart(dateValue.getUTCMonth() + 1), _padStart(dateValue.getUTCDate())].join('-');
    return dateValue.toISOString();
}

//#endregion

//#region vlidation & query

/**
 * Checks if the provided value is a valid Date object.
 * @param value - The value to check.
 * @returns True if the value is a valid Date object, otherwise false.
 */
export function isValidDate(value: unknown): value is Date {
    return value != null && isDate(value) && !isNaN(value.valueOf());
}

/**
 * Gets an array of month names in the specified style and locale.
 * @param {'long' | 'short' | 'narrow'} [style='long'] - The style of month names to return (long, short, or narrow).
 * @param {string} [locale] - The locale code used for getting the month names. If not provided, the default locale will be used.
 * @returns {string[]} - An array of month names based on the specified style and locale.
 */
export function getMonthNames(style: 'long' | 'short' | 'narrow' = 'long', locale?: string): string[] {
    const registered = _getLocalInfo('monthNames', style, locale);
    if (registered)
        return registered;
    const formatter = new Intl.DateTimeFormat(locale, { month: style, timeZone: 'utc' });
    return arrayRange(0, 11).map(m => formatter.format(new Date(2017, m, 1)));
}

/**
 * Returns an array of date names for the specified locale.
 *
 * @param locale - Optional. A string with a BCP 47 language tag, or an array of such strings. If not provided, the default locale will be used.
 * @returns An array of date names for the specified locale.
 */
export function getDateNames(locale?: string): string[] {
    const registered = _getLocalInfoCore('dateNames', locale);
    if (registered)
        return registered;
    const formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'utc' });
    return arrayRange(1, 31).map(d => formatter.format(new Date(2017, 0, d)));
}

/**
 * Gets an array of day names in the specified style and locale.
 * @param {'long' | 'short' | 'narrow'} [style='long'] - The style of day names to return (long, short, or narrow).
 * @param {string} [locale] - The locale code used for getting the day names. If not provided, the default locale will be used.
 * @returns {string[]} - An array of day names based on the specified style and locale.
 */
export function getDayOfWeekNames(style: 'long' | 'short' | 'narrow' = 'long', locale?: string): string[] {
    const registered = _getLocalInfo('dayNames', style, locale);
    if (registered)
        return registered;
    const formatter = new Intl.DateTimeFormat(locale, { weekday: style, timeZone: 'utc' });
    return arrayRange(1, 7).map(d => formatter.format(new Date(2017, 0, d)));
}

/**
 * Gets the year name of the provided Date object in the specified locale.
 * @param {Date} date - The Date object to get the year name from.
 * @param {string} [locale] - The locale code used for getting the year name. If not provided, the default locale will be used.
 * @returns {string} - The year name of the Date object in the specified locale.
 */
export function getYearName(date: Date, locale?: string): string | null {
    return formatDate(date, "yyyy", locale);
}

/**
 * Gets the first day of the week based on the locale.
 * @returns {number} - The first day of the week (0 for Sunday, 1 for Monday, etc.).
 */
export function getFirstDayOfWeek(): number {
    return _getLocalInfoCore('weekStartsOn') ?? 0;
}

/**
 * Gets the number of days in the specified month.
 * @param {number} month - The month number (1-12) to get the days for.
 * @param {number} [year] - The year to get the days for. If not provided, the current year will be used.
 * @returns {number} - The number of days in the specified month.
 */
export function daysInMonth(month: number, year?: number): number {
    return numberBetween(month, 1, 12) ? (daysInMonths[month - 1] ?? (isLeapYear(year) ? 29 : 28)) : NaN;
}

/**
 * Checks if the specified year is a leap year.
 * @param {number} year - The year to check.
 * @returns {boolean} - True if the year is a leap year, otherwise false.
 */
export function isLeapYear(year?: number): boolean {
    return !!year && year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
}

//#endregion

//#region add

/**
 * Adds the specified number of years to the given date.
 * @param {Date} date - The date to which years will be added.
 * @param {number} years - The number of years to add. Positive values will add years to the future, and negative values will subtract years from the past.
 * @returns {Date} - A new Date object representing the result of adding the years.
 */
export function addYears(date: Date, years: number): Date {
    return addMonths(date, years * 12);
}

/**
 * Adds the specified number of months to the given date.
 * @param {Date} date - The date to which months will be added.
 * @param {number} months - The number of months to add. Positive values will add months to the future, and negative values will subtract months from the past.
 * @returns {Date} - A new Date object representing the result of adding the months.
 */
export function addMonths(date: Date, months: number): Date {
    const requiredDate = _cloneDate(date);
    if (isNaN(months) || !months)
        return requiredDate;

    const dayOfMonth = date.getDate();
    requiredDate.setMonth(date.getMonth() + months + 1, 0)
    const dayOfReqMonth = requiredDate.getDate();
    if (dayOfMonth < dayOfReqMonth)
        requiredDate.setDate(dayOfMonth);

    return requiredDate
}

/**
 * Adds the specified number of days to the given date.
 * @param {Date} date - The date to which days will be added.
 * @param {number} days - The number of days to add. Positive values will add days to the future, and negative values will subtract days from the past.
 * @returns {Date} - A new Date object representing the result of adding the days.
 */
export function addDays(date: Date, days: number): Date {
    const requiredDate = _cloneDate(date);
    if (isNaN(days) || !days)
        return requiredDate;
    requiredDate.setDate(date.getDate() + days);
    return requiredDate;
}

//#endregion

//#region comparison

/**
 * Returns the closest date to the provided date from an array of dates.
 * @param {Date} date - The date to compare.
 * @param {Date[]} datesArray - The array of dates to compare against.
 * @returns {Date | null} - The closest date from the array, or null if the input date is invalid.
 */
export function dateClosest(date: Date, datesArray: Array<Date>): Date | null {
    if (!isValidDate(date))
        return null;

    const _dateValue = date.getTime();

    let result: Date | null = null;
    let minDiff: number;
    datesArray.forEach(d => {
        if (!isValidDate(d))
            return;
        const _currentValue = d.getTime();
        const _diff = Math.abs(_dateValue - _currentValue)
        if (result == null || _diff < minDiff) {
            result = d;
            minDiff = _diff;
        }
    });

    return result;
}

/**
 * Compares two dates and returns 1 if the first date is greater, -1 if the second date is greater, or 0 if they are equal.
 * @param {Date} first - The first date to compare.
 * @param {Date} second - The second date to compare.
 * @returns {1 | -1 | 0} - The result of the comparison.
 * @throws {Error} - If either of the input dates is invalid.
 */
export function dateCompare(first: Date, second: Date): 1 | -1 | 0 {
    if (!isValidDate(first) || !isValidDate(second))
        throw new Error("Invalid dates");

    const diff = first.getTime() - second.getTime();
    return diff > 0 ? 1 : diff < 0 ? -1 : 0;
}

/**
 * Returns the difference between two dates in the specified interval.
 * @param {Date} first - The first date.
 * @param {Date} second - The second date.
 * @param {'d' | 'M' | 'y' | 'h' | 'm' | 's' | 'ms'} [interval='d'] - The interval to calculate the difference in.
 * @returns {number} - The difference between the two dates in the specified interval.
 * @throws {Error} - If either of the input dates is invalid.
 */
export function dateDifferent(first: Date, second: Date, interval: 'd' | 'M' | 'y' | 'h' | 'm' | 's' | 'ms' = 'd'): number {
    if (!isValidDate(first) || !isValidDate(second))
        throw new Error("Invalid dates");

    const intervalInMS = intervalInMillisSeconds.get(interval);
    if (!intervalInMS)
        throw new Error("Invalid interval selector, \n Allowed intervals: 'd' , 'M' , 'y' , 'h' , 'm' , 's' , 'ms'");
    const diff = Math.round((first.getTime() - second.getTime()) / intervalInMS);
    return Math.abs(diff) === 0 ? 0 : diff;
}

//#endregion

/**
 * Adds utility functions as prototype extensions to the Date object.
 * Used to enable Date.prototype methods for convenience.
 */
//export function addProtoTypeExtensions() { }

// export const dates = {
//     registerLocale,
//     parseExact,
//     parse,
//     format,
//     toISOString,
//     isValidDate,
//     getMonthNames,
//     getDateNames,
//     getDayOfWeekNames,
//     getYearName,
//     getFirstDayOfWeek,
//     daysInMonth,
//     isLeapYear,
//     addYears,
//     addMonths,
//     addDays,
//     closesDate,
//     compare,
//     different
// }