/**
 * @jest-environment jsdom
 */
import {

    isHTMLElement,
    isObject,
    isClass,
    isString,
    isBoolean,
    isNumber,
    isBigInt,
    isNumberHex,
    isNumberString,
    isSymbol,
    isArray,
    isTypedArray,
    isArgumentsArray,
    isFunction,
    isFunctionString,
    isDate,
    isMap,
    isSet,
    isImageFile,
    isPrimitive,
    isRegExp,
    isEmpty,
    isEqual,
    is
} from '../util/is';

describe('is utility functions', () => {

    test('isHTMLElement', () => {
        expect(isHTMLElement(document.createElement('div'))).toBe(true);
        expect(isHTMLElement(null)).toBe(false);
    });

    test('isObject', () => {
        expect(isObject({})).toBe(true);
        expect(isObject(null)).toBe(false);
    });

    test('isClass', () => {
        class TestClass { }
        expect(isClass(new TestClass())).toBe(true);
        expect(isClass({})).toBe(false);
    });

    test('isString', () => {
        expect(isString('test')).toBe(true);
        expect(isString(123)).toBe(false);
    });

    test('isBoolean', () => {
        expect(isBoolean(true)).toBe(true);
        expect(isBoolean('true')).toBe(false);
    });

    test('isNumber', () => {
        expect(isNumber(123)).toBe(true);
        expect(isNumber(NaN)).toBe(false);
    });

    test('isBigInt', () => {
        expect(isBigInt(BigInt(123))).toBe(true);
        expect(isBigInt(123)).toBe(false);
    });

    test('isNumberHex', () => {
        expect(isNumberHex('0x1a')).toBe(true);
        expect(isNumberHex('123')).toBe(false);
    });

    test('isNumberString', () => {
        expect(isNumberString('123')).toBe(true);
        expect(isNumberString('abc')).toBe(false);
    });

    test('isSymbol', () => {
        expect(isSymbol(Symbol('test'))).toBe(true);
        expect(isSymbol('test')).toBe(false);
    });

    test('isArray', () => {
        expect(isArray([1, 2, 3])).toBe(true);
        expect(isArray('test')).toBe(false);
    });

    test('isTypedArray', () => {
        expect(isTypedArray(new Int8Array())).toBe(true);
        expect(isTypedArray([])).toBe(false);
    });

    test('isArgumentsArray', () => {
        function testFunc() {
            // eslint-disable-next-line prefer-rest-params
            expect(isArgumentsArray(arguments)).toBe(true);
        }
        testFunc();
        expect(isArgumentsArray([])).toBe(false);
    });

    test('isFunction', () => {
        expect(isFunction(() => {/**/ })).toBe(true);
        expect(isFunction('test')).toBe(false);
    });

    test('isFunctionString', () => {
        expect(isFunctionString('function test() {}')).toBe(true);
        expect(isFunctionString('test')).toBe(false);
    });

    test('isDate', () => {
        expect(isDate(new Date())).toBe(true);
        expect(isDate('2021-01-01')).toBe(false);
    });

    test('isMap', () => {
        expect(isMap(new Map())).toBe(true);
        expect(isMap({})).toBe(false);
    });

    test('isSet', () => {
        expect(isSet(new Set())).toBe(true);
        expect(isSet([])).toBe(false);
    });

    test('isImageFile', () => {
        expect(isImageFile('jpg')).toBe(true);
        expect(isImageFile('txt')).toBe(false);
    });

    test('isPrimitive', () => {
        expect(isPrimitive(null)).toBe(true);
        expect(isPrimitive({})).toBe(false);
    });

    test('isRegExp', () => {
        expect(isRegExp(/test/)).toBe(true);
        expect(isRegExp('test')).toBe(false);
    });

    test('isEmpty', () => {
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty([])).toBe(true);
        expect(isEmpty({})).toBe(true);
        expect(isEmpty([1, 2, 3])).toBe(false);
    });

    test('isEqual', () => {
        expect(isEqual(1, 1)).toBe(true);
        expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
        expect(isEqual([1, 2], [1, 2])).toBe(true);
        expect(isEqual(1, '1')).toBe(false);
    });

    test('is', () => {
        class TestClass { }
        expect(is(TestClass, new TestClass())).toBe(true);
        expect(is(Object, {})).toBe(true);
        expect(is(Array, [])).toBe(true);
    });
});