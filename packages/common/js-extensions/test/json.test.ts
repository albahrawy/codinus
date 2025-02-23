import { jsonStringify, jsonParse, jsonFlatten, jsonForEach, jsonMap, jsonToArray, jsonToKeyValueArray } from '../util/json';

describe('JSON Utils', () => {
    describe('jsonStringify', () => {
        it('should stringify valid objects', () => {
            const obj = { name: 'test', value: 123 };
            expect(jsonStringify(obj)).toBe('{"name":"test","value":123}');
        });

        it('should return empty string on invalid input', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const circular: any = { self: null };
            circular.self = circular;
            expect(jsonStringify(circular)).toBe('');
        });
    });

    describe('jsonParse', () => {
        it('should parse valid JSON string', () => {
            const jsonStr = '{"name":"test","value":123}';
            expect(jsonParse(jsonStr)).toEqual({ name: 'test', value: 123 });
        });

        it('should return null on invalid JSON', () => {
            expect(jsonParse('invalid json')).toBeNull();
        });

        it('should return input if already an object', () => {
            const obj = { name: 'test' };
            expect(jsonParse(obj)).toBe(obj);
        });
    });

    describe('jsonFlatten', () => {
        it('should flatten nested object', () => {
            const nested = {
                a: { b: 1 },
                c: { d: { e: 2 } }
            };
            expect(jsonFlatten(nested)).toEqual({
                'a_b': 1,
                'c_d_e': 2
            });
        });
    });

    describe('jsonForEach', () => {
        it('should iterate over object properties', () => {
            const obj = { a: 1, b: 2 };
            const result: Record<string, number> = {};
            jsonForEach(obj, (key, value) => {
                result[key] = value;
            });
            expect(result).toEqual(obj);
        });

        it('should respect filter function', () => {
            const obj = { a: 1, b: 2, c: 3 };
            const result: Record<string, number> = {};
            jsonForEach(obj, (key, value) => {
                result[key] = value;
            }, (key, value) => value > 1);
            expect(result).toEqual({ b: 2, c: 3 });
        });
    });

    describe('jsonMap', () => {
        it('should map object values', () => {
            const obj = { a: 1, b: 2 };
            const result = jsonMap(obj, value => value * 2);
            expect(result).toEqual({ a: 2, b: 4 });
        });
    });

    describe('jsonToArray', () => {
        it('should convert object to array', () => {
            const obj = { a: 1, b: 2 };
            const result = jsonToArray(obj, (value) => value);
            expect(result).toEqual([
                1,
                2
            ]);
        });
    });

    describe('jsonToKeyValueArray', () => {
        it('should convert object to key-value array', () => {
            const obj = { a: 1, b: 2 };
            expect(jsonToKeyValueArray(obj)).toEqual([
                { key: 'a', value: 1 },
                { key: 'b', value: 2 }
            ]);
        });

        it('should return empty array for null input', () => {
            expect(jsonToKeyValueArray(null)).toEqual([]);
        });
    });
});