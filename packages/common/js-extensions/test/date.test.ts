import {
    parseDateExact, parseDate, formatDate, formatToISOString,
    isValidDate, getMonthNames, getDateNames, getDayOfWeekNames,
    getYearName, getFirstDayOfWeek, daysInMonth, isLeapYear, addYears,
    addMonths, addDays, dateClosest, dateCompare, dateDifferent
} from '../util/date';

describe('Date Utility Functions', () => {
    test('parseDateExact should parse date string according to format', () => {
        const result = parseDateExact('2023-10-05', 'yyyy-MM-dd');
        expect(result).toEqual(new Date(2023, 9, 5));
    });

    test('parseDate should parse various date formats', () => {
        const result = parseDate('2023-10-05', ['yyyy-MM-dd', 'dd/MM/yyyy']);
        expect(result).toEqual(new Date(2023, 9, 5));
    });

    test('formatDate should format date according to format string', () => {
        const date = new Date(2023, 9, 5);
        const result = formatDate(date, 'dd/MM/yyyy');
        expect(result).toBe('05/10/2023');
    });

    test('formatToISOString should format date to ISO string', () => {
        const date = new Date(Date.UTC(2023, 9, 5));
        const result = formatToISOString(date);
        expect(result).toBe('2023-10-05T00:00:00.000Z');
    });

    test('isValidDate should validate date object', () => {
        expect(isValidDate(new Date())).toBe(true);
        expect(isValidDate(new Date('invalid date'))).toBe(false);
    });

    test('getMonthNames should return month names', () => {
        const result = getMonthNames('long', 'en-US');
        expect(result).toEqual([
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]);
    });

    test('getDateNames should return date names', () => {
        const result = getDateNames('en-US');
        expect(result).toEqual([...Array(31).keys()].map(i => (i + 1).toString()));
    });

    test('getDayOfWeekNames should return day names', () => {
        const result = getDayOfWeekNames('long', 'en-US');
        expect(result).toEqual([
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ]);
    });

    test('getYearName should return year name', () => {
        const date = new Date(2023, 9, 5);
        const result = getYearName(date, 'en-US');
        expect(result).toBe('2023');
    });

    test('getFirstDayOfWeek should return first day of week', () => {
        const result = getFirstDayOfWeek();
        expect(result).toBe(0);
    });

    test('daysInMonth should return number of days in month', () => {
        expect(daysInMonth(2, 2020)).toBe(29); // Leap year
        expect(daysInMonth(2, 2021)).toBe(28); // Non-leap year
    });

    test('isLeapYear should check if year is leap year', () => {
        expect(isLeapYear(2020)).toBe(true);
        expect(isLeapYear(2021)).toBe(false);
    });

    test('addYears should add years to date', () => {
        const date = new Date(2023, 9, 5);
        const result = addYears(date, 2);
        expect(result).toEqual(new Date(2025, 9, 5));
    });

    test('addMonths should add months to date', () => {
        const date = new Date(2023, 9, 5);
        const result = addMonths(date, 3);
        expect(result).toEqual(new Date(2024, 0, 5));
    });

    test('addDays should add days to date', () => {
        const date = new Date(2023, 9, 5);
        const result = addDays(date, 10);
        expect(result).toEqual(new Date(2023, 9, 15));
    });

    test('dateClosest should return closest date from array', () => {
        const date = new Date(2023, 9, 5);
        const datesArray = [new Date(2023, 9, 1), new Date(2023, 9, 10)];
        const result = dateClosest(date, datesArray);
        expect(result).toEqual(new Date(2023, 9, 1));
    });

    test('dateCompare should compare two dates', () => {
        const date1 = new Date(2023, 9, 5);
        const date2 = new Date(2023, 9, 10);
        expect(dateCompare(date1, date2)).toBe(-1);
        expect(dateCompare(date2, date1)).toBe(1);
        expect(dateCompare(date1, date1)).toBe(0);
    });

    test('dateDifferent should return difference between two dates in specified interval', () => {
        const date1 = new Date(2023, 9, 5);
        const date2 = new Date(2023, 9, 10);
        expect(dateDifferent(date1, date2, 'd')).toBe(-5);
        expect(dateDifferent(date1, date2, 'M')).toBe(0);
        expect(dateDifferent(date1, date2, 'y')).toBe(0);
    });
});