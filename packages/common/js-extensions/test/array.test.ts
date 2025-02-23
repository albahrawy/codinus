import {
    arrayUnique, arrayRange, removeFromArray, addToArray, arrayPopulate,
    arrayToMap, arrayFromMap, arrayIntersection, arraySum,
    arrayAvg, arraySort, arrayToObject
} from '../util/array';

describe('Array Utility Functions', () => {
    test('arrayUnique should return unique elements', () => {
        const result = arrayUnique([1, 2, 2, 3, 4, 4, 5]);
        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test('arrayRange should generate a range of numbers', () => {
        const result = arrayRange(1, 5);
        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test('removeFromArray should remove elements based on predicate', () => {
        const array = [1, 2, 3, 4, 5];
        const result = removeFromArray(array, (value) => value > 3);
        expect(result).toBe(true);
        expect(array).toEqual([1, 2, 3]);
    });

    test('removeFromArray should remove specific item', () => {
        const array = [1, 2, 3, 4, 5];
        const result = removeFromArray(array, 3);
        expect(result).toBe(2);
        expect(array).toEqual([1, 2, 4, 5]);
    });

    test('addToArray should add items based on condition', () => {
        const array = [1, 2, 3];
        const result = addToArray(array, [4, true], [5, false], [6]);
        expect(result).toEqual([1, 2, 3, 4, 6]);
    });

    test('arrayPopulate should populate array with items based on condition', () => {
        const result = arrayPopulate([1, true], [2, false], [3]);
        expect(result).toEqual([1, 3]);
    });

    test('arrayToMap should convert array to map', () => {
        const array = [{ id: 1, value: 'a' }, { id: 2, value: 'b' }];
        const result = arrayToMap(array, item => item.id, item => item.value);
        expect(result).toEqual(new Map([[1, 'a'], [2, 'b']]));
    });

    test('arrayFromMap should convert map to array', () => {
        const map = new Map([[1, 'a'], [2, 'b']]);
        const result = arrayFromMap(map, (key, value) => ({ id: key, value }));
        expect(result).toEqual([{ id: 1, value: 'a' }, { id: 2, value: 'b' }]);
    });

    test('arrayIntersection should return intersection of two arrays', () => {
        const result = arrayIntersection([1, 2, 3, 4], [3, 4, 5, 6]);
        expect(result).toEqual([3, 4]);
    });

    test('arraySum should calculate sum of array elements', () => {
        const result = arraySum([1, 2, 3, 4]);
        expect(result).toBe(10);
    });

    test('arrayAvg should calculate average of array elements', () => {
        const result = arrayAvg([1, 2, 3, 4]);
        expect(result).toBe(2.5);
    });

    test('arraySort should sort array elements', () => {
        const result = arraySort([3, 1, 4, 2]);
        expect(result).toEqual([1, 2, 3, 4]);
    });

    test('arrayToObject should convert array to object', () => {
        const array = [{ id: 1, value: 'a' }, { id: 2, value: 'b' }];
        const result = arrayToObject(array, item => [item.id.toString(), item.value]);
        expect(result).toEqual({ '1': 'a', '2': 'b' });
    });
});
