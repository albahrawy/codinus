import { ComponentType } from "@angular/cdk/portal";
import { DateFilterFn, MatCalendarCellClassFunction } from "@angular/material/datepicker";
import { IStringRecord, Nullable, ValueGetter } from "@codinus/types";
import { CSDataSource } from "@ngx-codinus/core/data";
import { CSIconType } from "@ngx-codinus/material/buttons";
import { CSCalendarView } from "@ngx-codinus/material/inputs";
import { ListIconType, ListTogglePosition } from "@ngx-codinus/material/selection-list";
import { CSTableFilterType, ICSTableColumn, ICSTableFilterElement } from "@ngx-codinus/material/table";

export interface ICSTableNumberFilterOptions {
    showButton?: boolean;
    step?: number;
    min?: number;
    max?: number;
    mode?: 'integer' | 'decimal';
    locale?: string;
    allowArrowKeys?: boolean;
    thousandSeparator?: boolean;
    percentage?: boolean;
    currency?: string;
    decimalDigits?: number;
}

export interface ICSTableDateFilterOptions {
    min?: Date | null;
    max?: Date | null;
    dateFormat?: string | null;
    dateFilter?: DateFilterFn<Date | null>;
    startView?: Nullable<CSCalendarView>;
    dateClass?: Nullable<MatCalendarCellClassFunction<Date>>
}

export interface ICSTableSelectBaseOptions<TRow = unknown, TValue = unknown> {
    // isDialog: boolean;
    // isModal: boolean;

    allowClear: boolean;
    displayMember: ValueGetter<TRow, string>;
    valueMember: ValueGetter<TRow, TValue>;
    disableMember: ValueGetter<TRow, boolean>;
    iconMember: ValueGetter<TRow, string>;
    dataSource: CSDataSource<TRow>;
    panelClass?: string | string[];
    panelWidth?: string | number | null;
    showIndex?: boolean;
    optionHeight?: number;
    maxHeight?: number;
    multiple?: boolean;
    overlayPanelClass?: string | string[];
    moreSingleText?: string;
    moreText?: string;
    displayedTitleCount?: number;
    togglePosition?: ListTogglePosition;
}

export interface ICSTableSelectFilterOptions<TRow = unknown, TValue = unknown> extends ICSTableSelectBaseOptions<TRow, TValue> {
    //filterPredicate?: ListFilterPredicate<TRow>;
    showTitle?: boolean;
    showSearch?: boolean;
    stickySelected?: boolean;
    iconType?: ListIconType;
    selectOnlyByCheckBox?: boolean;
}

export interface ICSTableSelectEditorOptions extends ICSTableSelectFilterOptions {
    required: boolean;
    disabled: boolean;
}

export interface ICSTableSelectGridEditorOptions<TRow = unknown, TValue = unknown> extends ICSTableSelectBaseOptions<TRow, TValue> {
    showHeader?: boolean;
    showFilter?: boolean;
    showFooter?: boolean;
    stickyHeader?: boolean
    stickyFilter?: boolean;
    stickyFooter?: boolean;
    columns: Array<ICSTableColumn<TRow>>;
    iconType?: CSIconType;
    noDataText?: string | IStringRecord;
    sortable?: boolean;
    required: boolean;
    disabled: boolean;
}


export type ICSTableDateEditOptions = ICSTableDateFilterOptions;
export type ICSTableNumberEditOptions = ICSTableNumberFilterOptions;


export type ICSTableFilterOptions<T extends CSTableFilterType> =
    T extends 'number' ? ICSTableNumberFilterOptions :
    T extends 'date' ? ICSTableDateFilterOptions :
    T extends 'select' ? ICSTableSelectFilterOptions :
    T extends 'string' ? null :
    T extends string ? unknown :
    T extends ComponentType<infer U> ? U extends ICSTableFilterElement<infer TValue> ? TValue : never
    : null;
