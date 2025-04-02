import { IStringRecord, Nullable, ValueGetter } from "@codinus/types";
import { CSAggregation } from "@ngx-codinus/core/data";
import { CSIconType } from "@ngx-codinus/material/buttons";
import { CSTableResponsive, KeyboardNavigationType, SelectPredicate } from "../api/types";
import { CSAggregationFn, CSFormatterFn, CSValueGetter } from "../data";
import { CSTableEditorType, CSTableFilterType } from "../shared";

export type ICSTableTreeColumn<TData, TValue = unknown> = Omit<ICSTableColumn<TData, TValue>, "name">;

export interface ICSTableColumn<TData, TValue = unknown> {
    name: string;
    dataKey?: Nullable<string | IStringRecord>;
    label?: string | IStringRecord;
    cellFormatter?: string | CSFormatterFn<TValue> | IStringRecord;
    footerFormatter?: string | CSFormatterFn<TValue> | IStringRecord;
    cellValueGetter?: (data: TData | null, key?: string) => Nullable<TValue>;
    cellValueSetter?: (data: TData, value?: Nullable<TValue>, key?: string) => void;
    editablePredicate?: ((data: TData | null) => boolean) | undefined | null;
    footerAggregation?: CSAggregation | CSAggregationFn<TData>;
    cellDefaultValue?: Nullable<TValue>;
    footerDefaultValue?: Nullable<TValue>;
    readOnly?: boolean;
    hidden?: boolean;
    order?: number;
    //TODO: cell border issue
    sticky?: 'start' | 'end';
    width?: string | number;
    sortable?: boolean;
    reordable?: boolean;
    resizable?: boolean;
    filter?: ITableColumnFilter | null;
    editor?: ITableColumnEditor | null;
}

export interface ITableColumnFilter {
    type: CSTableFilterType;
    initialOperation?: Nullable<string>;
    operations?: Nullable<string[]>;
    options?: unknown;
    filterkey?: Nullable<string>;
}

export interface ITableColumnEditor {
    type: CSTableEditorType;
    options?: unknown;
}

export interface ICSTableConfigBase<TRecord = unknown> {
    rowHeight?: number;
    attachFilter?: boolean;
    reorderColumns?: boolean;
    sortable?: boolean;
    showHeader?: boolean;
    showFilter?: boolean;
    showFooter?: boolean;
    stickyHeader?: boolean;
    stickyFilter?: boolean;
    stickyFooter?: boolean;
    noDataText?: string | IStringRecord;
    responsiveHeaderColumn?: string;
    responsive?: CSTableResponsive;
    // dataSource?: NovaDataSource<T>;
    keyboardNavigation?: KeyboardNavigationType;
    selectColumn?: 'before' | 'after' | 'none';
    iconColumn?: 'before' | 'after' | 'none';
    iconType?: CSIconType;
    iconGetter?: CSValueGetter<TRecord, string> | string | IStringRecord;
    showIndex?: boolean;
    disabled?: boolean;
    columns: ICSTableColumn<TRecord>[];
    selectionPredicate?: SelectPredicate<TRecord, unknown>;
    selectableKey: ValueGetter<TRecord, unknown>;
}

export interface ICSEditableTableConfig<T = unknown> extends ICSTableConfigBase<T> {
    editWithF2?: boolean;
    editWithEnter?: boolean;
    editable?: boolean;
    commitOnDestroy?: boolean;
}