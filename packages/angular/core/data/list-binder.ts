import { isFunction, isString, getValue } from "@codinus/js-extensions";
import { IFunc, ValueGetter } from "@codinus/types";
import { ICSListBinder, ICSSupportListBinder } from "./types";
import { computed } from "@angular/core";
import { getDisplayText } from "./functions";

export const DefaultMemberFn = <T, V>(record: T) => record as unknown as V;

export class CSListBinder<TRow, TValue> implements ICSListBinder<TRow, TValue> {

    constructor(private owner: ICSSupportListBinder<TRow, TValue>) { }

    displayMember = computed(() => normalizeGetterMember(this.owner.displayMember(), DefaultMemberFn<TRow, string>));
    valueMember = computed(() => normalizeGetterMember(this.owner.valueMember?.(), DefaultMemberFn<TRow, TValue>));
    iconMember = computed(() => normalizeGetterMember(this.owner.iconMember?.(), null));
    disableMember = computed(() => normalizeGetterMember(this.owner.disableMember?.(), null));

    getItemsOfValue(data?: readonly TRow[] | null, value?: TValue[] | null): TRow[] | null {
        if (!value?.length || !data?.length)
            return null;
        const selectedSet = new Set(value);
        const _cValueFn = this.valueMember();
        return data?.filter(record => selectedSet.has(_cValueFn(record))) ?? null;
    }

    verifyValue(data?: readonly TRow[] | null, value?: TValue[] | TValue | null): TValue[] | null {
        if (value == null)
            return null;
        if (!Array.isArray(value))
            value = [value];

        if (!value?.length || !data?.length)
            return null;
        const selectedSet = new Set(value);
        const _cValueFn = this.valueMember();
        return data.map(record => _cValueFn(record)).filter(v => selectedSet.has(v));
    }

    getTitlesOfValue(data?: readonly TRow[] | null, value?: TValue[] | null): string[] | null {
        return getDisplayText(this.displayMember(), this.valueMember(), data, value);
    }

    getActive(data?: readonly TRow[]): ({ data?: readonly TRow[], values: TValue[] }) | null {
        if (!data?.length)
            return null;
        const _cDisableFn = this.disableMember();
        const _cValueFn = this.valueMember();
        if (!_cDisableFn)
            return { data, values: data.map(r => _cValueFn(r)) }

        const values: TValue[] = [];
        const activeData: TRow[] = [];
        data.forEach(r => {
            if (!_cDisableFn(r)) {
                values.push(_cValueFn(r));
                activeData.push(r);
            }
        });
        return { data: activeData, values };
    }
}

export function normalizeGetterMember<TElement, TValue, TDefault>(value: ValueGetter<TElement, TValue>, defaultFn: TDefault)
    : IFunc<TElement, TValue> | TDefault {
    return isFunction(value)
        ? value
        : isString(value)
            ? i => getValue(i, value)
            : defaultFn;
}