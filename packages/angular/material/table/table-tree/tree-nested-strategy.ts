/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createProxy } from "./functions";
import { CSTreeNodeItem, ITableNestedTreeHandler, ITreeStrategy } from "./types";

// Nested Data Strategy
export class NestedTreeStrategy<TData extends object> implements ITreeStrategy<TData> {

    constructor(private handler: ITableNestedTreeHandler<TData>) { }

    reset() {
        /** */
    }

    createProxies(data: TData[]): void {
        const process = (item: TData) => {
            if (!this.handler._proxyMap.has(item)) {
                const proxy = createProxy(item, this.handler._proxyHandler);
                this.handler._proxyMap.set(item, proxy);
                this.handler._nodeMetadata.set(item, {
                    treeLevel: 0,
                    expandable: false,
                    treeChildren: [],
                    expanded: false,
                    parent: null
                });

                const children = this.handler.childrenAccessor?.(item) || [];
                children.forEach(child => process(child));
            }
        };

        data.forEach(item => process(item));
    }

    buildHierarchy(data: TData[]): CSTreeNodeItem<TData>[] {
        return data.map(item => this.processNode(item, 0, null));
    }

    private processNode(
        item: TData,
        level: number,
        parentProxy: CSTreeNodeItem<TData> | null
    ) {
        const meta = this.handler._nodeMetadata.get(item)!;
        const children = this.handler.childrenAccessor?.(item) || [];
        const itemProxy = this.handler._proxyMap.get(item)!; // Get once per node

        meta.treeLevel = level;
        meta.expandable = children.length > 0;
        meta.parent = parentProxy;

        meta.treeChildren = children.map(child => {
            const childProxy = this.handler._proxyMap.get(child)!;
            this.processNode(child, level + 1, itemProxy); // Reuse itemProxy
            return childProxy;
        });

        return itemProxy;
    }
}
