import { Nullable } from "@codinus/types";
import { ValueChangeReason } from "@ngx-codinus/core/data";

export type ListType<TValue> = Nullable<TValue | TValue[]>;
export interface IDropDownElement<TValue> {
    _setValue(newValue: ListType<TValue>, reason: ValueChangeReason): void;
}

interface CSListChangeArgsBase<TList, TValue = unknown> {
    list: TList;
    type: 'select' | 'deselect';
    value: TValue | TValue[] | null;
}

interface CSListAllChangeArgs<TList, TRow, TValue = unknown> extends CSListChangeArgsBase<TList, TValue> {
    selectedData: readonly TRow[];
    reason: 'all';
}

interface CSListSingleChangeArgs<TList, TRow, TValue = unknown> extends CSListChangeArgsBase<TList, TValue> {
    optionData: TRow;
    optionValue?: TValue;
    reason: 'option';
}

export type CSListChangeArgs<TList, TRow, TValue = unknown> =
    CSListAllChangeArgs<TList, TRow, TValue> | CSListSingleChangeArgs<TList, TRow, TValue>;