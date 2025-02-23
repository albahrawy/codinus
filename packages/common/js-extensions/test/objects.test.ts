import {
    mergeObjects, subsetObject, mergePartial,
    copyObject, getValue, setValue, objectForEach
} from "../util/objects";

describe('mergeObjects', () => {
    it('should merge multiple objects', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { b: 3, c: 4 };
        const result = mergeObjects(obj1, obj2);
        expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should merge arrays and remove duplicates', () => {
        const obj1 = { a: [1, 2] };
        const obj2 = { a: [2, 3] };
        const result = mergeObjects(obj1, obj2);
        expect(result).toEqual({ a: [1, 2, 3] });
    });
});

describe('subsetObject', () => {
    it('should extract a subset of properties', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = subsetObject(obj, ['a', 'c']);
        expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should apply filter function', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = subsetObject(obj, ['a', 'b', 'c'], (k, v) => v > 1);
        expect(result).toEqual({ b: 2, c: 3 });
    });
});

describe('mergePartial', () => {
    it('should merge a subset of properties', () => {
        const target = { a: 1, b: 2 };
        const source = { b: 3, c: 4 };
        const result = mergePartial(target, source, ['b', 'c']);
        expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should merge only non-existing properties', () => {
        const target = { a: 1, b: 2 };
        const source = { b: 3, c: 4 };
        const result = mergePartial(target, source, ['b', 'c'], true);
        expect(result).toEqual({ a: 1, b: 2, c: 4 });
    });
});

describe('copyObject', () => {
    it('should create a deep copy of an object', () => {
        const obj = { a: 1, b: { c: 2 } };
        const result = copyObject(obj);
        expect(result).toEqual(obj);
        expect(result).not.toBe(obj);
        expect(result.b).not.toBe(obj.b);
    });
});

describe('getValue', () => {
    it('should retrieve a value from an object', () => {
        const obj = { a: { b: { c: 1 } } };
        const result = getValue(obj, 'a.b.c');
        expect(result).toBe(1);
    });

    it('should return default value if path does not exist', () => {
        const obj = { a: { b: { c: 1 } } };
        const result = getValue(obj, 'a.b.d', 2);
        expect(result).toBe(2);
    });
});

describe('setValue', () => {
    it('should set a value in an object', () => {
        const obj = { a: { b: { c: 1 } } };
        const result = setValue(obj, 'a.b.c', 2);
        expect(result.a.b.c).toBe(2);
    });

    it('should create nested objects if path does not exist', () => {
        const obj = { a: {} };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = setValue(obj, 'a.b.c', 1, true);
        expect(result.a.b.c).toBe(1);
    });
});

describe('objectForEach', () => {
    it('should iterate over each property in an object', () => {
        const obj = { a: 1, b: 2 };
        const callback = jest.fn();
        objectForEach(obj, callback);
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith('a', 1);
        expect(callback).toHaveBeenCalledWith('b', 2);
    });

    it('should apply filter function', () => {
        const obj = { a: 1, b: 2 };
        const callback = jest.fn();
        const filter = (key: string, value: number) => value > 1;
        objectForEach(obj, callback, filter);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('b', 2);
    });
});