import { effect, signal } from "@angular/core";
import { arraySort } from "@codinus/js-extensions";
import { IFunc, Nullable } from "@codinus/types";
import { CSDataSourceBase } from "@ngx-codinus/core/data";
import { Observable } from "rxjs";
import { createProxyHandler } from "./functions";
import { FlatTreeStrategy } from "./tree-flat-strategy";
import { CSTreeNodeItem, ITreeStrategy, TreeNodeMetadata } from "./types";
import { NestedTreeStrategy } from "./tree-nested-strategy";

export class CSTableTreeDataSource<TData extends object, TKey = unknown> extends CSDataSourceBase<TData, CSTreeNodeItem<TData>> {

    private _treeStrategy?: ITreeStrategy<TData> | null;

    _proxyMap = new Map<TData, CSTreeNodeItem<TData>>();
    _nodeMetadata = new Map<TData, TreeNodeMetadata<TData>>();
    _proxyHandler: ProxyHandler<TData> = createProxyHandler(this._nodeMetadata);

    private _filteredSet = new Set<CSTreeNodeItem<TData>>();
    private _hasFilter = false;

    // private readonly _proxyHandler: ProxyHandler<TData>;
    private _keyGetter = signal<Nullable<IFunc<TData, TKey>>>(null);
    private _parentKeyGetter = signal<Nullable<IFunc<TData, Nullable<TKey>>>>(null);
    private _childrenAccessor = signal<Nullable<IFunc<TData, TData[] | null>>>(null);

    get keyGetter() { return this._keyGetter(); }
    set keyGetter(getter: Nullable<IFunc<TData, TKey>>) {
        this._keyGetter.set(getter);
    }

    get parentKeyGetter() { return this._parentKeyGetter(); }
    set parentKeyGetter(getter: Nullable<IFunc<TData, Nullable<TKey>>>) {
        this._parentKeyGetter.set(getter);
    }

    get childrenAccessor() { return this._childrenAccessor(); }
    set childrenAccessor(accessor: Nullable<IFunc<TData, TData[] | null>>) {
        this._childrenAccessor.set(accessor);
    }

    constructor(initialiData?: TData[] | Observable<TData[]>) {
        super(initialiData);

        effect(() => {
            if (typeof this._childrenAccessor() === 'function')
                this._treeStrategy = new NestedTreeStrategy(this);
            else if (typeof this._keyGetter() === 'function' && typeof this._parentKeyGetter() === 'function')
                this._treeStrategy = new FlatTreeStrategy<TData, TKey>(this);
            else
                this._treeStrategy = null;

            this.notifyChanged();
        });
    }

    expandNode(item: CSTreeNodeItem<TData>) {
        const meta = this._nodeMetadata.get(item._target);
        if (meta && meta.expandable && !meta.expanded) {
            meta.expanded = true;
            this.refresh();
        }
    }

    collapseNode(item: CSTreeNodeItem<TData>) {
        const meta = this._nodeMetadata.get(item._target);
        if (meta && meta.expandable && meta.expanded) {
            meta.expanded = false;
            this.refresh();
        }
    }

    toggleNode(item: CSTreeNodeItem<TData>) {
        const meta = this._nodeMetadata.get(item._target);
        if (meta?.expandable) {
            meta.expanded = !meta.expanded;
            this.refresh();
        }
    }

    protected override transformData(data: TData[]): CSTreeNodeItem<TData>[] {
        this.resetMaps();
        if (this._treeStrategy == null)
            return [];
        this._treeStrategy.createProxies(data);
        return this._treeStrategy.buildHierarchy(data);
    }

    protected override _sortDataCore(data: CSTreeNodeItem<TData>[], active?: string, direction?: 1 | -1 | 0 | null): CSTreeNodeItem<TData>[] {
        const sorted: CSTreeNodeItem<TData>[] = [];
        const sortFn = (items: CSTreeNodeItem<TData>[]) =>
            active && direction
                ? arraySort(items, item => this.sortingDataAccessor(item, active), direction)
                : items;

        const traverse = (items: CSTreeNodeItem<TData>[]) => {
            sortFn(items).forEach(item => {
                if (!this._hasFilter || this._filteredSet.has(item)) {
                    sorted.push(item);
                }
                if (item.expanded) {
                    traverse(item.treeChildren);
                }
            });
        };

        traverse(data);
        return sorted;
    }

    protected override _filterDataCore(data: CSTreeNodeItem<TData>[], filterPredicate: (data: CSTreeNodeItem<TData>) => boolean): CSTreeNodeItem<TData>[] {
        this.collectFilteredItems(data, filterPredicate);
        return data;
    }

    private collectFilteredItems(items: CSTreeNodeItem<TData>[], filterPredicate: (data: CSTreeNodeItem<TData>) => boolean) {
        items.forEach(item => {
            if (filterPredicate(item)) {
                this._filteredSet.add(item);
                this.collectParentItems(item);
            }
            this.collectFilteredItems(item.treeChildren, filterPredicate);
        });
    }

    protected override _filterData(data: CSTreeNodeItem<TData>[], filterPredicate: ((data: CSTreeNodeItem<TData>) => boolean) | null): CSTreeNodeItem<TData>[] {
        this._filteredSet.clear();
        this._hasFilter = !!filterPredicate;
        return super._filterData(data, filterPredicate);
    }

    protected override setAggregatedData(data: CSTreeNodeItem<TData>[]): void {
        this.dataAggregator.setData(this._hasFilter ? data : this.data as unknown as CSTreeNodeItem<TData>[]);
    }

    private resetMaps() {
        this._nodeMetadata.clear();
        this._proxyMap.clear();
        this._treeStrategy?.reset();
    }

    private collectParentItems(item: CSTreeNodeItem<TData>) {
        let currentParent = item.parent;
        while (currentParent) {
            this._filteredSet.add(currentParent);
            currentParent = currentParent.parent;
        }
    }
}