import { _getFocusedElementPierceShadowDom } from "@angular/cdk/platform";
import { CdkPortalOutletAttachedRef } from "@angular/cdk/portal";
import { Component, ComponentRef, OnInit, computed, inject } from "@angular/core";
import { createEventManager } from "@ngx-codinus/core/events";
import { CSPortalOutlet } from "@ngx-codinus/core/outlet";
import { CSColumnEditorDef } from "../editors/column-editor-def.directive";
import { isTableEditorElement } from "../shared/function";
import { ICSTableEditorElement } from "../shared/types";
import { CSTableEditableCellBase } from "./editable-cell-base";

@Component({
    selector: 'mat-cell[editable],cdk-cell[editable]',
    template: `
    @let editor = editorView();
    @let showEditor = editor && editor.portal && (isEditing() || editor.handled);
    @if(showEditor){
        @if(isEditing() && !editor.handled){
            <ng-template [csPortalOutlet]="editor.portal" (attached)="onAttach(editor.instance)" (detached)="onDetach()">
            </ng-template>
        }@else{
            <ng-template [csPortalOutlet]="editor.portal" (attached)="onAttach($event)" (detached)="onDetach()">
            </ng-template>    
        }
    }@else{
        <span class="cs-table-cell-text">{{formattedValue()}}</span>
    }
    `,
    host: {
        '(keydown.Enter)': '_handelKeydown($event)',
        '[attr.selfNavigate]': 'true'
    },
    imports: [CSPortalOutlet]
})
export class CSTableEditCellComponent<TData, TValue> extends CSTableEditableCellBase<TData, TValue> implements OnInit {

    protected cellEditorDef = inject(CSColumnEditorDef, { optional: true });

    protected _eventManager = createEventManager();
    protected editorView = computed(() => this.cellEditorDef?.editor());

    override formattedValue = computed(() => {
        const editorView = this.editorView();
        if (editorView && !editorView.handled && editorView.instance.formatValue)
            return editorView.instance.formatValue(this.value(), this.localizer.currentLang());
        return this.valueAccessor().formatValue(this.value());
    });


    protected onAttach(ref?: CdkPortalOutletAttachedRef | ICSTableEditorElement) {
        const instance = ref instanceof ComponentRef ? ref.instance : ref;
        if (isTableEditorElement(instance)) {
            instance.registerHandler(this);
            instance.initialize();
        }
    }

    protected onDetach() {
        /** */
    }

    protected _handelKeydown(event: KeyboardEvent) {
        if (event.target !== this._elementRef.nativeElement)
            return;
        switch (event.code) {
            case 'Enter':
                if (this.editWithEnter)
                    this.requestEdit();
                break;
            case 'F2':
                if (this.editWithF2)
                    this.requestEdit();
                break;
        }
    }

    protected override focusCell(): void {
        this._elementRef.nativeElement.focus();
    }

    override ngOnInit() {
        super.ngOnInit();
        this._eventManager.listenAndRegister('editor-events', this._elementRef.nativeElement,
            'dblclick', () => this.requestEdit());
    }

    protected _containsFocus() {
        const activeElement = _getFocusedElementPierceShadowDom();
        return activeElement && this._elementRef.nativeElement.contains(activeElement);
    }
}