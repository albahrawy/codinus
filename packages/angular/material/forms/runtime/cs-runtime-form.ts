import {
    AfterViewInit, booleanAttribute, Component, computed, contentChildren,
    effect, forwardRef, inject, INJECTOR, input, OnInit, ViewEncapsulation
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControlContainer, FormGroupDirective } from '@angular/forms';
import { Nullable } from '@codinus/types';
import { CSNamedTemplate } from '@ngx-codinus/core/outlet';
import { CODINUS_UPLOAD_MANAGER, ICSDirtyComponent } from '@ngx-codinus/core/shared';
import { CSForm } from '../sections/cs-form';
import { CSFormPortal } from './cs-form-portal';
import { CSFormTemplateProviderService } from './cs-form-template-provider';
import { generateFormRenderConfig, getFormFieldChildrenByKey } from './functions';
import {
    CODINUS_RUNTIME_FORM, ICSRenderedRuntimeForm, ICSRuntimeForm, ICSRuntimeFormAreaBase,
    ICSRuntimeFormButtonBase, ICSRuntimeFormConfig, ICSRuntimeFormElementData,
    ICSRuntimeFormEvents, ICSRuntimeFormFieldBase, ICSRunTimeFormRenderer
} from './cs-element-base/types';

@Component({
    selector: 'cs-runtime-form',
    template: `
    <ng-content select="[before]" />
        <ng-container [cs-form-portal]="configToRender()"></ng-container>
    <ng-content />
    `,
    encapsulation: ViewEncapsulation.None,
    imports: [CSFormPortal],
    providers: [
        { provide: CODINUS_RUNTIME_FORM, useExisting: CSRuntimeForm },
        { provide: CODINUS_UPLOAD_MANAGER, useExisting: CSRuntimeForm },
        { provide: ControlContainer, useExisting: forwardRef(() => CSRuntimeForm) },
        { provide: FormGroupDirective, useExisting: forwardRef(() => CSRuntimeForm) }
    ]
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class CSRuntimeForm<TField extends ICSRuntimeFormFieldBase = any> extends CSForm
    implements ICSDirtyComponent, OnInit, AfterViewInit, ICSRuntimeForm<TField>, ICSRenderedRuntimeForm<TField> {

    private templateService = inject(CSFormTemplateProviderService);

    private readonly watchEvents = effect(() => {
        if (!this.disableInitializeCall())
            this.events()?.formInitialized?.(this);
    });

    events = input<Nullable<ICSRuntimeFormEvents<TField>>>(null);
    config = input<ICSRuntimeFormConfig>();
    prefix = input<Nullable<string>>();
    disableInitializeCall = input(false, { transform: booleanAttribute });
    readonly signalValue = toSignal(this.form.valueChanges);

    private userTempaltes = contentChildren(CSNamedTemplate);

    readonly runTimeFormRenderer: ICSRunTimeFormRenderer = {
        injector: inject(INJECTOR),
        events: this.events,
        templates: computed(() => [...this.userTempaltes(), ...this.templateService.templates()]),
        prefix: this.prefix,
        signalValue: this.signalValue
    };

    protected configToRender = computed<ICSRuntimeFormAreaBase>(() => generateFormRenderConfig(this.config()));

    getElementByDataKey(path: string | string[]): ICSRuntimeFormElementData | null {
        const control = this.formGroup.get(path);
        if (!control)
            return null;
        return { control, config: control._boundConfig?.() as TField };
    }
    //TODO: need to test all cases
    getElementByName(path: string | string[]): TField | null {
        if (!path)
            return null;
        const panels = this.configToRender().panels;
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

    onButtonClick(event: Event, button: ICSRuntimeFormButtonBase, config: TField) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.events()?.elementButtonClick?.(button, config);
    }
}
