/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectionToken } from "@angular/core";
import { IRecord, Nullable } from "@codinus/types";
import { IAppPageContent } from '@ngx-codinus/data-pages/core';
import {
    ICSRuntimeFormElementAnyField, ICSRuntimeFormEvents, ICSRuntimeFormFieldBase,
    ICSRuntimeFormFieldCheckBox,
    ICSRuntimeFormFieldConfig, ICSRuntimeFormFieldNamelessConfig
} from "@ngx-codinus/material/forms";
import { INodeAddMenuItem } from "@ngx-codinus/material/tree";

export interface IAppPageSaveRequest extends IAppPageContent {
    transpiledCode?: string;
    overwrite?: boolean;
}

export const CODINUS_FORM_COMPONENT_SETUP_FACTORY = new InjectionToken<ICSFormComponentSetupFactory>('cs_form_component_setup_factory');

export interface ICSFormComponentSetupFactory {
    getComponentChildrenInfo(config?: ICSRuntimeFormFieldNamelessConfig | null): ICSFormSetupConfig<ICSRuntimeFormFieldNamelessConfig>;
    getComponentIcon(componentType?: string): Nullable<string>;
    getComponentSpecialProperties(config?: ICSRuntimeFormFieldNamelessConfig): ICSFormComponentSetupConfig | null;
    getCustomEventsClass?(): Nullable<ICSRuntimeFormEvents<ICSRuntimeFormFieldConfig>>;
    getComponentSpecialEvents(config?: ICSRuntimeFormFieldNamelessConfig): ICSFormComponentSetupEvent[] | null;

}

export type ICSRuntimeFormSetupFieldConfig = CSFlxGapConfigComponent | ICSRuntimeFormElementAnyField & { type: string; };

export interface ICSFormSetupConfig<TField extends Omit<ICSRuntimeFormFieldBase, 'name'> = any> {
    allowedChildren: Array<INodeAddMenuItem<TField>> | null;
    childrenKey: Nullable<string>;
}

export interface ICSFormComponentSetupConfig {
    children?: ICSRuntimeFormSetupFieldConfig[],
    mergedChildren?: ICSRuntimeFormSetupFieldConfig[],
    toggleChildren?: ICSRuntimeFormFieldCheckBox[],
    panelColumns?: string;
    mergeTabs?: boolean;
    standards?: ICSComponentSetupStandard | null | false;
    conditional?: Array<{
        key: string;
        value: unknown | unknown[];
        children: ICSRuntimeFormSetupFieldConfig[],
        mergedChildren?: ICSRuntimeFormSetupFieldConfig[],
        toggleChildren?: ICSRuntimeFormFieldCheckBox[],
    }>
}

export type ICSEditorImportInfo = {
    type: string;
    path: string;
};

export type ICSEditorCodePatternInfo = IRecord<{
    codePattern: string;
    imports?: ICSEditorImportInfo[];
}>;

export interface ICSFormComponentSetupEvent {
    name: string,
    codePattern: string;
    imports?: ICSEditorImportInfo[];
}

export interface ICSComponentSetupStandard {
    dataKey?: boolean;
    requiredDataKey?: boolean;
    requiredLabel?: boolean;
    label?: boolean;
    labelIcon?: boolean;
    hints?: boolean;
    flexSpan?: boolean;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    allowClear?: boolean;
    hidden?: boolean;
    invisible?: boolean;
}

export interface ICSBuiltInConfigComponent<T extends string> {
    type: T;
    name: string;
}

export type CSFlxGapConfigComponent = ICSBuiltInConfigComponent<'flex-gap'> | ICSBuiltInConfigComponent<'flex-columns'> | ICSBuiltInConfigComponent<'flex-span'>;

