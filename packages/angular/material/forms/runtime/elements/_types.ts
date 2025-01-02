import { InjectionToken } from "@angular/core";
import { MatAccordionDisplayMode, MatAccordionTogglePosition } from "@angular/material/expansion";
import { IStringRecord, Nullable } from "@codinus/types";
import { CSImageIcon } from '@ngx-codinus/material/buttons';
import { CSCalendarView, CSDateRangeRequired } from "@ngx-codinus/material/inputs";
import { CSTabHeaderPosition } from "@ngx-codinus/material/tabs";
import { CSFormAreaType } from "../../sections/types";
import {
    ICSRuntimeFormAreaBase, ICSRuntimeFormButtonBase,
    ICSRuntimeFormFieldBase, ICSRuntimeFormFieldCanBeInDialog,
    ICSRuntimeFormFieldContainer, ICSRuntimeFormFieldHasDefaultValue, IHasRenderState
} from "../cs-element-base/types";

export const CODINUS_RUNTIME_FORM_OPTIONS = new InjectionToken<ICSRunTimeFormOptions>('cs_runtime_form_options');

export type ICSRunTimeFormOptions = { templateMaps: IStringRecord; }

export const DEFAULT_RUNTIME_FORM_OPTIONS: ICSRunTimeFormOptions = {
    templateMaps: {
        area: 'default',
        default: 'mat-field'
    }
};

type ICSRuntimeFormElementFieldHasDefaultValue = ICSRuntimeFormFieldHasDefaultValue & ICSRuntimeFormElementField;

export declare interface ICSRuntimeFormButton extends ICSRuntimeFormButtonBase {
    disabled?: boolean;
    iconType?: CSImageIcon;
    icon: string;
}

export interface ICSRuntimeFormElementFieldBase extends ICSRuntimeFormFieldBase {
    order?: number;
    hidden?: boolean;
    invisible?: boolean;
    leftHint?: string;
    rightHint?: string;
}

export interface ICSRuntimeFormElementFieldContainer extends ICSRuntimeFormFieldContainer {
    children: (ICSRuntimeFormElementAnyField & IHasRenderState)[];
}

export interface ICSRuntimeFormFlexContainer {
    layout?: string;
    limit?: boolean;
    align?: string | null;
    gap?: string | null;
    columns?: string | null;
}


export interface ICSRuntimeFormElementField extends ICSRuntimeFormElementFieldBase {
    dataKey: Nullable<string>;
    label: string | IStringRecord;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    allowClear?: boolean;
    labelIcon?: string;
    labelIconType?: CSImageIcon;
    buttons?: ICSRuntimeFormButton[];
}

export interface ICSRuntimeFormFieldText extends ICSRuntimeFormElementFieldHasDefaultValue {
    type: 'text';
    maxlength?: number | null;
    minlength?: number | null;
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

export interface ICSRuntimeFormFieldLocalizable
    extends Omit<ICSRuntimeFormElementField, "required">, ICSRuntimeFormElementFieldContainer,
    ICSRuntimeFormFlexContainer, ICSRuntimeFormFieldCanBeInDialog {

    type: 'localizable-text';
    required?: boolean | string[]
}

export interface ICSRuntimeFormAreaPanel extends ICSRuntimeFormFlexContainer, ICSRuntimeFormElementFieldContainer, IHasRenderState {
    name: string;
    label?: string | IStringRecord | null;
    icon?: string | IStringRecord | null;
    hidden?: boolean;
    labelClass?: string;
    bodyClass?: string;
    accordionExpanded?: boolean;
    defaultFlexBasis?: string
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
    cardWhensingle?: boolean;
    displayType: 'tab';
    tabsAnimationDuration?: string;
    tabsDynamicHeight?: boolean;
    tabsPosition?: CSTabHeaderPosition;
    tabsPreserveContent?: boolean;
    tabsStretch?: boolean;
}

export interface ICSRuntimeFormAreaAccordion {
    cardWhensingle?: boolean;
    displayType: 'accordion';
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
    extends ICSRuntimeFormElementField, ICSRuntimeFormElementFieldContainer, ICSRuntimeFormFieldCanBeInDialog {
    type: 'section';
}


export type ICSRuntimeFormElementAnyField =
    ICSRuntimeFormFieldText | ICSRuntimeFormFieldMaskedText | ICSRuntimeFormFieldNumber |
    ICSRuntimeFormFieldDate | ICSRuntimeFormFieldDateRange | ICSRuntimeFormFieldLocalizable |
    ICSRunTimeFormFieldArea | ICSRuntimeFormFieldSection;
// | | INovaRuntimeFormFieldSectionArray
// | INovaRuntimeFormFieldSelect | INovaRuntimeFormFieldSelectGrid | INovaRuntimeFormFieldTable;