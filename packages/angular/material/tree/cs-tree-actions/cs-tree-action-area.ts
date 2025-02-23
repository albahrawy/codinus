import { Component, contentChild, Directive, ElementRef, inject, TemplateRef, viewChild } from '@angular/core';
import { CSOutletDirective } from '@ngx-codinus/core/outlet';
import { ICSTreeActions } from '../cs-types';

@Directive({
    selector: '[csTreeHandler]'
})
export class CSTreeActionAreaHandler {
    template = inject(TemplateRef);
}

@Component({
    selector: 'cs-tree-action-area',
    template: `<ng-container cs-outlet><ng-content/></ng-container>`,
    imports: [CSOutletDirective]
})
export class CSTreeActionArea {
    private _outlet = viewChild.required(CSOutletDirective);
    private _actionContent = contentChild.required(CSTreeActionAreaHandler);
    private element = inject(ElementRef);

    create(context: CSTreeActionAreaContext<unknown>) {
        this._outlet().viewContainerRef.createEmbeddedView(this._actionContent().template, context);
        return this.element;
    }

}

@Directive({
    selector: '[csNodeToolBar]'
})
export class CSTreeNodeHoverBar {
    template = inject(TemplateRef);
}

export class CSTreeActionAreaContext<TNode> {
    $implicit: ICSTreeActions<TNode | null>;

    constructor(treeFeatures: ICSTreeActions<TNode | null>) {
        this.$implicit = {
            add: treeFeatures.add.bind(treeFeatures),
            addToCurrent: treeFeatures.addToCurrent.bind(treeFeatures),
            remove: treeFeatures.remove.bind(treeFeatures),
            setFilter: treeFeatures.setFilter.bind(treeFeatures),
        };
    }
}