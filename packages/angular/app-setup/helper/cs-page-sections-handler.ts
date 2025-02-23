import { computed, inject } from "@angular/core";
import { getValue, setValue } from "@codinus/js-extensions";
import { ICSRuntimeFormAreaBase, ICSRuntimeFormFieldNamelessConfig } from "@ngx-codinus/material/forms";
import { CSFormComponentSetupFactory } from "../services/cs-component-setup-factory";
import { CODINUS_FORM_COMPONENT_SETUP_FACTORY, ICSFormComponentSetupFactory } from "./types";

export class CSAppPagesSectionsHandler {

    _formComponentFactory = inject(CODINUS_FORM_COMPONENT_SETUP_FACTORY, { optional: true }) ??
        inject<ICSFormComponentSetupFactory>(CSFormComponentSetupFactory);

    events = computed(() => this._formComponentFactory.getCustomEventsClass?.());

    iconMember = (record: ICSRuntimeFormFieldNamelessConfig) => {
        return this._formComponentFactory.getComponentIcon(record.type) ?? '';
    }

    childAccessor = (r: ICSRuntimeFormFieldNamelessConfig) => {
        const rules = this._formComponentFactory.getComponentChildrenInfo(r);
        if (rules.childrenKey) {
            const children = getValue<ICSRuntimeFormFieldNamelessConfig[]>(r, rules.childrenKey);
            if (children)
                return children;
            setValue(r, rules.childrenKey, [], true);
            return getValue<ICSRuntimeFormFieldNamelessConfig[]>(r, rules.childrenKey);
        }
        return null;
    }

    normalizeSections(config: ICSRuntimeFormAreaBase, showRoot: boolean) {
        if (config.panels?.length > 1 || showRoot)
            return [config];
        else if (config.panels?.length === 1)
            return config.panels[0].children as unknown as ICSRuntimeFormFieldNamelessConfig[];
        else
            return showRoot ? [{ type: 'area', name: 'root' }] as unknown as ICSRuntimeFormFieldNamelessConfig[] : [];
    }
}