import { Signal } from "@angular/core";
import { MatFormField } from "@angular/material/form-field";
import { Nullable } from "@codinus/types";

/** @internal */
export function enforceFormFieldSuffix(formField: MatFormField | null) {
    if (!formField)
        return;
    Object.defineProperty(formField, "_hasIconSuffix", {
        get() { return true; },
        set() {/** */ },
        enumerable: true,
        configurable: true,
    });
}

/** @internal */
export function addMissingDateComponents(format: Nullable<string>) {
    if (!format)
        return null;
    return format.replace(/d/, 'X').replace(/d/g, '').replace(/X/, 'dd')
        .replace(/M/, 'X').replace(/M/g, '').replace(/X/, 'MM')
        .replace(/y/, 'X').replace(/y/g, '').replace(/X/, 'yyyy');
}

/** @internal */
export function getDateFormatMask(format: Nullable<string>, defaultFormat: Nullable<string>) {
    format = addMissingDateComponents(format || defaultFormat);
    if (!format)
        return null;

    const day = _getFormatPosition(format, 'd', 2);
    const month = _getFormatPosition(format, 'M', 2);
    const year = _getFormatPosition(format, 'y', 4);
    return {
        mask: format.replace('dd', '39').replace('MM', '19').replace('yyyy', '9999'),
        parts: { day, month, year }
    };
}

function _getFormatPosition(format: string, key: string, length: number) {
    let separator = 0;
    const start = format.indexOf(key);
    const end = start >= 0 ? start + length - 1 : -1;
    if (end === format.length - 1)
        separator = 1;
    else
        separator = format.slice(end + 1).match(/[dMy]/)?.index ?? 0;
    return { start, end, separator };
}

/** @internal */
export interface ICSInputButtonElementBase {
    _hasMatField: Signal<boolean>;
    disabled: Signal<boolean>;
    readonly: Signal<boolean>;
}

/** @internal */
export const DEFAULT_INPUT_BUTTONS_WRAPPER_KEYS: Array<keyof ICSInputButtonElementBase> = ['disabled', 'readonly', '_hasMatField'];