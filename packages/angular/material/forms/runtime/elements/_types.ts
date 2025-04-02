import { MatAccordionDisplayMode, MatAccordionTogglePosition } from "@angular/material/expansion";
import { IStringRecord, Nullable } from "@codinus/types";
import { CSIconType, CSSpeedButtonMode } from '@ngx-codinus/material/buttons';
import { CSCalendarView, CSDateRangeRequired } from "@ngx-codinus/material/inputs";
import { ListIconType, ListTogglePosition } from "@ngx-codinus/material/selection-list";
import { ICSEditableTableConfig, ICSTableColumn } from "@ngx-codinus/material/table";
import { CSTabHeaderPosition } from "@ngx-codinus/material/tabs";
import { CSFormAreaType } from "../../sections/types";
import {
    ICSRuntimeFormAreaBase, ICSRuntimeFormAreaPanelBase, ICSRuntimeFormButtonBase,
    ICSRuntimeFormFieldBase, ICSRuntimeFormFieldCanBeInDialog,
    ICSRuntimeFormFieldContainer, ICSRuntimeFormFieldHasDefaultValue, IHasItemGetters, IHasRenderState
} from "../cs-element-base/types";
import { StepperOrientation } from "@angular/cdk/stepper";
import { MatCardAppearance } from "@angular/material/card";

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
    cardAppearance?: MatCardAppearance;
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

export interface ICSRuntimeFormAreaStepper {
    displayType: 'stepper';
    stepperOrientation?: StepperOrientation;
}


export interface ICSRuntimeFormArea extends ICSRuntimeFormElementAreaBase,
    Omit<ICSRuntimeFormAreaTab, 'displayType'>,
    Omit<ICSRuntimeFormAreaAccordion, 'displayType'>,
    Omit<ICSRuntimeFormAreaCard, 'displayType'>,
    Omit<ICSRuntimeFormAreaStepper, 'displayType'>,
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