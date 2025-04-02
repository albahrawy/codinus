import {
    ICSRuntimeFormArea, ICSRuntimeFormAreaPanel, ICSRuntimeFormElementAnyField,
    ICSRuntimeFormElementField, CSFormAreaType,
    ICSRuntimeFormFieldText,
    ICSRuntimeFormFieldDate,
    ICSRuntimeFormFieldSelect,
    ICSRuntimeFormFieldSelectGrid,
    ICSRuntimeFormFieldCheckBox,
    ICSRuntimeFormFieldNumber,
    ICSRuntimeFormFieldSection,
    ICSRuntimeFormFieldSectionArray,
    ICSRuntimeFormFieldLocalizable
} from "@ngx-codinus/material/forms";

import { INovaAppPage, IFormField, DataPageElements, SectionsDisplayType } from "./types";
import { toDate, toNumber } from "@codinus/js-extensions";
import { ICSTableColumn } from "@ngx-codinus/material/table";

export function convertSections(page: INovaAppPage): ICSRuntimeFormArea {
    const area = {
        name: 'root', type: 'area',
        displayType: convertPageDisplayType(page.displayType),
        accordionMulti: page.panelMulti,
        tabsPosition: page.isVerticalTab ? 'left' : 'top',
    } as ICSRuntimeFormArea;

    area.panels = page.sections.map((section, index) => {
        const name = (typeof section.caption === 'string' ? section.caption : section.caption?.['en']);
        return {
            name: name || `Section_${index}`,
            type: 'panel',
            label: section.caption,
            accordionExpanded: section.expanded,
            flexColumns: section.childrenLayout?.columnCount,
            flexGap: section.childrenLayout?.gutterSize,
            children: section.fields?.map((element, index) => convertFormField(element, index)) ?? []
        } as ICSRuntimeFormAreaPanel;
    });

    return area;
}

export function convertFormField(element: IFormField, index: number): ICSRuntimeFormElementAnyField {
    const baseField = convertBaseField(element, index);
    switch (element.controlType) {
        case 'text':
        case 'text-area':
            return convertToText(element, baseField, element.controlType);
        case 'number':
            return convertToNumber(element, baseField);
        case 'date-picker':
            return convertToDatePicker(element, baseField);
        case 'select':
            return convertToSelect(element, baseField);
        case 'grid-picker':
            return convertToSelectGrid(element, baseField);
        case 'check-box':
        case 'slide-toggle':
            return convertToCheckBox(element, baseField);
        case 'localized-text':
            return convertToLocalizedText(element, baseField);
        case 'group':
            return convertToSectionGroup(element, baseField);
        case 'group-array':
            return convertToSectionArray(element, baseField);
        case 'grid-editor':
        case 'radio':
        case 'code':
        case 'img64-upload':
        case 'img-selector':
        case 'file-upload':
        case 'icon-chooser':
        case 'color':
        case 'email':
        case 'password':
        default:
            return baseField as ICSRuntimeFormElementAnyField;
    }
}

export function convertGridColumnType(element: IFormField, enabled: boolean) {
    if (!enabled)
        return null;

    switch (element.controlType) {
        case 'text':
        case 'email':
        case 'password':
            return { type: 'string' };
        case 'number':
            return { type: 'number' };
        case 'date-picker':
            return { type: 'date' };
        case 'select':
            return { type: 'select' };
    }

    return null;
}

export function convertBaseField(element: IFormField, index: number): ICSRuntimeFormElementField {
    return {
        name: element.key || `Field_${index}`,
        dataKey: element.key,
        flexFullRow: element.layout?.flexWidth === '100%',
        cssClass: element.cssClass,
        disabled: element.disabled,
        hidden: element.hidden,
        order: element.layout?.flexOrder,
        required: element.required,
        readOnly: element.readOnly,
        label: element.caption || { ar: '_', en: '_' },
    };
}

export function convertPageType(elements: DataPageElements): "form" | "grid" | "page" | undefined {
    switch (elements) {
        case 'form':
            return 'form';
        case 'grid':
            return 'grid';
        case 'form-grid':
            return 'page';
        default:
            return undefined;
    }
}

export function convertPageDisplayType(displayType: SectionsDisplayType): CSFormAreaType {
    switch (displayType) {
        case 'tab':
            return 'tab';
        case 'panel':
            return 'accordion';
        case 'border':
            return 'card';
        default:
            return null;
    }
}

function convertToText(element: IFormField, baseField: ICSRuntimeFormElementField, type: 'text' | 'text-area' = 'text'): ICSRuntimeFormFieldText {
    return {
        ...baseField,
        type,
        maxlength: typeof element.validation?.max === 'number' ? element.validation.max : undefined,
        minlength: typeof element.validation?.min === 'number' ? element.validation.min : undefined,
        defaultValue: element.defaultValue,
    };
}

function convertToDatePicker(element: IFormField, baseField: ICSRuntimeFormElementField): ICSRuntimeFormFieldDate {
    return {
        ...baseField,
        type: 'date',
        max: convertDateLimit(element.validation?.max),
        min: convertDateLimit(element.validation?.min),
        inputDisabled: element.disableInput,
        popupDisabled: element.disablePopup,
        defaultValue: element.defaultValue,
    };
}

function convertToSelect(element: IFormField, baseField: ICSRuntimeFormElementField): ICSRuntimeFormFieldSelect {
    return {
        ...baseField,
        type: 'select',
        defaultValue: element.defaultValue,
        disableMember: element.dataSource?.disabledMember,
        displayMember: element.dataSource?.displayMember,
        valueMember: element.dataSource?.valueMember,
        maxHeight: element.height,
        multiple: element.multiple,
        showSearch: element.showSearch,
    };
}

function convertToSelectGrid(element: IFormField, baseField: ICSRuntimeFormElementField): ICSRuntimeFormFieldSelectGrid {
    return {
        ...baseField,
        type: 'select-grid',
        defaultValue: element.defaultValue,
        disableMember: element.dataSource?.disabledMember,
        displayMember: element.dataSource?.displayMember,
        valueMember: element.dataSource?.valueMember,
        maxHeight: element.height,
        multiple: element.multiple,
        columns: element.fields?.map((field, index) => convertGridColumn(field, index)) ?? [],
    };
}

function convertDateLimit(value: number | Date | null | string | undefined): Date | undefined {
    if (!value || typeof value === 'number') return undefined;
    return toDate(value) ?? undefined;
}

function convertGridColumn(field: IFormField, index: number): ICSTableColumn<unknown> & { type: 'grid-column' } {
    return {
        type: 'grid-column',
        name: field.key || `Column_${index}`,
        dataKey: field.key,
        label: field.caption || { ar: '_', en: '_' },
        hidden: field.hidden,
        order: field.layout?.flexOrder,
        width: field.layout?.flexWidth,
        sortable: field.grid?.sortable,
        reordable: field.grid?.resizable,
        resizable: field.grid?.resizable,
        filter: convertGridColumnType(field, !!field.grid?.filter),
        editor: convertGridColumnType(field, !field.readOnly),
        cellFormatter: field.grid?.formatString,
    };
}

function convertToCheckBox(element: IFormField, baseField: ICSRuntimeFormElementField): ICSRuntimeFormFieldCheckBox {
    return {
        ...baseField,
        type: 'check-box',
        defaultValue: element.defaultValue,
        labelPosition: element.labelPosition,
    };
}

function convertToNumber(element: IFormField, baseField: ICSRuntimeFormElementField): ICSRuntimeFormFieldNumber {
    return {
        ...baseField,
        type: 'number',
        max: toNumber(element.validation?.max),
        min: toNumber(element.validation?.min),
        //step: element.validation?.step,
        defaultValue: element.defaultValue,
    };
}

function convertToSectionGroup(element: IFormField, baseField: ICSRuntimeFormElementField): ICSRuntimeFormFieldSection {
    return {
        ...baseField,
        type: 'section',
        children: element.fields?.map((element, index) => convertFormField(element, index)) ?? [],
        dialog: element.asDialog ? { enabled: true } : undefined,
    };
}

function convertToSectionArray(element: IFormField, baseField: ICSRuntimeFormElementField): ICSRuntimeFormFieldSectionArray {
    return {
        ...baseField,
        type: 'section-array',
        children: element.fields?.map((element, index) => convertFormField(element, index)) ?? [],
        dialog: element.asDialog ? { enabled: true } : undefined,
        displayMember: element.displayMember,
        height: element.height,
        multiple: element.multiple,
    };
}

function convertToLocalizedText(element: IFormField, baseField: ICSRuntimeFormElementField): ICSRuntimeFormFieldLocalizable {
    return {
        ...baseField,
        type: 'localizable-text',
        dialog: element.asDialog ? { enabled: true } : undefined,
    };
}

export function sanitizeVariableName(str: string) {
    // Remove invalid characters (keep letters, numbers, _, and $)
    let sanitized = str.replace(/[^a-zA-Z0-9_$]/g, '');

    // Ensure it doesn't start with a number
    if (/^\d/.test(sanitized)) {
        sanitized = '_' + sanitized;
    }

    // Ensure it isn't a reserved keyword
    if (isReservedKeyword(sanitized)) {
        sanitized = '_' + sanitized;
    }

    return sanitized;
}

// Check if the given name is a JavaScript reserved keyword
function isReservedKeyword(name: string) {
    const keywords = new Set([
        'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
        'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally',
        'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null',
        'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
        'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'implements',
        'interface', 'package', 'private', 'protected', 'public'
    ]);
    return keywords.has(name);
}