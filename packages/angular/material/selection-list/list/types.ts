/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectionToken, TemplateRef } from "@angular/core";
import { MatListOptionTogglePosition } from "@angular/material/list";
import { ICSListBinder } from "@ngx-codinus/core/data";
import { ConextMenuOpeningArgs } from "@ngx-codinus/material/context-menu";

export type ListTogglePosition = 'after' | 'before' | 'none' | '' | undefined;
export type ListIconType = 'icon' | 'avatar' | 'none' | '' | undefined;

export const CODINUS_SELECTION_LIST = new InjectionToken<ICSSelectionList<unknown, unknown>>('cs_selection_list');

export interface ICSListOption<TRow, TValue> {
    data: () => TRow;
    value: () => TValue;
    selected(): boolean;
    // _markForCheck(): void;
}

export interface ICSSelectionList<TRow, TValue> {
    _csDataManager: ICSListBinder<TRow, TValue>;
    _optionIconPosition: () => MatListOptionTogglePosition;
    _optionTogglePosition: () => MatListOptionTogglePosition;
    _optionToggleType: () => 'radio' | 'check' | null;
    _optionIconType: () => 'icon' | 'avatar' | null;
    _iconTemplate: () => TemplateRef<any> | undefined;
    _indexTemplate: () => TemplateRef<any> | undefined;
    _titleTemplate: () => TemplateRef<any> | undefined;
    multiple: () => boolean;
    enabled(): boolean;
    selectOnlyByCheckBox: () => boolean;
    isSelected(value: TValue): boolean;
    _isOptionCurrent(option: ICSListOption<TRow, TValue>): boolean;
    _notifyTouched(): void;
    _optionSelectChange(option: ICSListOption<TRow, TValue>, selected: boolean): void;
    _optionClicked(option: ICSListOption<TRow, TValue>): void;
    conextMenuOpening: { emit: (args: ConextMenuOpeningArgs) => void };
}

interface CSVirtualSelectionListChangeBase<TRow, TValue = unknown> {
    list: ICSSelectionList<TRow, TValue>;
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
