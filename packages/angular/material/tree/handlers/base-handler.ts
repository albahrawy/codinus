import { CSDataManager } from "@ngx-codinus/core/data";
import { CSTreeFeatures } from "../cs-tree-features";
import { Nullable } from "@codinus/types";
import { computed } from "@angular/core";

export abstract class CsTreeBaseHandler<TNode> {
    constructor(protected _csDataManager: CSDataManager<TNode>, protected csTree: CSTreeFeatures<TNode>) {
    }

    private _cached = new Map<TNode, TNode[]>();

    abstract nodesToShow: () => TNode[];
    abstract getChildrenFromNode(node: TNode): TNode[];
    abstract buildRelationMap(data: TNode[], map: Map<TNode, TNode | null>): void;
    abstract add(row?: TNode | TNode[], parent?: Nullable<TNode>, setCurrent?: boolean, autoScroll?: boolean): TNode[];
    abstract _dataRemoveHandler: (rows: TNode[]) => Nullable<TNode>;
    _isRecordPartOfData?: (data: readonly TNode[], record: Nullable<TNode>) => boolean;


    getChildrenFromCacheOrNode(node: TNode): TNode[] {
        if (this._cached.has(node))
            return this._cached.get(node) ?? [];
        const nodeChildren = this.getChildrenFromNode(node);
        this._cached.set(node, nodeChildren);
        return nodeChildren;
    }

    relationMap = computed(() => {
        const map = new Map<TNode, TNode | null>();
        this.buildRelationMap(this._csDataManager.dataTracker().data, map);
        return map;
    });

    mergeFilteredNodes(data: readonly TNode[], result: Set<TNode>): TNode[] {
        return [...result];
    }

    clearCache() {
        this._cached.clear();
    }
}