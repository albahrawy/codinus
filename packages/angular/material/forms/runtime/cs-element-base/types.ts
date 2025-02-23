/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal } from "@angular/core";
import { IGenericRecord, IRecord, IStringRecord, Nullable } from "@codinus/types";

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

export interface ICSRuntimeFormValueChangeArg<TField extends ICSRuntimeFormFieldBase = any> {
    value: unknown,
    formValue: IGenericRecord;
    config: TField;
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

