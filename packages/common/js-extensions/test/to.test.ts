import { toStringValue, toBoolean, toNumber, toInt, getPositiveOrFallback, toDate, toDateTime, valueType } from '../util/to';

describe('toStringValue', () => {
    test('should convert various types to string', () => {
        expect(toStringValue('hello')).toBe('hello');
        expect(toStringValue(null)).toBe('');
        expect(toStringValue([1, 'a', null])).toBe('1,a,');
        expect(toStringValue(Symbol('sym'))).toBe('Symbol(sym)');
        expect(toStringValue(new Date('2020-01-01T00:00:00Z'))).toBe('2020-01-01T00:00:00.000Z');
        expect(toStringValue({ a: 1 })).toBe('{"a":1}');
        expect(toStringValue(NaN)).toBe('NaN');
        expect(toStringValue(-0)).toBe('-0');
        expect(toStringValue(123)).toBe('123');
    });
});

describe('toBoolean', () => {
    test('should convert various types to boolean', () => {
        expect(toBoolean(true)).toBe(true);
        expect(toBoolean(1)).toBe(true);
        expect(toBoolean(0)).toBe(false);
        expect(toBoolean('true')).toBe(true);
        expect(toBoolean('false')).toBe(false);
        expect(toBoolean('1')).toBe(true);
        expect(toBoolean('0')).toBe(false);
        expect(toBoolean(null)).toBe(false);
    });
});

describe('toNumber', () => {
    test('should convert various types to number', () => {
        expect(toNumber(123)).toBe(123);
        expect(toNumber('123')).toBe(123);
        expect(toNumber('0x1a')).toBe(26);
        expect(toNumber(null, 0)).toBe(0);
        expect(toNumber('abc', 0)).toBe(0);
        expect(toNumber(Symbol('sym'), 0)).toBe(0);
    });
});

describe('toInt', () => {
    test('should convert various types to integer', () => {
        expect(toInt(123.45)).toBe(123);
        expect(toInt('123.45')).toBe(123);
        expect(toInt(Infinity)).toBe(Number.MAX_SAFE_INTEGER);
        expect(toInt(-Infinity)).toBe(-Number.MAX_SAFE_INTEGER);
    });
});

describe('getPositiveOrFallback', () => {
    test('should convert various types to positive number', () => {
        expect(getPositiveOrFallback(123)).toBe(123);
        expect(getPositiveOrFallback(-123, 0)).toBe(0);
        expect(getPositiveOrFallback('123')).toBe(123);
        expect(getPositiveOrFallback('-123', 0)).toBe(0);
    });
});

describe('toDate', () => {
    test('should convert various types to Date', () => {
        expect(toDate('2020-01-01')).toEqual(new Date(2020, 0, 1));
        expect(toDate('invalid date')).toBeNull();
    });
});

describe('toDateTime', () => {
    test('should convert various types to Date with time', () => {
        expect(toDateTime('2020-01-01T12:00:00')).toEqual(new Date(2020, 0, 1, 12));
        expect(toDateTime('invalid date')).toBeNull();
    });
});

describe('valueType', () => {
    test('should convert value to specified type', () => {
        expect(valueType('true', 'boolean')).toBe(true);
        expect(valueType('2020-01-01', 'date')).toEqual(new Date(2020,0,1));
        expect(valueType('2020-01-01T12:00:00', 'dateTime')).toEqual(new Date(2020,0,1,12));
        expect(valueType('123.45', 'int')).toBe(123);
        expect(valueType('123.45', 'number')).toBe(123.45);
        expect(valueType(123, 'string')).toBe('123');
    });

    test('should throw error for unsupported value type', () => {
        expect(() => valueType('123', 'unsupported' as any)).toThrow('Unsupported value type: unsupported');
    });
});