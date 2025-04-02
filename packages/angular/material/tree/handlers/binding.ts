import { computed } from "@angular/core";
import { arrayToMap, getValue, setValue } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { CsTreeBaseHandler } from "./base-handler";

export class CsTreeBindingHandler<TNode> extends CsTreeBaseHandler<TNode> {

    override nodesToShow = computed(() => {
        const filteredData = this._csDataManager.filteredData();
        return filteredData.filter(nd => this.getParentKeyValue(nd) == null);
    });

    override getChildrenFromNode(node: TNode): TNode[] {
        const parentKey = this.getNodeKeyValue(node);
        return parentKey
            ? this._csDataManager.filteredData().filter(cnd => parentKey === this.getParentKeyValue(cnd))
            : [];
    }

    override buildRelationMap(data: TNode[], map: Map<TNode, TNode | null>): void {
        const keyMap = arrayToMap(data, node => this.getNodeKeyValue(node), node => node);
        data.forEach(d => {
            const parentKey = this.getParentKeyValue(d);
            const parent = parentKey ? keyMap.get(parentKey) : null;
            map.set(d, parent ?? null);
        });
    }

    override add(row?: TNode | TNode[] | undefined, parent?: Nullable<TNode>, setCurrent?: boolean, autoScroll?: boolean): TNode[] {
        const parentkeyValue = parent ? this.getNodeKeyValue(parent) : null;
        const rows = Array.isArray(row) ? row : [row || {} as TNode];
        if (rows.length == 0)
            rows.push({} as TNode);

        const parentkey = this.csTree.parentKey();
        if (parentkey && parentkeyValue)
            rows.forEach(r => setValue(r, parentkey, parentkeyValue));

        this._csDataManager.add(row, setCurrent, autoScroll);
        return rows;
    }

    override _dataRemoveHandler = (rows: TNode[]) => {
        const rowsWithChildren = [...rows];
        rows.forEach(r => this._flattenChildrenDescendants(r, rowsWithChildren));
        const firstRemoved = rows[0];
        let newCurrent: TNode | null = null;
        let childIndex: number | null = null;
        let children: TNode[] | null = null;
        const parentNode = this.relationMap()?.get(firstRemoved);
        if (parentNode) {
            children = this.getChildrenFromNode(parentNode);
            childIndex = children.indexOf(firstRemoved);
            children.splice(childIndex, 1);
        }
        this._csDataManager.DefaultRemoveHandler(rowsWithChildren);
        if (children && childIndex) {
            newCurrent = children.at(Math.min(childIndex, children.length - 1)) ?? null;
        }
        return newCurrent ?? parentNode;
    }

    private _flattenChildrenDescendants(node: TNode, accumulated: TNode[]) {
        const children = this.getChildrenFromCacheOrNode(node);
        accumulated.push(...children);
        children.forEach(subNode => this._flattenChildrenDescendants(subNode, accumulated));
    }

    private getParentKeyValue(node: TNode) {
        const parentKey = this.csTree.parentKey();
        if (parentKey)
            return getValue<number | null>(node, parentKey);
        return null;
    }

    private getNodeKeyValue(node: TNode) {
        const nodeKey = this.csTree.nodeKey();
        if (nodeKey)
            return getValue<number | null>(node, nodeKey);
        return null;
    }

}