/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectionToken, Injector, Signal, Type } from "@angular/core";
import { AbstractControl, ControlContainer, FormGroupDirective } from "@angular/forms";
import { MatFormFieldControl } from "@angular/material/form-field";
import { IStringRecord, Nullable } from "@codinus/types";
import { CSAbstractFormControlName } from "@ngx-codinus/core/forms";
import { CSNamedTemplate } from "@ngx-codinus/core/outlet";
import { ICSRuntimeFormAreaBase, ICSRuntimeFormButtonBase, ICSRuntimeFormFieldBase, ICSRuntimeFormValueChangeArg } from "./cs-element-base/types";

export const CODINUS_RUNTIME_FORM_COMPONENT_FACTORY = new InjectionToken<ICSRuntimeFormComponentFactory>('cs-runtime_form_component_factory');
export const CODINUS_RUNTIME_FORM_HANDLER = new InjectionToken<ICSRuntimeFormHandler>('codinus_runtime_form_handler');
export const CODINUS_RUNTIME_FORM_SECTION = new InjectionToken<ICSRuntimeFormSection>('cs_runtime_form_section');
export const CODINUS_RUNTIME_FORM_OPTIONS = new InjectionToken<ICSRunTimeFormOptions>('cs_runtime_form_options');

export type ICSRuntimeFormFieldConfig = ICSRuntimeFormFieldBase & { type: string; };
export type ICSRuntimeFormFieldNamelessConfig = Omit<ICSRuntimeFormFieldConfig, 'name'> & { name?: string };

export interface ICSRuntimeFormComponentFactory {
    getComponent(config: ICSRuntimeFormFieldNamelessConfig): Type<ICSRuntimeFormElement<any, any>> | null;
    getTemplatesComponent(): Type<ICSFormTemplateProviderComponent>;
}

export interface ICSFormTemplateProviderComponent {
    readonly templates: Signal<readonly CSNamedTemplate[]>
}

export interface ICSRuntimeFormHandler<TField extends ICSRuntimeFormFieldBase = any> {
    readonly injector: Injector;
    readonly events: () => Nullable<ICSRuntimeFormEvents<TField>>;
    readonly prefix: () => Nullable<string>;
    readonly templates: () => Nullable<(readonly CSNamedTemplate[]) | CSNamedTemplate[]>;
    readonly signalValue: () => unknown;
    readonly formGroupDirective: FormGroupDirective;

    getElementByDataKey(path: string | string[]): ICSRuntimeFormElementData<TField> | null;
    getElementByName(path: string | string[]): TField | null;
    //getValue(): ICSFormValue;
    //readOnly: WritableSignal<boolean>;
    onButtonClick(event: Event, button: ICSRuntimeFormButtonBase, config: TField): void;
}

export interface ICSRuntimeFormHost<TField extends ICSRuntimeFormFieldBase = any> {
    readonly events: () => Nullable<ICSRuntimeFormEvents<TField>>;
    readonly prefix: () => Nullable<string>;
    readonly userTemplates?: () => Nullable<(readonly CSNamedTemplate[]) | CSNamedTemplate[]>;
    readonly signalValue: () => unknown;
    readonly rootArea: () => ICSRuntimeFormAreaBase;
}

export interface ICSRuntimeFormElement<TElementType extends ICSRuntimeFormFieldBase = any, TValueType = unknown> {
    config: Signal<TElementType>;
    matFormFieldControl: Signal<Nullable<MatFormFieldControl<TValueType>>>;
    csFormControl: Signal<Nullable<CSAbstractFormControlName>>
}


export interface ICSRuntimeFormEvents<TField extends ICSRuntimeFormFieldBase = any> {
    valueChange?(arg: ICSRuntimeFormValueChangeArg<TField>): void;
    elementButtonClick?(button: ICSRuntimeFormButtonBase, config: TField): void;
    formInitialized?(formHandler: ICSRuntimeFormHandler<TField>): void;
}

export interface ICSRuntimeFormElementData<TField extends ICSRuntimeFormFieldBase = any> {
    control: AbstractControl;
    config: TField;
}

export interface ICSRuntimeFormSection {
    injector: Injector;
    parentSection: ControlContainer | null;
}

export type ICSRunTimeFormOptions = { templateMaps: IStringRecord; }

export const DefaultRuntimeFormOptions: ICSRunTimeFormOptions = {
    templateMaps: {
        area: 'default',
        'check-box': 'default-flex',
        'slide-toggle': 'default-flex',
        default: 'mat-field'
    }
};
