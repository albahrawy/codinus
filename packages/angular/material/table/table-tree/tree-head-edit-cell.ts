import { Component, ViewEncapsulation, booleanAttribute, computed, inject, input } from '@angular/core';
import { preventEvent } from '@codinus/dom';
import { CSPortalOutlet } from '@ngx-codinus/core/outlet';
import { CSTableEditCellComponent } from '../editors';
import { CSTableTreeRelationDataHandler } from './data-source-handler';
import { CSTreeNodeItem } from './types';

@Component({
    selector: 'mat-cell[treeHeadEditableCell],cdk-cell[treeHeadEditableCell]',
    exportAs: 'treeHeadEditableCell',
    host: {
        'class': 'cs-table-tree-head-cell'
    },
    template: `
            <div class="cs-table-tree-node-body" (dblclick)="_toggleByRow($event)"
                (keydown.Space)="_toggleByRow($event)" tabindex="-1">
                @if(rowData?.expandable){
                <div class="cs-tree-arrow-container" (click)="_toggleNode($event)"
                    [style.paddingLeft.px]="paddingLeft()">
                    <span class="cs-table-tree-expand-arrow" [class.cs-tree-expand-arrow-isExpanded]="rowData?.expanded">
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 20 20" width="20px"
                            fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 6l6 6-6 6" />
                        </svg>
                    </span>
                </div>
                }@else {
                <div class="cs-table-tree-arrow-container" [style.paddingLeft.px]="paddingLeft()"></div>
                }

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
                <div class="cs-table-tree-node-text cs-table-cell-text">{{formattedValue()}}</div>
            }
            </div>
    `,
    encapsulation: ViewEncapsulation.None,
    imports: [CSPortalOutlet]
})

export class CSTableTreeEditableCell<TRecord extends object, TValue> extends CSTableEditCellComponent<CSTreeNodeItem<TRecord>, TValue> {
    protected _treeHandler = inject<CSTableTreeRelationDataHandler<TRecord>>(CSTableTreeRelationDataHandler);

    toggleByRow = input(false, { transform: booleanAttribute });


    protected _toggleByRow(event: Event) {
        if (this.toggleByRow())
            this._toggleNode(event);
    }

    protected _toggleNode(event: Event) {
        preventEvent(event);
        if (this.rowData)
            this._treeHandler.toggleNode(this.rowData);
    }

    protected paddingLeft = computed(() => (this.rowData?.treeLevel ?? 0) * 40);
}