import { InjectionToken } from "@angular/core";
import { ConextMenuOpeningArgs } from "@ngx-codinus/material/context-menu";

export type ListTogglePosition = 'after' | 'before' | 'none' | '' | undefined;
export type ListIconType = 'icon' | 'avatar' | 'none' | '' | undefined;
export type ListCategorizedMode = 'none' | 'sticky' | 'split' | undefined;
export type ListFilterPredicate<T> = (data: T, filter: string) => boolean;

export const CODINUS_SELECTION_LIST = new InjectionToken<ICSSelectionList<unknown, unknown>>('cs_selection_list');
//export const CODINUS_SELECTION_LIST = new InjectionToken<ICSSelectionList<unknown, unknown>>('cs_selection_list');

export interface ICSListOption<TRow, TValue> {
    b: string;
}

export interface ICSSelectionList<TRow, TValue> {//extends MatList {
    multiple: () => boolean;
    readOnly: () => boolean;
    selectOnlyByCheckBox: () => boolean;
    isSelected(value?: TValue | null): boolean;
    _isOptionCurrent(option: ICSListOption<TRow, TValue>): boolean;
    _notifyTouched(): void;
    _optionSelectChange(option: ICSListOption<TRow, TValue>, selected: boolean): void;
    _optionClicked(option: ICSListOption<TRow, TValue>): void;
    conextMenuOpening: { emit: (args: ConextMenuOpeningArgs) => void };
}

interface CSVirtualSelectionListChangeBase<TRow, TValue = unknown> {
    // list: CSSelectionListPanel<TRow, TValue>;
    type: 'select' | 'deselect';
    value: TValue | TValue[] | null;
}

interface CSVirtualSelectionListAllChange<TRow, TValue = unknown> extends CSVirtualSelectionListChangeBase<TRow, TValue> {
    selectedData: readonly TRow[];
    reason: 'all';
}

interface CSVirtualSelectionListSingleChange<TRow, TValue = unknown> extends CSVirtualSelectionListChangeBase<TRow, TValue> {
    optionData: TRow;
    optionValue?: TValue;
    reason: 'option';
}

export type CSVirtualSelectionListChange<TRow, TValue = unknown> =
    CSVirtualSelectionListSingleChange<TRow, TValue> | CSVirtualSelectionListAllChange<TRow, TValue>;
