import { Injectable, Type } from "@angular/core";
import { ICSRuntimeFormFieldCanBeInDialog } from "./cs-element-base/types";
import { CSDefaultRuntimeTemplateContainer } from "./default-templates/runtime-form-templates";
import { CSFormElementArea } from "./elements/form-element-area";
import { CSFormElementCheckBox } from "./elements/form-element-checkbox";
import { CSFormElementDate } from "./elements/form-element-date";
import { CSFormElementDateRange } from "./elements/form-element-date-range";
import { CSFormElementLocalizable } from "./elements/form-element-localizable-text";
import { CSFormElementMaskedText } from "./elements/form-element-masked-text";
import { CSFormElementNumber } from "./elements/form-element-number";
import { CSFormElementSection } from "./elements/form-element-section";
import { CSFormElementSectionArray } from "./elements/form-element-section-array";
import { CSFormElementSelect } from "./elements/form-element-select";
import { CSFormElementSelectGrid } from "./elements/form-element-select-grid";
import { CSFormElementSlideToggle } from "./elements/form-element-slide-toggle";
import { CSFormElementTable } from "./elements/form-element-table";
import { CSFormElementText } from "./elements/form-element-text";
import { CSFormElementDialog } from "./elements/form-in-dialog-element";
import { CSFormElementUnknown } from "./elements/unknown-form-element";
import {
    ICSFormTemplateProviderComponent, ICSRuntimeFormComponentFactory,
    ICSRuntimeFormElement, ICSRuntimeFormFieldNamelessConfig
} from "./injection-tokens";
import { CSFormElementTextArea } from "./elements/form-element-text-area";


@Injectable({ providedIn: 'root' })
export class CSFormComponentFactory implements ICSRuntimeFormComponentFactory {

    getComponent(config: ICSRuntimeFormFieldNamelessConfig): Type<ICSRuntimeFormElement> | null {
        if ((config as Omit<ICSRuntimeFormFieldCanBeInDialog, 'name'>).dialog?.enabled)
            return CSFormElementDialog;
        switch (config.type) {
            case 'area':
                return CSFormElementArea;
            case 'section':
                return CSFormElementSection;
            case 'localizable-text':
                return CSFormElementLocalizable;
            case 'section-array':
                return CSFormElementSectionArray;
            case 'text':
                return CSFormElementText;
                case 'text-area':
                return CSFormElementTextArea;
            case 'masked-text':
                return CSFormElementMaskedText;
            case 'number':
                return CSFormElementNumber;
            case 'date':
                return CSFormElementDate;
            case 'date-range':
                return CSFormElementDateRange;
            case 'check-box':
                return CSFormElementCheckBox;
            case 'slide-toggle':
                return CSFormElementSlideToggle;
            case 'select':
                return CSFormElementSelect;
            case 'select-grid':
                return CSFormElementSelectGrid;
            case 'table':
                return CSFormElementTable;
            default:
                return CSFormElementUnknown;
        }
    }

    getTemplatesComponent(): Type<ICSFormTemplateProviderComponent> {
        return CSDefaultRuntimeTemplateContainer;
    }
}