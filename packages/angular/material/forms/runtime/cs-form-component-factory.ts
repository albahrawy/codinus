import { Injectable, Type } from "@angular/core";
import {
    ICSFormTemplateProviderComponent, ICSRuntimeFormComponentFactory,
    ICSRuntimeFormElement, ICSRuntimeFormFieldBase,
    ICSRuntimeFormFieldCanBeInDialog
} from "./cs-element-base/types";
import { CSFormElementDialog } from "./elements/form-in-dialog-element";
import { CSFormElementArea } from "./elements/form-element-area";
import { CSFormElementLocalizable } from "./elements/form-element-localizable-text";
import { CSFormElementSection } from "./elements/form-element-section";
import { CSFormElementUnknown } from "./elements/unknown-form-element";
import { CSFormElementDate } from "./elements/form-element-date";
import { CSFormElementDateRange } from "./elements/form-element-date-range";
import { CSFormElementMaskedText } from "./elements/form-element-masked-text";
import { CSFormElementNumber } from "./elements/form-element-number";
import { CSFormElementText } from "./elements/form-element-text";



@Injectable({ providedIn: 'root' })
export class CSFormComponentFactory implements ICSRuntimeFormComponentFactory {

    getComponent(config: ICSRuntimeFormFieldBase & { type: string; }): Type<ICSRuntimeFormElement> | null {
        if ((config as ICSRuntimeFormFieldCanBeInDialog).dialog?.enabled)
            return CSFormElementDialog;
        switch (config.type) {
            case 'area':
                return CSFormElementArea;
            case 'section':
                return CSFormElementSection;
            case 'localizable-text':
                return CSFormElementLocalizable;
            // case 'section-array':
            //     return CSFormElementSectionArray;
            case 'text':
                return CSFormElementText;
            case 'masked-text':
                return CSFormElementMaskedText;
            case 'number':
                return CSFormElementNumber;
            case 'date':
                return CSFormElementDate;
            case 'date-range':
                return CSFormElementDateRange;
            // case 'select':
            //     return CSFormElementSelect;
            // case 'select-grid':
            //     return CSFormElementSelectGrid;
            // case 'table':
            //     return CSFormElementTable;
            default:
                return CSFormElementUnknown;
        }
    }

    getTemplatesComponent(): Type<ICSFormTemplateProviderComponent> {
        throw new Error("Method not implemented.");
    }
}