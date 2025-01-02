/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectionToken, Injector, Signal, TemplateRef, Type, WritableSignal } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { MatFormFieldControl } from "@angular/material/form-field";
import { IGenericRecord, IRecord, IStringRecord, Nullable } from "@codinus/types";
import { CSAbstractFormControlName, CSFormGroup } from "@ngx-codinus/core/forms";
import { ICSFormValue } from "../../sections/types";

export const CODINUS_RUNTIME_FORM_COMPONENT_FACTORY = new InjectionToken<ICSRuntimeFormComponentFactory>('cs-runtime_form_component_factory');
export const CODINUS_RUNTIME_FORM = new InjectionToken<ICSRuntimeForm>('cs_runtime_form');

export interface ICSRuntimeFormComponentFactory {
    getComponent(config: ICSRuntimeFormFieldBase & { type: string }): Type<ICSRuntimeFormElement<any, any>> | null;
    getTemplatesComponent(): Type<ICSFormTemplateProviderComponent>;
}

export interface ICSFormTemplateProviderComponent {
    readonly templates: Signal<readonly ICSRuntimeFormTemplate[]>
}

export interface ICSRuntimeForm<TField extends ICSRuntimeFormFieldBase = any> extends ICSRenderedRuntimeForm<TField> {
    readonly runTimeFormRenderer: ICSRunTimeFormRenderer;
}

export interface ICSRuntimeFormElement<TElementType extends ICSRuntimeFormFieldBase = any, TValueType = unknown> {
    formRenderer: Signal<ICSRunTimeFormRenderer>;
    config: Signal<TElementType>;
    matFormFieldControl: Signal<Nullable<MatFormFieldControl<TValueType>>>;
    csFormControl: Signal<Nullable<CSAbstractFormControlName>>
}


export interface ICSRuntimeFormEvents<TField extends ICSRuntimeFormFieldBase = any> {
    valueChange?(arg: ICSRuntimeFormValueChangeArg<TField>): void;
    elementButtonClick?(button: ICSRuntimeFormButtonBase, config: TField): void;
    formInitialized?(form: ICSRenderedRuntimeForm<TField>): void;
}

export interface ICSRuntimeFormTemplate {
    name(): string;
    template: TemplateRef<unknown>;
}

export interface ICSRunTimeFormRenderer {
    readonly injector: Injector;
    readonly events: Signal<ICSRuntimeFormEvents<any> | undefined | null>;
    readonly prefix: Signal<string | undefined | null>;
    readonly templates: Signal<readonly ICSRuntimeFormTemplate[]>;
    readonly signalValue: Signal<unknown>;
}

export interface ICSRuntimeFormElementData<TField extends ICSRuntimeFormFieldBase = any> {
    control: AbstractControl;
    config: TField;
}

export interface ICSRenderedRuntimeForm<TField extends ICSRuntimeFormFieldBase = any> {
    getElementByDataKey(path: string | string[]): ICSRuntimeFormElementData<TField> | null;
    getElementByName(path: string | string[]): TField | null;
    form: CSFormGroup;
    getValue(): ICSFormValue;
    readOnly: WritableSignal<boolean>;
}

export declare interface ICSRuntimeFormButtonBase {
    name: string;
}

export interface ICSRuntimeFormFieldContainer {
    children?: ICSRuntimeFormFieldBase[];
}

export interface ICSRuntimeFormAreaPanelBase extends ICSRuntimeFormFieldContainer, IHasRenderState {
    name: string;
}

export interface ICSRuntimeFormAreaBase extends ICSRuntimeFormFieldBase {
    panels: ICSRuntimeFormAreaPanelBase[];
    type: 'area'
}
export type ICSRuntimeFormConfig = ICSRuntimeFormAreaBase | ICSRuntimeFormAreaPanelBase;

export interface ICSRuntimeFormFieldBase {
    name: string;
    templateName?: string,
    flex?: string | null;
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
