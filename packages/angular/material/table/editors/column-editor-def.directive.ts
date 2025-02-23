import { ComponentPortal, DomPortal } from '@angular/cdk/portal';
import { VIRTUAL_SCROLLABLE } from '@angular/cdk/scrolling';
import { Directive, Injector, Type, ViewContainerRef, computed, inject, input } from '@angular/core';
import { isTableEditorElement } from '../shared/function';
import { CODINUS_TABLE_COMPONENT_FACTORY, CSTableEditorType, ICSHandledEditorComponent, ICSTableEditorElement, ICSTableEditorView } from '../shared/types';

@Directive({
    selector: '[cdkColumnDef][editorType],[matColumnDef][editorType]',
})
export class CSColumnEditorDef<TOptions = unknown> {

    private viewContainerRef = inject(ViewContainerRef, { self: true });
    private readonly _componentFactory = inject(CODINUS_TABLE_COMPONENT_FACTORY, { optional: true });

    editorOptions = input<TOptions>({} as TOptions);
    editorType = input<CSTableEditorType>();

    editor = computed<ICSTableEditorView>(() => {
        const editorType = this.editorType();
        if (!editorType)
            return null;
        const component = typeof editorType === 'string'
            ? this._componentFactory?.getEditorComponent(editorType)
            : editorType;

        if (!component)
            return null;

        if (!isTableEditorElement(component.prototype)) {
            throw new Error(`${component.prototype.constructor?.name} did not implement ICSTableEditorElement correctly`);
        }

        const handled = (component as unknown as ICSHandledEditorComponent).isSelfViewHandled ?? false;
        if (handled)
            return { portal: new ComponentPortal(component), handled: true };

        return this._creatDomPortal(component);
    });

    private _creatDomPortal(editorComponent: Type<ICSTableEditorElement>): ICSTableEditorView {
        //TODO: check for createComponent function
        const providers = [{ provide: VIRTUAL_SCROLLABLE, useValue: null }];
        const injector = Injector.create({ providers, parent: this.viewContainerRef.injector });
        const componentRef = this.viewContainerRef.createComponent(editorComponent, { injector });
        const element = document.createElement('div');
        element.appendChild(componentRef.location.nativeElement);
        return {
            instance: componentRef.instance,
            portal: new DomPortal(componentRef.location.nativeElement),
            handled: false
        };
    }
}