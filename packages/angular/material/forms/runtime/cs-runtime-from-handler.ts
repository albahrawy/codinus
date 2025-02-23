import { computed, effect, inject, INJECTOR } from "@angular/core";
import { FormGroupDirective } from "@angular/forms";
import { ICSRuntimeFormButtonBase, ICSRuntimeFormFieldBase } from "./cs-element-base/types";
import { CSFormTemplateProviderService } from "./cs-form-template-provider";
import { getFormFieldChildrenByKey } from "./functions";
import { ICSRuntimeFormElementData, ICSRuntimeFormHandler, ICSRuntimeFormHost } from "./injection-tokens";

export class CSRuntimeFormHandler<TField extends ICSRuntimeFormFieldBase> implements ICSRuntimeFormHandler<TField> {

    protected templateService = inject(CSFormTemplateProviderService);

    readonly injector = inject(INJECTOR);
    readonly events = computed(() => this.host.events());
    readonly prefix = computed(() => this.host.prefix());
    readonly signalValue = computed(() => this.host.signalValue());

    get formGroupDirective() { return this._formGroupDirective(); }

    readonly templates = computed(() => {
        const userTemplates = this.host.userTemplates?.() ?? [];
        return [...userTemplates, ...this.templateService.templates()];
    });

    constructor(private host: ICSRuntimeFormHost, private _formGroupDirective: () => FormGroupDirective) {
        effect(() => this.host.events()?.formInitialized?.(this));
    }

    getElementByDataKey(path: string | string[]): ICSRuntimeFormElementData<TField> | null {
        const control = this.formGroupDirective.form.get(path);
        if (!control)
            return null;
        return { control, config: control._boundConfig?.() as TField };
    }

    getElementByName(path: string | string[]): TField | null {
        if (!path)
            return null;
        const panels = this.host.rootArea().panels;
        if (!panels.length)
            return null;

        const pathArray = (typeof path === 'string' ? path.split('.') : path).reverse();
        let currKey = pathArray.pop();
        const panel = panels.length === 1 ? panels.at(0) : panels.find(p => p.name == currKey);
        let elements = panel?.children;
        if (panel?.name)
            currKey = pathArray.pop();
        let element = null;
        while (currKey && elements) {
            element = elements.find(e => e.name === currKey) ?? null;
            elements = getFormFieldChildrenByKey(element, currKey);
            currKey = pathArray.pop();
        }
        return element as TField;
    }

    onButtonClick(event: Event, button: ICSRuntimeFormButtonBase, config: TField): void {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.events()?.elementButtonClick?.(button, config);
    }
}