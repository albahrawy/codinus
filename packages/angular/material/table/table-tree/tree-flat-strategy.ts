/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createProxy } from "./functions";
import { CSTreeNodeItem, ITableFlatTreeHandler, ITreeStrategy } from "./types";

// Flat Data Strategy
export class FlatTreeStrategy<TData extends object, TKey> implements ITreeStrategy<TData> {

    private keyMap = new Map<TKey, TData>();

    constructor(private handler: ITableFlatTreeHandler<TData, TKey>) { }

    reset() {
        this.keyMap.clear();
    }

    createProxies(data: TData[]): void {
        const keyGetter = this.handler.keyGetter;
        data.forEach(item => {
            const key = keyGetter!(item);
            this.keyMap.set(key, item);

            const proxy = createProxy(item, this.handler._proxyHandler);
            this.handler._proxyMap.set(item, proxy);
            this.handler._nodeMetadata.set(item, {
                treeLevel: 0,
                expandable: false,
                treeChildren: [],
                expanded: false,
                parent: null
            });
        });
    }

    buildHierarchy(data: TData[]): CSTreeNodeItem<TData>[] {
        const parentMap = new Map<TData, TData[]>();
        const rootNodes: CSTreeNodeItem<TData>[] = [];

        const parentKeyGetter = this.handler.parentKeyGetter;
        // First pass: build parent-child relationships
        data.forEach(child => {
            const parentKey = parentKeyGetter!(child);
            if (parentKey == null) {
                // Collect root nodes immediately
                rootNodes.push(this.handler._proxyMap.get(child)!);
                return;
            }

            const parent = this.keyMap.get(parentKey);
            if (parent) {
                // Update parent map
                const children = parentMap.get(parent) || [];
                children.push(child);
                parentMap.set(parent, children);

                // Set child metadata
                const childMeta = this.handler._nodeMetadata.get(child)!;
                childMeta.parent = this.handler._proxyMap.get(parent)!;
            }
        });

         // Optimized BFS using queue pointers (O(1) shifts)
        const queue: [TData, number][] = rootNodes.map(proxy => [proxy._target, 0]);
        let head = 0;
        let tail = rootNodes.length;

        while (head < tail) {
            const [parent, level] = queue[head++]; // O(1) "shift" 
            const children = parentMap.get(parent) || [];
            const meta = this.handler._nodeMetadata.get(parent)!;

            meta.treeLevel = level;
            meta.expandable = children.length > 0;
            meta.treeChildren = children.map(child =>
                this.handler._proxyMap.get(child)! // Precomputed proxy
            );

            // Add children to queue
            for (const child of children) {
                queue[tail++] = [child, level + 1]; // O(1) "push"
            }
        }

        return rootNodes;
    }


}
