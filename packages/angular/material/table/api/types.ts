import { InjectionToken, WritableSignal } from "@angular/core";

import { Nullable, ObjectGetter } from "@codinus/types";
import { CSAggregation } from "@ngx-codinus/core/data";
import { CSTableApiKey } from "./internal";

export declare type KeyboardNavigationType = 'row' | 'cell' | 'cell-round' | 'none';
export declare type SelectionType = 'none' | 'multiple' | 'single';
export declare type EditablePredicate = ((columnName: string, data: unknown | null) => boolean) | undefined | null;
export declare type SelectPredicate<TRow, TValue> = ((args: ICSSelectionChangingArgs<TRow, TValue>) => boolean) | null;
export type CSTableResponsive = false | Nullable<string | number | number[]>;

export declare interface ICSSelectionChangingArgs<TRow, TValue = unknown> {
    readonly data?: Array<TRow>;
    readonly rowData: TRow;
    readonly rowKey: TValue;
    readonly selected: Array<TValue>;
    readonly type: 'select' | 'deselect';
}

export interface ICSTableApiMetaRowVisibility {
    getVisibility(key: 'header' | 'filter' | 'footer'): boolean;
    setVisibility(key: 'header' | 'filter' | 'footer', value: boolean): void;
}

export interface ICSTableApiReorderColumns {
    setReorder(value: boolean): void;
    getReorder(): boolean;
}

export interface ICSTableApiSortable {
    sortable: boolean;
}

export interface ICSTableApiDataSourceDirective<TRecord = unknown> {
    getData(): TRecord[];
    //getRenderedData(): TRecord[];
    notifyChanged(): void;
    aggregate(key: string, type: CSAggregation): unknown;
    refreshAggregation(key?: string): void;
    setFilter(predicate: (data: unknown) => boolean, filter: string): void;
    clearFilter(): void;
    addRecords(record?: TRecord[] | number, options?: { index?: number, scroll?: boolean }): void;
    removeRecords(predicate: TRecord[] | number | ((row: TRecord) => boolean), selectPrevious?: boolean): void;
}

export interface ICSTableApiEditable {
    editable: WritableSignal<boolean>;
    commitOnDestroy: boolean;
    editWithF2: boolean;
    editWithEnter: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editablePredicate: ((columnName: string, data: any | null) => boolean) | undefined | null;
}

export interface ICSTableApiKeyboardNavigation {
    navigationMode: 'row' | 'cell' | 'cell-round' | 'none';
    readonly stickyTopHeight: number | null;
    readonly stickyBottomHeight: number | null;
}

export interface ICSTableApiResponsive {
    setResponsive(value: CSTableResponsive): void;
    getResponsive(): CSTableResponsive;
    columnsInRow(): number;
}

export interface ICSTableApiResponsiveStrategy {
    domRowHeight(): number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ICSTableApiSelectModel<TRow = any, TValue = any> {
    selectionType: SelectionType;
    selectableKey: ObjectGetter<TRow, TValue>;

    selectionPredicate?: SelectPredicate<TRow, TValue>;
    selectRow(row: TRow): boolean;
    selectByValue(value: TValue, raiseEvent?: boolean): boolean;
    deselectRow(row: TRow): boolean;
    deselectByValue(value: TValue, raiseEvent?: boolean): boolean;
    setSelection(keys: TValue[] | null): boolean;
    getSelection(): TValue[];
    getSelectedRows(): TRow[];
    toggleRow(row: TRow): boolean;
    toggleByValue(value: TValue, raiseEvent?: boolean): boolean;
    isAllSelected(): boolean;
    isSelected(row?: TRow): boolean;
    isSelectedByValue(value: TValue): boolean;
    toggleAllRows(): void;
    isAllowed(rowData: TRow | null, keyValue: TValue, type: 'select' | 'deselect'): boolean;
}

export interface ICSTableApiScrollable {
    startIndex: number;
    scrollToOffset(offset: number, behavior?: ScrollBehavior): void;
    scrollToIndex(index: number, behavior?: ScrollBehavior): void;
    scrollToStart(behavior?: ScrollBehavior): void;
    scrollToEnd(behavior?: ScrollBehavior): void;
}

export const CODINUS_TABLE_API_REGISTRAR = new InjectionToken<ICSTableApiRegistrar<unknown>>('codinus_table_api_registrar');

export interface ICSTableApiRegistrar<TRow> {
    getApi(): ICSTableApi<TRow>;
    readonly metaRowDirective?: ICSTableApiMetaRowVisibility;
    readonly reorderDirective?: ICSTableApiReorderColumns;
    readonly sortableDirective?: ICSTableApiSortable;
    readonly dataSourceDirective?: ICSTableApiDataSourceDirective<TRow>;
    readonly editableDirective?: ICSTableApiEditable;
    readonly keyboardNavigationDirective?: ICSTableApiKeyboardNavigation;
    readonly tableApiResponsive?: ICSTableApiResponsive;
    readonly tableApiSelectModel?: ICSTableApiSelectModel;
    readonly tableApiScrollable?: ICSTableApiScrollable;
    readonly tableApiResponsiveStrategy?: ICSTableApiResponsiveStrategy;

    register<K extends CSTableApiKey>(key: K, api: this[K]): void;
}

export interface ICSTableApi<TRow = unknown> {
    showHeader: boolean;
    showFilter: boolean
    showFooter: boolean
    reorderColumns: boolean;
    sortable: boolean;
    editable: boolean;
    commitOnDestroy: boolean;
    editWithF2: boolean;
    editWithEnter: boolean;
    editablePredicate: EditablePredicate;
    responsive: CSTableResponsive;
    keyboardNavigation: KeyboardNavigationType;
    readonly stickyTopHeight: number;
    readonly stickyBottomHeight: number;

    readonly selectionModel: ICSTableApiSelectModel<TRow> | undefined;
    readonly startVisibleIndex: number;

    getData(): TRow[] | null;
    // getRenderedData(): TRow[] | null;
    addRecord(options?: { index?: number, scroll?: boolean }): void;
    addRecords(records?: TRow[] | number, options?: { index?: number, scroll?: boolean }): void;
    removeSelected(): void;
    removeSelected(selectPrevious: boolean): void;
    removeRecords(predicate: TRow[] | number | ((row: TRow) => boolean), selectPrevious?: boolean): void;
    notifyChanged(): void;
    aggregate<T = unknown>(key: string, type: 'sum' | 'max' | 'min' | 'count' | 'avg' | 'first' | 'last'): T;
    refreshAggregation(key?: string): void;
    scrollToOffset(offset: number, behavior?: ScrollBehavior): void;
    scrollToIndex(index: number, behavior?: ScrollBehavior): void;
    scrollToStart(behavior?: ScrollBehavior): void;
    scrollToEnd(behavior?: ScrollBehavior): void;
    getMetRowsHeight(): number;
    getResponsiveHeight(): number;
}

interface CSTableSelectionChangeBase<TValue> {
    type: 'select' | 'deselect';
    api: ICSTableApi | undefined;
    selectedData: readonly TValue[];
}

interface CSTableSelectionAllChange<TValue> extends CSTableSelectionChangeBase<TValue> {
    reason: 'all';
}

interface CSTableSelectionSingleChange<TRow, TValue> extends CSTableSelectionChangeBase<TValue> {
    optionData: TRow;
    optionValue: TValue,
    reason: 'option';
}

export type CSTableSelectionChange<TRow = unknown, TValue = unknown>
    = CSTableSelectionSingleChange<TRow, TValue> | CSTableSelectionAllChange<TValue>;
