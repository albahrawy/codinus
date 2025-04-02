import { ConnectedPosition } from "@angular/cdk/overlay";
import { CdkTreeNode, CdkTreeNodeOutletContext } from "@angular/cdk/tree";
import { computed, Directive, effect, inject, ViewContainerRef } from "@angular/core";
import { isArray } from "@codinus/js-extensions";
import { signalPropertyOf, signalVersion } from "@ngx-codinus/core/shared";
import { CSHoverOverlay } from "@ngx-codinus/material/overlays";
import { CODINUS_TREE_FEATURES } from "./cs-types";

const CONTXT_VIEW_INDEX = 8;

interface ILView {
    _hostLView: Array<unknown>;
}

const NodeActionPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'center', overlayX: 'end', overlayY: 'center' },
];


@Directive()

export abstract class CSCdkTreeNodeBodyBase<TNode> {
    protected _treeFeatures = inject(CODINUS_TREE_FEATURES);
    protected _cdkTreeNode = inject(CdkTreeNode, { self: true });

    private _viewContainer = inject(ViewContainerRef);
    private _nodeVersion = signalVersion();

    private _context = (this._viewContainer as unknown as ILView)._hostLView[CONTXT_VIEW_INDEX] as CdkTreeNodeOutletContext<TNode>;
    private _nodeData = signalPropertyOf(this._context, '$implicit');

    protected get nodeContext() { return this._context; }

    protected _renderVersion = computed(() => this._nodeVersion() + this._treeFeatures._renderVersion());

    protected _displayText = computed(() => {
        this._renderVersion();
        return this._treeFeatures._handler.displayMember()(this._nodeData());
    });
    protected _isCurrent = computed(() => this._treeFeatures._handler.isCurrent(this._nodeData()));

    protected _icon = computed(() => {
        this._renderVersion();
        return this._treeFeatures._handler.iconMember?.()?.(this._nodeData());
    });

    protected _showIcon = computed(() => this._treeFeatures.showIcon());

    protected isExpandable = computed(() => {
        this._renderVersion();
        return this._treeFeatures.hasChild(this._nodeData());
    });

    protected canRemove = computed(() => {
        this._renderVersion();
        return this._treeFeatures.canRemove(this._nodeData());
    });

    private _allowedChildTypes = computed(() => {
        this._renderVersion();
        const allowedChildTypesFn = this._treeFeatures.allowedChildTypes();
        if (typeof allowedChildTypesFn === 'function')
            return allowedChildTypesFn(this._nodeData());
        else if (typeof allowedChildTypesFn === 'boolean')
            return allowedChildTypesFn;

        return null;
    });

    private _addChildType = computed(() => {
        const types = this._allowedChildTypes();
        return typeof types === 'boolean'
            ? types === true
                ? 'default'
                : null
            : isArray(types) && types.length
                ? 'list'
                : null;
    }
    );

    private _allowedTypes = computed(() => {
        const types = this._allowedChildTypes();
        return Array.isArray(types) ? types : null;
    });


    /**
     *
     */
    constructor() {
        const toolbarTemplate = this._treeFeatures._nodeToolBarTemplate();
        if (toolbarTemplate) {
            const nodeHoverOverlay = new CSHoverOverlay();
            nodeHoverOverlay.effectedElement.set('.cs-tree-node-body');
            nodeHoverOverlay.csHoverOverlay.set(toolbarTemplate);
            nodeHoverOverlay.setOverlayContextGenerator(() => ({
                ...this._treeFeatures._context, args: {
                    nodeData: this.nodeData,
                    canRemove: this.canRemove(),
                    canAddType: this._addChildType(),
                    allowedTypes: this._allowedTypes(),
                    hoverOverlay: nodeHoverOverlay
                }
            }));
            nodeHoverOverlay.overlayPositions.set(NodeActionPositions);
        }

        effect(() => this._cdkTreeNode.typeaheadLabel = this._displayText());
    }

    get nodeData(): TNode | null { return this._nodeData() ?? null; }

    protected _nodeClicked(event: Event) {
        event.preventDefault();
        this._treeFeatures._nodeClicked(this.nodeData);
    }

    refresh() {
        this._nodeVersion.refresh();
    }
}