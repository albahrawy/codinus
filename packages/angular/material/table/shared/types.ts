/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentPortal, ComponentType, DomPortal } from "@angular/cdk/portal";
import { InjectionToken, Type } from "@angular/core";
import { Nullable } from "@codinus/types";
import { EditablePredicate } from "../api/types";
import { CSFormatterFn } from "../data/types";

export const CODINUS_TABLE_EDIT_REGISTRY = new InjectionToken<ICSTableEditRegistry<unknown>>('cs-table-editor_registry');
export const CODINUS_TABLE_EDITOR_ELEMENT = new InjectionToken<ICSTableEditorElement>('cs-table-editor_element');
export const CODINUS_TABLE_FILTER_ELEMENT = new InjectionToken<ICSTableFilterElement>('cs-table-filter_element');
export const CODINUS_TABLE_COMPONENT_FACTORY = new InjectionToken<ICSTableComponentFactory>('cs-table_component_factory');

type CSTableStandardElementType<T> = 'string' | 'number' | 'date' | 'select' | null | undefined | '' | string
    | ComponentType<T>;

export type CSTableEditorType = CSTableStandardElementType<ICSTableEditorElement>
    | 'select-grid' | 'checkbox';

export type CSTableFilterType = CSTableStandardElementType<ICSTableFilterElement>;

export type CSTableCellType = 'readonly' | 'editable' | 'reactive' | null | '';

export type ValueConverterFactoryFn<TValue = any> = null | (() => ((value: any) => TValue));
export type FilterPredicate<TValue> = (first: TValue, second: TValue) => boolean;
export type CSTableFilterPredicates<TValue> = Record<string, FilterPredicate<TValue>>;

export type ICSTableEditorElement<TData = any, TValue = any> = {
    initialize(): void;
    registerHandler(handler: ICSEditorHandler<TData, TValue>): void;
    formatValue?: CSFormatterFn<TValue>;
}

export interface ICSTableComponentFactory {
    getEditorComponent(type: string | null | undefined): Type<ICSTableEditorElement> | null;
    getFilterComponent(type: string | null | undefined): Type<ICSTableFilterElement> | null;
}

export interface ICSTableEditRegistry<TData> {
    readonly activeEditorContext: ICSTableEditorContext<TData> | null;
    readOnly: () => boolean;
    commitOnDestroy: () => boolean;
    editWithF2: () => boolean;
    editWithEnter: () => boolean;
    editablePredicate: () => EditablePredicate;
    canEdit: () => boolean;
    register(editor: ICSTableEditorContext<TData> | null): void;
    unregister(commit: boolean): void;
    getEditorContext(key?: string, rowData?: Nullable<TData>): ICSTableEditorContext<TData> | null;
    notify(affected: TData): void;

}

export type ICSTableFilterElement<TValue = any> = {
    registerClearFilter(fn: () => void): void;
    registerChangeFilter(fn: (value: unknown) => void): void;
    valueConverterFactory?: ValueConverterFactoryFn<TValue> | null;
    readonly predicates: CSTableFilterPredicates<TValue>;
    readonly defaultOperation: string;
}

export interface ICSTableEditorContext<TData, TValue = any> {
    readonly data: Nullable<TData>;
    columnKey?: string;
    readonly value: Nullable<TValue>;
    editor: ICSTableEditorCell;
}

export interface ICSTableEditorCell {
    commitPending(): void;
    undo(): void;
    element: HTMLElement;
}

export interface ICSEditorHandler<TData, TValue> {
    readonly rowData: Nullable<TData>;
    value(): Nullable<TValue>;
    commit(keepFocus?: boolean): void;
    commitValue(value: TValue): void;
    undo(): void;
    canEdit(): boolean;
    isEditing(): boolean;
    context(): ICSTableEditorContext<TData, TValue> | null;
}

export interface ICSHandledEditorComponent {
    isSelfViewHandled: boolean;
}

interface ICSTableCustomEditorView {
    portal: ComponentPortal<ICSTableEditorElement<any, any>>,
    handled: true;
}

interface ICSTableDefinedEditorView {
    portal: DomPortal,
    instance: ICSTableEditorElement;
    handled: false;
}

export type ICSTableEditorView = ICSTableCustomEditorView | ICSTableDefinedEditorView | null;

export interface ICSCellFilterChangedArgs {
    key: string;
    value: unknown;
    predicate: (data: unknown) => boolean;
    filter: string;
}

export interface ICSTableFilterChangedBaseArgs {
    predicate: (data: unknown) => boolean;
    filter: string;
}

export interface ICSTableFilterChangedArgs extends ICSTableFilterChangedBaseArgs {
    reason: 'change';
    cellArgs: ICSCellFilterChangedArgs;
}

export interface ICSTableFilterClearedArgs extends ICSTableFilterChangedBaseArgs {
    reason: 'clear';
    cellArgs: string;
}

export type ICSTableFilterArgs = ICSTableFilterChangedArgs | ICSTableFilterClearedArgs;
