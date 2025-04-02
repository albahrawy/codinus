import { CDK_TREE_NODE_OUTLET_NODE, CdkNestedTreeNode, CdkTree, CdkTreeNode, CdkTreeNodeOutlet } from '@angular/cdk/tree';
import { AfterContentInit, Component, computed, Directive, effect, ElementRef, inject, input, IterableDiffer, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatNestedTreeNode } from '@angular/material/tree';
import { preventEvent } from '@codinus/dom';
import { toNumber } from '@codinus/js-extensions';
import { Nullable } from '@codinus/types';
import { takeUntil } from 'rxjs';
import { CSCdkTreeNodeBodyBase } from './cs-tree-node-body-base';
import { CODINUS_TREE_FEATURES, CODINUS_TREE_NODE_BODY } from './cs-types';
import { debouncedSignal } from '@ngx-codinus/core/shared';

@Component({
    selector: `cs-tree-node`,
    exportAs: 'csTreeNodeBody',
    template: `
    @let expanded = _isExpanded();
    <div class="cs-tree-node-body" [class.cs-tree-node-current]="_isCurrent()"
        (keydown.Enter)="_nodeClicked($event)" 
        (click)="_nodeClicked($event)" (dblclick)="_toggle($event)" (keydown.Space)="_toggle($event)" tabindex="-1"
        (contextmenu)="_onContextMenu($event)">
        @if(isExpandable()){
            <div class="cs-tree-arrow-container" (click)="_toggle($event)" [attr.aria-label]="ariaLabel()">
                <span class="cs-tree-expand-arrow" [class.cs-tree-expand-arrow-isExpanded]="expanded">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 20 20" width="20px" fill="none" 
                        stroke="currentColor" stroke-width="2">
                        <path d="M9 6l6 6-6 6" />
                        </svg>       
                </span>
            </div>
        }@else {
            <div class="cs-tree-arrow-container"></div>
        }
        @if(_showIcon()){
            <mat-icon class="cs-tree-node-icon">{{_icon()}}</mat-icon> 
        }
        <div class="cs-tree-node-text">{{_displayText()}}</div>
    </div>
    @if(isExpandable()){
        <div role="group" class="cs-tree-node-children-container" (transitionstart)="_inAnimation.set(true)" 
        (transitionend)="_inAnimation.set(false)" [class.cs-tree-node-isExpanded]="expanded">
        @if(!_isCollapsed()){
            <div><ng-container cdkTreeNodeOutlet></ng-container></div>
        }    
        </div>
    }
    `,
    imports: [MatIconModule, CdkTreeNodeOutlet],
    providers: [
        { provide: CODINUS_TREE_NODE_BODY, useExisting: CSTreeNodeBody },
    ]
})
export class CSTreeNodeBody<T> extends CSCdkTreeNodeBodyBase<T> {
    protected tree = inject(CdkTree);
    protected _csTreeNode = inject(CSTreeNode, { self: true });

    protected ariaLabel = computed(() => `Toggle ${this._displayText()}`);
    protected _inAnimation = signal(false);

    indent = input(20, { transform: (v: Nullable<string | number>) => v ? toNumber(v) : 20 });

    private _outlet = viewChild(CdkTreeNodeOutlet);

    protected _toggle(event: Event): void {
        preventEvent(event);
        this.tree.toggle(this.nodeData);
    }
    protected _isExpanded = computed(() => this._csTreeNode._isExpandedSignal());

    private _debouncedExpanded = debouncedSignal(this._isExpanded, 10);

    protected _isCollapsed = computed(() => {
        return !this._inAnimation() && !this._debouncedExpanded();
    });

    protected _onContextMenu(event: Event) {
        this._treeFeatures.conextMenuOpening.emit({ event, data: this.nodeData, source: this._cdkTreeNode._elementRef.nativeElement });
    }

    /**
     *
     */
    constructor() {
        super();
        effect(() => this._csTreeNode.setOutLet(this._outlet()));
    }
}


@Directive({
    selector: 'cs-tree-node',
    exportAs: 'csTreeNode',
    host: { 'class': 'cs-tree-node' },
    providers: [
        { provide: CdkTreeNode, useExisting: CSTreeNode },
        { provide: CdkNestedTreeNode, useExisting: CSTreeNode },
        { provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: CSTreeNode },
    ],
})
export class CSTreeNode<T, K = T> extends MatNestedTreeNode<T, K> implements AfterContentInit {

    protected _treeFeatures = inject(CODINUS_TREE_FEATURES);

    private _nodeOutlet?: CdkTreeNodeOutlet;
    _isExpandedSignal = signal(false);

    setOutLet(outlet?: CdkTreeNodeOutlet) {
        this._nodeOutlet = outlet;
        this.updateChildrenNodes();
    }

    private _csDataDiffer?: IterableDiffer<T>;

    override ngAfterContentInit() {
        this._csDataDiffer = this._differs.find([]).create(this._tree.trackBy);
        this._tree
            ._getDirectChildren(this.data)
            .pipe(takeUntil(this._destroyed))
            .subscribe(result => this.updateChildrenNodes(result));
    }

    /**
     *
     */
    constructor() {
        super();
        effect(() => {
            this._treeFeatures._renderVersion();
            this.updateChildrenNodes();
        });
    }

    protected override updateChildrenNodes(children?: T[]): void {
        if (children) {
            this._children = children;
        }
        if (this._nodeOutlet && this._children) {
            const viewContainer = this._nodeOutlet.viewContainer;
            this._tree.renderNodeChanges(this._children, this._csDataDiffer, viewContainer, this._data);
        } else {
            // Reset the data differ if there's no children nodes displayed
            this._csDataDiffer?.diff([]);
        }
    }

    /** Clear the children dataNodes. */
    protected override _clear(): void {
        if (this._nodeOutlet) {
            this._nodeOutlet.viewContainer.clear();
            this._csDataDiffer?.diff([]);
        }
    }

    override get isExpanded(): boolean {
        const expanded = super.isExpanded;
        this._isExpandedSignal.set(expanded);
        return expanded;
    }
}
