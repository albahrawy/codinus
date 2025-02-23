import {
    hasFlag, toBitValues, padStart, numberBetween,
    generateFormatOption, formatNumber, formatFileSize
} from '../util/number';

describe('Number Utilities', () => {
    describe('hasFlag', () => {
        it('should return true if the value has the flag set', () => {
            expect(hasFlag(5, 1)).toBe(true); // 5 in binary is 101, flag 1 is set
            expect(hasFlag(5, 4)).toBe(true); // 5 in binary is 101, flag 4 is set
        });

        it('should return false if the value does not have the flag set', () => {
            expect(hasFlag(5, 2)).toBe(false); // 5 in binary is 101, flag 2 is not set
        });
    });

    describe('toBitValues', () => {
        it('should convert a number into an array of bit values', () => {
            expect(toBitValues(5)).toEqual([1, 4]); // 5 in binary is 101
            expect(toBitValues(10)).toEqual([2, 8]); // 10 in binary is 1010
        });
    });

    describe('padStart', () => {
        it('should pad a number to a specified length with a character', () => {
            expect(padStart(5, 3)).toBe('005');
            expect(padStart(5, 3, 'x')).toBe('xx5');
        });
    });

    describe('numberBetween', () => {
        it('should return true if the number is between the specified range', () => {
            expect(numberBetween(5, 1, 10)).toBe(true);
        });

        it('should return false if the number is not between the specified range', () => {
            expect(numberBetween(5, 6, 10)).toBe(false);
        });
    });

    describe('generateFormatOption', () => {
        it('should generate Intl.NumberFormatOptions based on the format string', () => {
            expect(generateFormatOption('0.00')).toEqual({ maximumFractionDigits: 2, minimumFractionDigits: 2 });
            expect(generateFormatOption('0,0')).toEqual({ useGrouping: true, maximumFractionDigits: 0 });
            expect(generateFormatOption('0%')).toEqual({ style: 'percent', maximumFractionDigits: 0 });
        });

        it('should return undefined if no options are set', () => {
            expect(generateFormatOption()).toBeUndefined();
        });
    });

    describe('formatNumber', () => {
        it('should format a number according to the specified format string and locale', () => {
            expect(formatNumber(1234.56, undefined, 'en-US')).toBe('1,234.56');
            expect(formatNumber(1234.56, 'The value is {n}!', 'en-US')).toBe('The value is 1,234.56!');
        });
    });

    describe('formatFileSize', () => {
        it('should format a file size number into a human-readable format', () => {
            expect(formatFileSize(1024, 'en-US')).toBe('1 kB');
            expect(formatFileSize(1048576, 'en-US')).toBe('1 MB');
        });

        it('should return "0 bytes" for non-positive or non-finite sizes', () => {
            expect(formatFileSize(0)).toBe('0 bytes');
            expect(formatFileSize(-1)).toBe('0 bytes');
            expect(formatFileSize(Infinity)).toBe('0 bytes');
        });
    });
});