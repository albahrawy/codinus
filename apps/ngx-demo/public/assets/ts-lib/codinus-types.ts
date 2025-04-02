/* eslint-disable @typescript-eslint/no-explicit-any */
//@ts-expect-error path
import { Signal, Injector } from "ng-core";
//@ts-expect-error path
import { AbstractControl, FormGroupDirective } from "ng-forms";

export declare type Nullable<T> = T | null | undefined;
export declare type IRecord<T> = Record<string, T>;
export declare type IStringRecord = Record<string, string>;
export declare type IGenericRecord = Record<string, any>;
export declare type IArray = Array<any>;

export declare type Constructor<T = any> = new (...args: any[]) => T;
export declare type IFunc<I, O> = (arg: I) => O;
export declare type IAction<O = void> = (arg: O) => void;
export declare type IArglessFunc<O> = () => O;
export declare type ValueGetter<I, O = string> = Nullable<string | IFunc<I, O>>;
export declare type CSFormatterFn<V> = (value: Nullable<V>, lang?: string) => string | null;
export declare type CSAggregationFn<T> = ((key: string, data?: T[]) => unknown);
export declare type CSValueGetter<TRow, TValue> = (data: TRow | null, key?: string) => Nullable<TValue>;
export declare type CSModifyMode = 'add' | 'update' | 'remove';

export declare type CSButtonStyle = Nullable<"basic" | "flat" | "raised" | "stroked" | ''>;
export declare type CSIconType = Nullable<'img' | 'svg' | 'font'>;
export declare type CSSpeedButtonDirection = 'up' | 'down' | 'left' | 'right';
export declare type CSSpeedButtonMode = 'click' | 'hover' | 'static';
export declare type CSSpeedButtonAnimation = 'fling' | 'scale';
export declare type CSSpeedButtonSpin = 360 | 180 | false;

export type CSTabOrientation = 'vertical' | 'horizontal';
export type CSTabHeaderPosition = 'above' | 'below' | 'right' | 'left';
export declare type CSFormAreaType = 'tab' | 'accordion' | 'card' | 'none' | 'flat' | null | undefined;

export declare type ListTogglePosition = 'after' | 'before' | 'none' | '' | undefined;
export declare type ListIconType = 'icon' | 'avatar' | 'none' | '' | undefined;
export declare type CSAggregation = 'sum' | 'max' | 'min' | 'count' | 'avg' | 'first' | 'last';

type CSTableStandardElementType = 'string' | 'number' | 'date' | 'select' | null | undefined | '' | string;

export declare type CSTableEditorType = CSTableStandardElementType | 'select-grid' | 'checkbox';

export declare type CSTableFilterType = CSTableStandardElementType;

export declare type KeyboardNavigationType = 'row' | 'cell' | 'cell-round' | 'none';
export declare type SelectionType = 'none' | 'multiple' | 'single';
export declare type EditablePredicate = ((columnName: string, data: unknown | null) => boolean) | undefined | null;
export declare type SelectPredicate<TRow, TValue> = ((args: ICSSelectionChangingArgs<TRow, TValue>) => boolean) | null;
export declare type CSTableResponsive = false | Nullable<string | number | number[]>;


/** MatAccordion's display modes. */
export declare type MatAccordionDisplayMode = 'default' | 'flat';

/** MatAccordion's toggle positions. */
export declare type MatAccordionTogglePosition = 'before' | 'after';

export declare interface ICSSelectionChangingArgs<TRow, TValue = unknown> {
    readonly data?: Array<TRow>;
    readonly rowData: TRow;
    readonly rowKey: TValue;
    readonly selected: Array<TValue>;
    readonly type: 'select' | 'deselect';
}

export interface ICSRuntimeFormFieldBase {
    name: string;
    templateName?: string,
    flexSpan?: string | null;
    flexNewRow?: boolean;
    flexFullRow?: boolean;
    cssClass?: string;
}

export interface ICSRuntimeFormValueChangeArg {
    value: unknown,
    formValue: IGenericRecord;
    config: ICSRuntimeFormElementAnyField;
}

export declare interface ICSRuntimeFormButtonBase {
    name: string;
}

export interface ICSRuntimeFormEvents {
    valueChange?(arg: ICSRuntimeFormValueChangeArg): void;
    elementButtonClick?(button: ICSRuntimeFormButtonBase, config: ICSRuntimeFormElementAnyField): void;
    formInitialized?(formHandler: ICSRuntimeFormHandler): void;
}

export interface ICSNamedTemplate {
    name: () => string;
}

export interface ICSRuntimeFormElementData {
    control: AbstractControl;
    config: ICSRuntimeFormElementAnyField;
}


export interface ICSRuntimeFormHandler {
    readonly injector: Injector;
    //readonly events: () => Nullable<ICSRuntimeFormEvents>;
    readonly prefix: () => Nullable<string>;
    //readonly templates: () => Nullable<(readonly ICSNamedTemplate[])>;
    readonly signalValue: () => unknown;
    readonly formGroupDirective: FormGroupDirective;

    getElementByDataKey(path: string | string[]): ICSRuntimeFormElementData | null;
    getElementByName(path: string | string[]): ICSRuntimeFormElementAnyField | null;
    onButtonClick(event: Event, button: ICSRuntimeFormButtonBase, config: ICSRuntimeFormElementAnyField): void;
}


export declare interface ICSRuntimeFormButtonBase {
    name: string;
}

export interface ICSRuntimeFormFieldContainer {
    children?: ICSRuntimeFormFieldBase[];
}

export interface ICSRuntimeFormAreaPanelBase extends ICSRuntimeFormFieldContainer, IHasRenderState {
    name: string;
    type: 'panel';
}

export interface ICSRuntimeFormAreaBase extends ICSRuntimeFormFieldBase {
    panels: ICSRuntimeFormAreaPanelBase[];
    type: 'area'
}
export type ICSRuntimeFormConfig = Nullable<ICSRuntimeFormAreaBase | ICSRuntimeFormFieldBase[]>;

export interface ICSRuntimeFormFieldBase {
    name: string;
    templateName?: string,
    flexSpan?: string | null;
    flexNewRow?: boolean;
    flexFullRow?: boolean;
    cssClass?: string;
}

export type CSFormElementRenderState = {
    hidden?: Signal<boolean>;
    invisible?: Signal<boolean>;
}

export type FormErrorMessages = IRecord<string | IStringRecord>;

export interface IHasRenderState {
    hidden?: boolean | null;
    invisible?: boolean | null;
    renderState?: CSFormElementRenderState;
}

export interface IHasItemGetters {
    displayMember?: string | IStringRecord;
    iconMember?: string | IStringRecord;
    disableMember?: string;
}

export interface ICSRuntimeFormFieldHasDefaultValue extends ICSRuntimeFormFieldBase {
    defaultValue?: unknown;
}

export interface ICSRuntimeFormFieldHasLabel {
    label?: Nullable<string | IStringRecord>;
}

export interface ICSRuntimeFormFieldCanBeInDialog extends ICSRuntimeFormFieldBase {
    dialog?: {
        enabled?: boolean;
        templateName?: string,
        minWidth?: string | number,
        minHeight?: string | number,
    }
}

export type ICSSupportDialogFormField = ICSRuntimeFormFieldCanBeInDialog & { type: string } & ICSRuntimeFormFieldHasLabel;


export type CSCalendarView = 'month' | 'year' | 'multi-year';
export type CSDateRangeRequired = Nullable<"start" | "end" | "true" | "false" | boolean | ''>;

type ICSRuntimeFormElementFieldHasDefaultValue = ICSRuntimeFormFieldHasDefaultValue & ICSRuntimeFormElementField;


export declare interface ICSRuntimeFormButton extends ICSRuntimeFormButtonBase {
    disabled?: boolean;
    iconType?: CSIconType;
    icon: string;
}

export interface ICSRuntimeFormElementFieldBase extends ICSRuntimeFormFieldBase {
    order?: number;
    hidden?: boolean;
    invisible?: boolean;
    leftHint?: string;
    rightHint?: string;
}

export interface ICSRuntimeFormElementInputBase extends ICSRuntimeFormElementFieldBase {
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    allowClear?: boolean;
    labelIcon?: string;
    labelIconType?: CSIconType;
    buttons?: ICSRuntimeFormButton[];
}
export interface ICSRuntimeFormElementField extends ICSRuntimeFormElementInputBase {
    dataKey: Nullable<string>;
    label: string | IStringRecord;
}

export interface ICSRuntimeFormElementFieldContainer extends ICSRuntimeFormFieldContainer {
    children: (ICSRuntimeFormElementAnyField & IHasRenderState)[];
}

export interface ICSRuntimeFormFlexContainer {
    flexAlign?: 'start' | 'center' | 'end';
    flexGap?: string | null;
    flexColumns?: string | null;
}


export interface ICSRuntimeFormFieldText extends ICSRuntimeFormElementFieldHasDefaultValue {
    type: 'text' | 'text-area';
    maxlength?: number | null;
    minlength?: number | null;
}

export interface ICSRuntimeFormFieldCheckBox extends ICSRuntimeFormElementFieldHasDefaultValue {
    type: 'check-box';
    labelPosition?: 'before' | 'after';
}

export interface ICSRuntimeFormFieldSlideToggle extends ICSRuntimeFormElementFieldHasDefaultValue {
    type: 'slide-toggle';
    labelPosition?: 'before' | 'after';
}

export interface ICSRuntimeFormFieldMaskedText extends Omit<ICSRuntimeFormFieldText, "type"> {
    type: 'masked-text';
    placeHolderChar?: string;
    useUnmaskValue?: boolean;
    clearOnInvalid?: boolean;
    mask?: string | undefined | null;
}

export interface ICSRuntimeFormFieldNumber extends ICSRuntimeFormElementFieldHasDefaultValue {
    type: 'number';
    showButton?: boolean;
    step?: number;
    min?: number;
    max?: number;
    locale?: string;
    allowArrowKeys?: boolean;
    thousandSeparator?: boolean;
    mode?: 'integer' | 'decimal';
    percentage?: boolean;
    currency?: string;
    decimalDigits?: number;
    verticalButton?: boolean;
}

export interface ICSRuntimeFormFieldDate extends ICSRuntimeFormElementFieldHasDefaultValue {
    type: 'date';
    min?: Date | null;
    max?: Date | null;
    dateFormat?: string | null
    startView?: CSCalendarView;
    popupDisabled?: boolean;
    inputDisabled?: boolean;
}

export interface ICSRuntimeFormFieldDateRange extends Omit<ICSRuntimeFormFieldDate, "required" | "type"> {

    type: 'date-range';
    endPlaceholder?: string | IStringRecord;
    startPlaceholder?: string | IStringRecord;
    startField?: string | null;
    endField?: string | null;
    required: CSDateRangeRequired;
}

export type ICSRuntimeFormGrid = ICSEditableTableConfig & ICSRuntimeFormElementField & {
    type: 'grid';
    height?: string;
    toolBarMode?: CSSpeedButtonMode;
};

export interface ICSRuntimeFormFieldLocalizable extends Omit<ICSRuntimeFormElementField, "required">,
    ICSRuntimeFormFlexContainer, ICSRuntimeFormFieldCanBeInDialog {

    type: 'localizable-text';
    required?: boolean | string[] | string
}

export interface ICSRuntimeFormAreaPanel extends ICSRuntimeFormAreaPanelBase, ICSRuntimeFormFlexContainer, IHasRenderState {
    label?: string | IStringRecord | null;
    labelIcon?: string;
    hidden?: boolean;
    labelClass?: string;
    bodyClass?: string;
    accordionExpanded?: boolean;
    children: (ICSRuntimeFormElementAnyField & IHasRenderState)[];
    type: 'panel'
}

export interface ICSRuntimeFormElementAreaBase extends ICSRuntimeFormAreaBase, ICSRuntimeFormFieldCanBeInDialog {
    panels: ICSRuntimeFormAreaPanel[];
}

export interface ICSRuntimeFormAreaDefault extends ICSRuntimeFormFlexContainer {
    displayType: Nullable<'none'>;
}

export interface ICSRuntimeFormAreaCard extends ICSRuntimeFormFlexContainer {
    displayType: 'card';
}

export interface ICSRuntimeFormAreaTab {
    displayType: 'tab';
    cardWhensingle?: boolean;
    tabsAnimationDuration?: string;
    tabsDynamicHeight?: boolean;
    tabsPosition?: CSTabHeaderPosition;
    tabsPreserveContent?: boolean;
    tabsStretch?: boolean;
}

export interface ICSRuntimeFormAreaAccordion {
    displayType: 'accordion';
    cardWhensingle?: boolean;
    accordionDisplayMode?: MatAccordionDisplayMode;
    accordionHideToggle?: boolean;
    accordionMulti?: boolean;
    accordionTogglePosition?: MatAccordionTogglePosition;
}

export interface ICSRuntimeFormArea extends ICSRuntimeFormElementAreaBase,
    Omit<ICSRuntimeFormAreaTab, 'displayType'>,
    Omit<ICSRuntimeFormAreaAccordion, 'displayType'>,
    Omit<ICSRuntimeFormAreaCard, 'displayType'>,
    Omit<ICSRuntimeFormAreaDefault, 'displayType'> {
    displayType: CSFormAreaType;
}

export type ICSRunTimeFormFieldArea = ICSRuntimeFormArea & ICSRuntimeFormElementFieldBase;

export interface ICSRuntimeFormFieldSection
    extends ICSRuntimeFormElementInputBase, ICSRuntimeFormElementFieldContainer, ICSRuntimeFormFieldCanBeInDialog {
    type: 'section';
    dataKey?: Nullable<string>;
    label?: string | IStringRecord;
}

export interface ICSRuntimeFormFieldSectionArray extends ICSRuntimeFormElementField, ICSRuntimeFormElementFieldContainer,
    ICSRuntimeFormFieldCanBeInDialog, IHasItemGetters, ICSRuntimeFormFlexContainer {
    type: 'section-array';
    multiple?: boolean;
    showIndex?: boolean;
    height?: number | string;
    showTitle?: boolean;
    showSearch?: boolean;
    readOnly?: boolean;
    optionHeight?: number;
    enableDrag?: boolean;
    iconType?: ListIconType;
    contextMenu?: boolean;
}

export interface ICSRuntimeFormFieldSelectBase extends ICSRuntimeFormElementFieldHasDefaultValue, IHasItemGetters {
    // isDialog?: boolean;
    // isModal?: boolean;
    panelClass?: string | string[];
    panelWidth?: string | number | null;
    showIndex?: boolean;
    optionHeight?: number;
    maxHeight?: number | string;
    multiple?: boolean;
    overlayPanelClass?: string | string[];
    moreSingleText?: string;
    moreText?: string;
    displayedTitleCount?: number;
    valueMember?: string;
    togglePosition?: ListTogglePosition;
}

export interface ICSRuntimeFormFieldSelect extends ICSRuntimeFormFieldSelectBase {
    type: 'select';
    showTitle?: boolean;
    showSearch?: boolean;
    stickySelected?: boolean;
    iconType?: ListIconType;
    selectOnlyByCheckBox?: boolean;
    dataSource?: unknown[];
}

export interface ICSRuntimeFormFieldSelectGrid<TRow = unknown> extends ICSRuntimeFormFieldSelectBase {
    type: 'select-grid';
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
    dataSource?: unknown[];
}

export type ICSRuntimeFormElementAnyField =
    ICSRuntimeFormFieldText | ICSRuntimeFormFieldMaskedText | ICSRuntimeFormFieldNumber |
    ICSRuntimeFormFieldDate | ICSRuntimeFormFieldDateRange | ICSRuntimeFormFieldLocalizable |
    ICSRunTimeFormFieldArea | ICSRuntimeFormFieldSection | ICSRuntimeFormGrid | ICSRuntimeFormFieldSectionArray |
    ICSRuntimeFormFieldSelectGrid | ICSRuntimeFormFieldSelect | ICSRuntimeFormFieldSlideToggle | ICSRuntimeFormFieldCheckBox;


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