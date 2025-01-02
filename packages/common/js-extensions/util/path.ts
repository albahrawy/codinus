import { isString } from "./is";

/**
 * Joins multiple path segments into a single path string.
 * Removes duplicate slashes and handles file protocol (file://) properly.
 *
 * @param {...string[]} args - Path segments to be joined.
 * @returns {string} - The concatenated path.
 */
export function joinAsPath(...args: string[]): string {
    if (args.length === 0)
        return '';
    return args.map((part, i) => {
        if (isString(part)) {
            part = part.replace(/\/\/+/g, '/').replace(/^[/]+/, '').replace(/[/]+$/, '');
            if (i == 0) {
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


export function getFileInfo(fileName: string) {
    const parts = fileName?.split('.') || [];
    if (parts.length <= 1) {
        return { name: fileName, extension: '' };
    }
    const extension = parts.pop() || '';
    const name = parts.join('.');

    return { name, extension };
}