import {
    afterNextRender, booleanAttribute, computed, contentChild, contentChildren,
    Directive, effect, ElementRef, inject, Injector, Input, input, model, output, Renderer2, signal
} from '@angular/core';
import { MatTree } from '@angular/material/tree';
import { toNumber } from '@codinus/js-extensions';
import { IFunc, Nullable, ValueGetter } from '@codinus/types';
import { CSDataManager, CSDataSource, CSStringFilterPredicate } from '@ngx-codinus/core/data';
import { ConextMenuOpeningArgs } from '@ngx-codinus/material/context-menu';
import { CSTreeActionArea, CSTreeActionAreaContext, CSTreeNodeHoverBar } from './cs-tree-actions/cs-tree-action-area';
import { ChildrenAllowedListFn, CODINUS_TREE_NODE_BODY, ICSTreeFeatures } from './cs-types';
import { CsTreeBaseHandler } from './handlers/base-handler';
import { signalVersion } from '@ngx-codinus/core/shared';

@Directive({
    host: {
        'class': 'cs-tree',
        '[style.--mat-tree-node-min-height.px]': 'optionHeight()'
    }
})
export abstract class CSTreeFeaturesBase<TNode> implements ICSTreeFeatures<TNode> {

    private injector = inject(Injector);
    private _renderer = inject(Renderer2);
    private _elementRef = inject(ElementRef);

    protected tree = inject(MatTree);

    private _nodes = contentChildren(CODINUS_TREE_NODE_BODY);
    private _actionArea = contentChild(CSTreeActionArea);
    private _nodebar = contentChild(CSTreeNodeHoverBar);

    _nodeToolBarTemplate = computed(() => this._nodebar()?.template);

    protected readonly _csDataManager = new CSDataManager<TNode>(this, () => this.csDataSource);
    readonly _hasfilterStrategy = signal(true).asReadonly();
    readonly _handler = this._csDataManager;
    private readonly _dataVersion = signalVersion();

    readonly conextMenuOpening = output<ConextMenuOpeningArgs>();
    readonly nodeRemoved = output<TNode | TNode[]>();
    readonly nodeAdded = output<TNode | TNode[]>();
    readonly nodeAdding = output();
    readonly nodeRemoving = output<boolean>();

    readonly _renderVersion = computed(() => Math.max(this._dataVersion() + this._csDataManager._dataVersion()));

    displayMember = input<ValueGetter<TNode>>();
    iconMember = input<ValueGetter<TNode>>();
    csDataSource = model<CSDataSource<TNode>>();
    showIcon = input(false, { transform: booleanAttribute });
    activateFirstItem = input(false, { transform: booleanAttribute });
    readOnly = input(false, { transform: booleanAttribute });
    isRemoveAllowed = input<IFunc<TNode, boolean>>();
    allowedChildTypes = input<ChildrenAllowedListFn<TNode>>();
    optionHeight = input(48, { transform: (v: Nullable<number | string>) => v ? toNumber(v) : 48 });

    canRemove = (node: TNode) => this.isRemoveAllowed()?.(node) ?? true;

    @Input({ transform: booleanAttribute }) disabled = false;

    readonly currentChanged = output<Nullable<TNode>>();
    protected abstract _treeOperationHandler: () => CsTreeBaseHandler<TNode> | null;


    hasChild = (node: TNode) => this.getChildrenFromCacheOrNode(node).length > 0;

    constructor() {

        this.tree.childrenAccessor = node => this.getChildrenFromCacheOrNode(node);

        effect(() => {
            this.tree.dataSource = this._treeOperationHandler()?.nodesToShow() ?? [];
        });

        effect(() => {
            const actionArea = this._actionArea();
            if (actionArea) {
                const el = this._elementRef.nativeElement;
                this._renderer.insertBefore(el.parentElement, actionArea.create(this._context).nativeElement, el);
            }
        });

        effect(() => {
            if (this._csDataManager.filterApplied()) {
                afterNextRender(() => this.tree.expandAll(), { injector: this.injector });
            }
        })
    }

    protected _relationMap = computed(() => this._treeOperationHandler()?.relationMap());

    hasCurrent = computed(() => this._csDataManager.currentItem() != null);

    /** @internal */
    _context = new CSTreeActionAreaContext(this);

    add(row?: TNode | TNode[], parent?: Nullable<TNode>, setCurrent?: boolean, autoScroll?: boolean): TNode[] {
        this.nodeAdding.emit();
        const rows = this._treeOperationHandler()?.add(row, parent, setCurrent, autoScroll);
        if (rows)
            this.nodeAdded.emit(rows);
        return this._csDataManager.getData();
    }

    addToCurrent(row?: TNode | TNode[] | undefined, setCurrent?: boolean, autoScroll?: boolean): TNode[] {
        return this.add(row, this._csDataManager.currentItem(), setCurrent, autoScroll);
    }

    /** @internal */
    _setDataSource(dataSource: CSDataSource<TNode>) {
        this.csDataSource.set(dataSource);
    }

    _nodeClicked(nodeData: TNode): void {
        this._csDataManager.setCurrent(nodeData);
    }

    _applyFilterStartegy(data: readonly TNode[], filter: Nullable<string>, predicate: CSStringFilterPredicate<TNode>): TNode[] {
        this.onFilterTrategyApplying();

        if (!filter)
            return [...data];

        const parents = this._relationMap();
        if (!parents)
            return [];

        const filteredKeys: TNode[] = [];
        for (const key of parents.keys()) {
            if (predicate(key, filter)) {
                filteredKeys.push(key);
            }
        }

        const result = new Set<TNode>();
        filteredKeys.forEach(n => collectAncestors(n, parents, result));

        return this._treeOperationHandler()?.mergeFilteredNodes(data, result) ?? [];
    }

    setCurrentItem(item: Nullable<TNode>, autoScroll = true) {
        this._csDataManager.setCurrent(item, autoScroll);
    }

    setFilter(value: Nullable<string>) {
        this._csDataManager.setFilter(value);
    }

    scrollToIndex(index: number, record?: TNode): void {
        if (!record)
            return;
        this.tree._keyManager.focusItem(index);
        const activeItemOfKeyManager = this.tree._keyManager.getActiveItem();
        if (activeItemOfKeyManager?.data === record)
            return;

        afterNextRender(() => {
            const _parents = this._relationMap();
            if (!_parents)
                return;
            let parent = _parents.get(record);
            while (parent) {
                this.tree.expand(parent);
                parent = _parents.get(parent);
            }
        }, { injector: this.injector });
    }

    remove(row?: TNode | TNode[] | null, setCurrent = true) {
        this.nodeRemoving.emit(true);
        if (this._csDataManager.remove(row, setCurrent) && row)
            this.nodeRemoved.emit(row);
        else
            this.nodeRemoving.emit(false);
    }

    getData() { return this._csDataManager.getData(false); }

    refreshItem(item: Nullable<TNode>): void {
        if (item)
            this._nodes().find(n => n.nodeData === item)?.refresh();
    }

    refresh() {
        this._dataVersion.refresh();
    }

    protected getChildrenFromCacheOrNode(node: TNode): TNode[] {
        return this._treeOperationHandler()?.getChildrenFromCacheOrNode(node) ?? [];
    }

    protected onFilterTrategyApplying() {
        return this._treeOperationHandler()?.clearCache();
    }
}

function collectAncestors<TNode>(key: TNode, parentMap: Map<TNode, TNode>, result: Set<TNode>) {
    let current: TNode | undefined = key;
    while (current) {
        result.add(current); // Add the current key to the list
        current = parentMap.get(current); // Move to the parent
    }
}