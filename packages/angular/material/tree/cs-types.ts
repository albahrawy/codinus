import { InjectionToken, OutputEmitterRef, TemplateRef } from "@angular/core";
import { IFunc, Nullable } from "@codinus/types";
import { CSDataSource } from "@ngx-codinus/core/data";
import { ConextMenuOpeningArgs } from "@ngx-codinus/material/context-menu";
import { CSTreeActionAreaContext } from "./cs-tree-actions/cs-tree-action-area";

export const CODINUS_TREE_FEATURES = new InjectionToken<ICSTreeFeatures>('codinus_tree_features');
export const CODINUS_TREE_NODE_BODY = new InjectionToken<ICSTreeNodeBody>('codinus_tree_node_body');

export type TreeNodeSearchResult<TNode> = { node?: Nullable<TNode>, parents?: Nullable<TNode[]> };
export type ChildrenAllowedListFn<TNode> = IFunc<TNode | null, Array<INodeAddMenuItem<TNode>> | null | boolean> | undefined | boolean | null;

export interface ICSTreeFeatures<TNode = unknown> extends ICSTreeActions<TNode> {
    _handler: ICSTreeFeaturesHandler<TNode>;
    /** @internal */
    _setDataSource(dataSource: CSDataSource<TNode | null>): void;
    /** @internal */
    _context: CSTreeActionAreaContext<TNode>;
    /** @internal */
    _renderVersion: () => number;
    allowedChildTypes: () => ChildrenAllowedListFn<TNode>;
    _nodeClicked(nodeData: TNode): void;
    _nodeToolBarTemplate(): Nullable<TemplateRef<unknown>>;
    showIcon: () => boolean;
    setCurrentItem(item: Nullable<TNode>, autoScroll: boolean): void;
    hasCurrent: () => boolean;
    getData(): TNode[];
    disabled: boolean;
    hasChild: (node: TNode) => boolean;
    canRemove: (node: TNode) => boolean;
    readonly conextMenuOpening: OutputEmitterRef<ConextMenuOpeningArgs>;
    optionHeight(): number;
}

export interface INodeChildInfo<TNode> {
    child: TNode;
    text: string;
    icon?: string;
}

export type INodeAddMenuItem<TNode> = INodeChildInfo<TNode> | 'separator';

export interface ICSTreeFeaturesHandler<TNode = unknown> {
    displayMember: () => IFunc<TNode, string>;
    iconMember?: () => IFunc<TNode, string> | null;
    isCurrent(nodeData: TNode): boolean;
    getData(): TNode[];
}

export interface ICSTreeActions<TNode> {
    add(row?: TNode | TNode[], parent?: TNode, setCurrent?: boolean, autoScroll?: boolean): TNode[];
    addToCurrent(row?: TNode | TNode[], setCurrent?: boolean, autoScroll?: boolean): TNode[];
    remove(row?: TNode | TNode[] | null, setCurrent?: boolean): void;
    setFilter(value: Nullable<string>): void;
}

export interface ICSTreeNodeBody<TNode = unknown> {
    readonly nodeData: TNode | null;
    refresh(): void;
}