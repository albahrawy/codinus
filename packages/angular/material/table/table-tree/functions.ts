import { CSTreeNodeItem, TreeNodeMetadata } from "./types";

export function createProxy<T extends object>(item: T, handler: ProxyHandler<T>): CSTreeNodeItem<T> {
    return new Proxy(item, handler) as CSTreeNodeItem<T>;
}

export function createProxyHandler<T extends object>(metaData: Map<T, TreeNodeMetadata<T>>): ProxyHandler<T> {
    return {
        get(target, prop) {
            if (prop === '_target') return target;
            const meta = metaData.get(target);
            switch (prop) {
                case 'treeLevel':
                    return meta?.treeLevel;
                case 'expanded':
                    return meta?.expanded ?? false;
                case 'expandable':
                    return meta?.expandable ?? false;
                case 'treeChildren':
                    return meta?.treeChildren ?? [];
                case 'parent':
                    return meta?.parent;
                default:
                    return target[prop as keyof typeof target];
            }
        },
        set(target, prop, value) {
            if (['treeLevel', 'expanded', 'expandable', 'treeChildren', 'parent'].includes(prop as string)) {
                throw new Error(`${prop as string} is read-only`);
            }
            target[prop as keyof typeof target] = value;
            return true;
        }
    }
};