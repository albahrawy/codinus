import { isObject } from "@codinus/js-extensions";
import { CSTableEditorElementBase } from "../editors/_editor-element-base";
import { CSTableFilterElementBase } from "../filters/_filter-element-base";
import { ICSTableEditorElement, ICSTableFilterElement } from "./types";

export function isTableEditorElement(value: unknown): value is ICSTableEditorElement {
    if (!value)
        return false;
    if (value instanceof CSTableEditorElementBase)
        return true;
    const _value = value as ICSTableEditorElement<unknown>;
    return typeof _value.registerHandler === 'function'
        && typeof _value.initialize == 'function';
}

export function isTableFilterElement<T>(value: unknown): value is ICSTableFilterElement<T> {
    if (!value)
        return false;
    if (value instanceof CSTableFilterElementBase)
        return true;
    const _value = value as ICSTableFilterElement<T>;
    return typeof _value.registerClearFilter === 'function'
        && typeof _value.registerClearFilter == 'function'
        && _value.predicates && isObject(_value.predicates) && !!Object.keys(_value.predicates).length
        && !Object.values(_value.predicates).some(p => typeof p !== 'function');
}