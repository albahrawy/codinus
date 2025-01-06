import { isFunction, isString, getValue } from "@codinus/js-extensions";
import { IFunc, ObjectGetter } from "@codinus/types";
import { ICSListBinder, ICSSupportListBinder } from "./types";
import { computed } from "@angular/core";

const DefaultMemberFn = <T, V>(record: T) => record as unknown as V;

export class CSListBinder<TRow, TValue> implements ICSListBinder<TRow, TValue> {

    constructor(private owner: ICSSupportListBinder<TRow, TValue>) { }

    displayMember = computed(() => normalizeGetterMember(this.owner.displayMember(), DefaultMemberFn<TRow, string>));
    valueMember = computed(() => normalizeGetterMember(this.owner.valueMember(), DefaultMemberFn<TRow, TValue>));
    iconMember = computed(() => normalizeGetterMember(this.owner.iconMember?.(), null));
    disableMember = computed(() => normalizeGetterMember(this.owner.disableMember?.(), null));

    getSelectedItems(data?: readonly TRow[] | null, selected?: TValue[] | null): TRow[] | null {
        if (!selected?.length || !data?.length)
            return null;
        const selectedSet = new Set(selected);
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

    getSelectedTitles(data?: readonly TRow[] | null, selected?: TValue[] | null): string[] | null {
        if (!selected?.length || !data?.length)
            return null;
        const _titleFn = this.displayMember();
        const _cValueFn = this.valueMember();
        const selectedSet = new Set(selected);
        const titles: string[] = [];
        for (const record of data) {
            if (selectedSet.has(_cValueFn(record)))
                titles.push(_titleFn(record));
            if (titles.length === selectedSet.size)
                break;
        }

        return titles;
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

export function normalizeGetterMember<TElement, TValue, TDefault>(value: ObjectGetter<TElement, TValue>, defaultFn: TDefault)
    : IFunc<TElement, TValue> | TDefault {
    return isFunction(value)
        ? value
        : isString(value)
            ? i => getValue(i, value)
            : defaultFn;
}