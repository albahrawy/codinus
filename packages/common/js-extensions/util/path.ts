import { isString } from "./is";


/**
 * Joins multiple string arguments into a single path string.
 * 
 * This function normalizes the path by removing duplicate slashes,
 * leading slashes, and trailing slashes from each part. It also
 * handles special cases for file protocols.
 * 
 * @param {...string[]} args - The parts of the path to join.
 * @returns {string} The joined and normalized path.
 */
export function joinAsPath(...args: string[]): string {
    if (args.length === 0)
        return '';
    return args.map((part, i) => {
        if (isString(part)) {
            part = part.replace(/\/\/+/g, '/').replace(/^[/]+/, '').replace(/[/]+$/, '');
            if (i === 0) {
                const protocolFixer = part.match(/^file:/) ? '//' : '/';
                if (part.endsWith(':'))
                    part += protocolFixer;
                else
                    part = part.replace(':/', `:/${protocolFixer}`);
            }
            return part;
        }
        return '';
    }).filter(x => x.length).join('/');
}


/**
 * Splits a file name into its name and extension parts.
 *
 * @param fileName - The full name of the file including its extension.
 * @returns An object containing the name and extension of the file.
 *          If the file has no extension, the extension will be an empty string.
 *
 * @example
 * ```typescript
 * const fileInfo = getFileInfo('example.txt');
 * console.log(fileInfo); // { name: 'example', extension: 'txt' }
 * 
 * const fileInfoNoExt = getFileInfo('example');
 * console.log(fileInfoNoExt); // { name: 'example', extension: '' }
 * ```
 */
export function getFileInfo(fileName: string) {
    const parts = fileName.split('.');
    if (parts.length <= 1) {
        return { name: fileName, extension: '' };
    }
    const extension = parts.pop() || '';
    const name = parts.join('.');

    return { name, extension };
}