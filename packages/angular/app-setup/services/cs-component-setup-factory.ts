import { Injectable } from "@angular/core";
import { Nullable } from "@codinus/types";
import { ICSRuntimeFormEvents, ICSRuntimeFormFieldConfig, ICSRuntimeFormFieldNamelessConfig, ICSRuntimeFormHandler } from "@ngx-codinus/material/forms";
import { AreaSpecialProperties, PanelSpecialProperties } from "../helper/area-special-properties";
import { AnyFieldConfig, AnyFieldIcon, AreaFieldConfig, GridFieldConfig } from "../helper/children-info";
import { GridColumnSpecialProperties } from "../helper/grid-column-special-properties";
import {
    CheckBoxSpecialProeprties, DateRangeSpecialProperties, DateSpecialProperties,
    GridSpecialProperties, LocalizableTextSpecialProperties, MaskedTextSpecialProperties, NumberSpecialProperties,
    SelectGridSpecialProperties, SelectSpecialProperties, TextSpecialProperties
} from "../helper/input-special-properties";
import {
    ICSFormComponentSetupConfig, ICSFormComponentSetupEvent,
    ICSFormComponentSetupFactory, ICSFormSetupConfig
} from "../helper/types";
import { FORM_COMPONENT_VALIDATORS } from "../helper/input-special-events";
import { ICSValueChangeArgs } from "@ngx-codinus/core/data";
import { BehaviorSubject } from "rxjs";
import { DateFilterPredicates, NumberFilterPredicates, StringFilterPredicates } from "@ngx-codinus/material/table-editors";

@Injectable({ providedIn: 'root' })
export class CSFormComponentSetupFactory implements ICSFormComponentSetupFactory {

    getComponentChildrenInfo(config: Nullable<ICSRuntimeFormFieldNamelessConfig>): ICSFormSetupConfig<ICSRuntimeFormFieldNamelessConfig> {
        switch (config?.type) {
            case 'area':
                return { childrenKey: 'panels', allowedChildren: AreaFieldConfig };
            case null:
            case undefined:
            case 'section':
            case 'section-array':
            case 'panel':
                return { childrenKey: 'children', allowedChildren: AnyFieldConfig };
            case 'select-grid':
                return { childrenKey: 'columns', allowedChildren: GridFieldConfig };
            case 'grid':
                return { childrenKey: 'columns', allowedChildren: GridFieldConfig };
            default:
                return { allowedChildren: null, childrenKey: null };
        }
    }

    getComponentIcon(componentType: string): Nullable<string> {
        return AnyFieldIcon[componentType];
    }

    getComponentSpecialProperties(config?: ICSRuntimeFormFieldNamelessConfig): ICSFormComponentSetupConfig | null {
        switch (config?.type) {
            case 'area':
                return AreaSpecialProperties;
            case 'panel':
                return PanelSpecialProperties;
            case 'section':
                return { standards: { requiredDataKey: false }, mergeTabs: true };
            case 'localizable-text':
                return LocalizableTextSpecialProperties;
            case 'section-array':
                return {};
            case 'text':
                return TextSpecialProperties;
            case 'masked-text':
                return MaskedTextSpecialProperties;
            case 'number':
                return NumberSpecialProperties;
            case 'date':
                return DateSpecialProperties;
            case 'date-range':
                return DateRangeSpecialProperties;
            case 'check-box':
            case 'slide-toggle':
                return CheckBoxSpecialProeprties;
            case 'select':
                return SelectSpecialProperties;
            case 'select-grid':
                return SelectGridSpecialProperties;
            case 'grid':
                return GridSpecialProperties;
            case 'grid-column':
                return GridColumnSpecialProperties;
            default:
                return null;
        }
    }

    getComponentSpecialEvents(config?: ICSRuntimeFormFieldNamelessConfig): ICSFormComponentSetupEvent[] | null {
        switch (config?.type) {
            // case 'area':
            //     return AreaSpecialProperties;
            // case 'panel':
            //     return PanelSpecialProperties;
            // case 'section':
            //     return { standards: { requiredDataKey: false }, mergeTabs: true };
            // case 'localizable-text':
            //     return LocalizableTextSpecialProperties;
            // case 'section-array':
            //     return {};
            case 'text':
                return FORM_COMPONENT_VALIDATORS;
            // case 'masked-text':
            //     return MaskedTextSpecialProperties;
            case 'number':
                return FORM_COMPONENT_VALIDATORS;
            case 'date':
                return FORM_COMPONENT_VALIDATORS;
            // case 'date-range':
            //     return DateRangeSpecialProperties;
            // case 'check-box':
            // case 'slide-toggle':
            //     return CheckBoxSpecialProeprties;
            // case 'select':
            //     return SelectSpecialProperties;
            // case 'select-grid':
            //     return SelectGridSpecialProperties;
            // case 'grid':
            //     return GridSpecialProperties;
            // case 'grid-column':
            //     return GridColumnSpecialProperties;
            default:
                return null;
        }
    }

    getCustomEventsClass(): Nullable<ICSRuntimeFormEvents<ICSRuntimeFormFieldConfig>> {
        return FormSetupCustomEvent.customeEvent;
    }
}

class FormSetupCustomEvent implements ICSRuntimeFormEvents<ICSRuntimeFormFieldConfig> {
    static customeEvent = new FormSetupCustomEvent();
    private _formHandler: Nullable<ICSRuntimeFormHandler<ICSRuntimeFormFieldConfig>>;
    private _operationList = new BehaviorSubject<string[]>([]);
    gridColumnFilterType_ValueChange(args: ICSValueChangeArgs<string | null>) {
        switch (args.value) {
            case 'text':
                this._operationList.next(Object.keys(StringFilterPredicates));
                break;
            case 'number':
                this._operationList.next(Object.keys(NumberFilterPredicates));
                break;
            case 'date':
                this._operationList.next(Object.keys(DateFilterPredicates));
                break;
        }
    }

    gridColumnFilterInitialOperation_DataSource() {
        return this._operationList;
    }

    // gridColumnFilterInitialOperation_Hidden(value: object) {
    //     console.log('signalValue', value);
    //     return false;
    // }

    formInitialized?(formHandler: ICSRuntimeFormHandler<ICSRuntimeFormFieldConfig>): void {
        this._formHandler = formHandler;
    }
}