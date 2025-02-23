import { isNumber, isNumberString, isString } from "@codinus/js-extensions";

export type MediaBreakPoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'sl';
export const sizeBreakpoints: Record<MediaBreakPoint, number> = { xs: 375, sm: 810, md: 1024, lg: 1440, xl: 2560, sl: 5000 };

export function addStyleSectionToDocument(id: string, cssContent: string): HTMLStyleElementScope | undefined {
    if (!document?.head)
        return;
    if (id && document.getElementById(id)) {
        return;
    }
    cssContent = cssContent.replace(/[\r\n]+/g, '');
    let styleElement: HTMLStyleElement | null = document.createElement('style');
    styleElement.id = id;
    styleElement.innerText = cssContent;
    document.head.appendChild(styleElement);
    return {
        styleElement, remove: () => {
            if (styleElement != null) {
                document.head.removeChild(styleElement);
                styleElement = null;
            }
        }
    };
}

export interface HTMLStyleElementScope {
    styleElement: HTMLStyleElement;
    remove: () => void;
}

export function getProperCssValue(value?: string | number | null, defaultValue = 'unset') {
    if (value == null)
        return defaultValue;
    if (isNumber(value) || isNumberString(value))
        return parseFloat(value.toString()).toFixed(4) + '%';
    else if (isString(value))
        return value;
    return defaultValue;
}

export function findElementAttributeByPrefix(attributes?: NamedNodeMap, ...prefixesToSearch: string[]) {
    const result: Record<string, string> = {};
    if (!attributes)
        return result;
    const prefixSet = new Set(prefixesToSearch);
    const length = attributes.length;
    for (let i = 0; i < length; i++) {
        const item = attributes[i]?.name;
        if (!item)
            break;
        for (const prefix of prefixSet) {
            if (item.startsWith(prefix)) {
                result[prefix] = item;
                prefixSet.delete(prefix);
                break;
            }
        }

        if (prefixSet.size === 0)
            break; // We found all prefixes, no need to continue the loop.
    }
    return result;
}

export function getCssSizeBreakpoint(width?: number): MediaBreakPoint | null {
    if (!width || width === screen.availWidth)
        return null;

    for (const breakpoint in sizeBreakpoints) {
        if (width <= sizeBreakpoints[breakpoint as MediaBreakPoint])
            return breakpoint as MediaBreakPoint;
    }
    return null;
}

export function getOuterWidth(element: HTMLElement, margin = true) {
    let width = element.offsetWidth;

    if (margin) {
        const style = getComputedStyle(element);
        width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    }

    return width;
}

export function getOuterHeight(element: HTMLElement, margin = false) {
    let height = element.offsetHeight;

    if (margin) {
        const style = getComputedStyle(element);
        height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }

    return height;
}