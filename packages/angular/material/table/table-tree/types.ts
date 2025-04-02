import { Nullable, IFunc } from "@codinus/types";

export type TreeNodeMetadata<T> = {
    treeLevel: number;
    expandable: boolean;
    treeChildren: CSTreeNodeItem<T>[];
    expanded: boolean;
    parent: CSTreeNodeItem<T> | null;
};

export type CSTreeNodeItem<T> = T & { _target: T } & TreeNodeMetadata<T>;

// Tree Strategy Interface
export interface ITreeStrategy<TData extends object> {
    createProxies(data: TData[]): void;
    buildHierarchy(data: TData[]): CSTreeNodeItem<TData>[];
    reset(): void;
}

export interface ITableTreeHandlerBase<TData extends object> {
    _proxyMap: Map<TData, CSTreeNodeItem<TData>>;
    _nodeMetadata: Map<TData, TreeNodeMetadata<TData>>;
    _proxyHandler: ProxyHandler<TData>;
}

export interface ITableFlatTreeHandler<TData extends object, TKey> extends ITableTreeHandlerBase<TData> {
    readonly keyGetter: Nullable<IFunc<TData, TKey>>
    readonly parentKeyGetter: Nullable<IFunc<TData, Nullable<TKey>>>;
}

export interface ITableNestedTreeHandler<TData extends object> extends ITableTreeHandlerBase<TData> {
    childrenAccessor: Nullable<IFunc<TData, TData[] | null>>;

}