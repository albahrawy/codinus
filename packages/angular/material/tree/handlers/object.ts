import { computed } from "@angular/core";
import { removeFromArray } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { CsTreeBaseHandler } from "./base-handler";

export class CsTreeObjectHandler<TNode> extends CsTreeBaseHandler<TNode> {

    private _cachedFiltered: Set<TNode> | null = null;

    nodesToShow = computed(() => this._csDataManager.filteredData());

    readonly _dataRemoveHandler = (rows: TNode[]) => {
        const rootRows: TNode[] = [];
        let hasChanges = true;
        let parentNode: Nullable<TNode>;
        let newCurrent: TNode | null = null;
        rows.forEach(element => {
            parentNode = this.relationMap()?.get(element);
            if (parentNode) {
                let children = this.csTree.csChildrenAccessor()?.(parentNode);
                if (children) {
                    let removedIndex = removeFromArray(children, element);
                    if (this._csDataManager.filterApplied()) {
                        children = this.getChildrenFromCacheOrNode(parentNode);
                        removedIndex = removeFromArray(children, element);
                    }
                    newCurrent = children.at(Math.min(removedIndex, children.length - 1)) ?? parentNode;
                    hasChanges = true;
                }
            } else {
                rootRows.push(element);
            }
        });
        if (rootRows.length)
            return this._csDataManager.DefaultRemoveHandler(rootRows);
        else if (hasChanges) {
            this.csTree.refreshItem(parentNode);
            return newCurrent;
        }
        return null;
    }

    override readonly _isRecordPartOfData = (data: readonly TNode[], record: Nullable<TNode>) => {
        if (!record)
            return false;
        return this.relationMap()?.has(record);
    }

    override buildRelationMap(data: TNode[], map: Map<TNode, Nullable<TNode>>): void {
        data.forEach(d => {
            map.set(d, null);
            this._buildChildrenRelationMap(d, map);
        });
    }

    private _buildChildrenRelationMap(node: TNode, map: Map<TNode, Nullable<TNode>>) {
        const children = this.getChildrenFromNode(node);
        if (children.length)
            children.forEach(nd => {
                map.set(nd, node);
                this._buildChildrenRelationMap(nd, map);
            });
    }

    override getChildrenFromNode(node: TNode): TNode[] {
        const children = this.csTree.csChildrenAccessor()?.(node) ?? [];
        if (this._cachedFiltered == null)
            return children;
        return children.filter(c => this._cachedFiltered?.has(c));
    }

    override clearCache(): void {
        super.clearCache();
        this._cachedFiltered = null;
    }

    override mergeFilteredNodes(data: readonly TNode[], result: Set<TNode>): TNode[] {
        this._cachedFiltered = result;
        return data.filter(d => result.has(d));
    }

    add(row?: TNode | TNode[], parent?: TNode, setCurrent = true, autoScroll = true): TNode[] {
        if (!parent)
            return this._csDataManager.add(row, setCurrent, autoScroll);

        const rows = Array.isArray(row) ? row : [row || {} as TNode];
        const children = this.csTree.csChildrenAccessor()?.(parent);
        if (children) {
            children.push(...rows);
            this._csDataManager.reDraw();
            this.csTree.refreshItem(parent);
            if (setCurrent)
                this._csDataManager.setCurrent(rows[0], autoScroll);
        }
        return this._csDataManager.getData();
    }
}