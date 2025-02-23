import {
    formatStringBy, toCamelCase, toFirstUpperCase, trimStringTrailing, trimStringHead,
    removeFromString
    //, stringToBase64, base64ToString
} from '../util/strings';

describe('String Utilities', () => {
    describe('formatStringBy', () => {
        it('should replace placeholders with corresponding values from the object', () => {
            const template = 'Hello, {name}!';
            const obj = { name: 'World' };
            expect(formatStringBy(template, obj)).toBe('Hello, World!');
        });

        it('should return the original string if no placeholders are found', () => {
            const template = 'Hello, World!';
            const obj = { name: 'World' };
            expect(formatStringBy(template, obj)).toBe('Hello, World!');
        });

        it('should replace multiple placeholders with corresponding values from the object', () => {
            const template = 'Hello, {name}! You are {age} years old.';
            const obj = { name: 'John', age: 30 };
            expect(formatStringBy(template, obj)).toBe('Hello, John! You are 30 years old.');
        });
    });

    describe('toCamelCase', () => {
        it('should convert a string to camelCase format', () => {
            expect(toCamelCase('Hello World')).toBe('helloWorld');
            expect(toCamelCase('hello-world')).toBe('helloWorld');
            expect(toCamelCase('Hello-World')).toBe('helloWorld');
        });
    });

    describe('toFirstUpperCase', () => {
        it('should capitalize the first letter of the input string', () => {
            expect(toFirstUpperCase('hello')).toBe('Hello');
            expect(toFirstUpperCase('Hello')).toBe('Hello');
        });

        it('should return the original string if it is empty', () => {
            expect(toFirstUpperCase('')).toBe('');
        });
    });

    describe('trimStringTrailing', () => {
        it('should remove specified characters from the end of the input string', () => {
            expect(trimStringTrailing('hello!!!', '!')).toBe('hello');
            expect(trimStringTrailing('hello   ', ' ')).toBe('hello');
        });

        it('should remove whitespace characters from the end if no characters are specified', () => {
            expect(trimStringTrailing('hello   ')).toBe('hello');
        });
    });

    describe('trimStringHead', () => {
        it('should remove specified characters from the beginning of the input string', () => {
            expect(trimStringHead('!!!hello', '!')).toBe('hello');
            expect(trimStringHead('   hello', ' ')).toBe('hello');
        });

        it('should remove whitespace characters from the beginning if no characters are specified', () => {
            expect(trimStringHead('   hello')).toBe('hello');
        });
    });

    describe('removeFromString', () => {
        it('should remove characters from the specified range', () => {
            expect(removeFromString('hello world', 0, 4)).toBe(' world');
            expect(removeFromString('hello world', 6, 10)).toBe('hello ');
        });
    });

    // describe('stringToBase64 and base64ToString', () => {
    //     it('should convert a string to Base64 and back', async () => {
    //         const originalString = 'Hello, World!';
    //         const base64String = await stringToBase64(originalString);
    //         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //         const decodedString = await base64ToString(base64String!);
    //         expect(decodedString).toBe(originalString);
    //     });
    // });
});