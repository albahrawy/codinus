import { NgModule } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import {
    CSTreeActionArea, CSTreeActionAreaHandler, CSTreeActionTopBar,
    CSTreeNodeHoverBar, CSTreeNodeHoverBarComponent
} from './cs-tree-actions';
import { CSTreeFeatures } from './cs-tree-features';
import { CSTreeFormInput } from './cs-tree-form-control';
import { CSTreeNode, CSTreeNodeBody } from './cs-tree-node';

export * from './cs-tree-actions';
export * from './cs-tree-features';
export * from './cs-tree-form-control';
export * from './cs-tree-node';
export * from './cs-types';



const TREE_IMPORTS = [
    MatTreeModule, CSTreeFeatures, CSTreeNode, CSTreeNodeBody, CSTreeActionArea,
    CSTreeActionAreaHandler, CSTreeNodeHoverBar, CSTreeFormInput, CSTreeActionTopBar, CSTreeNodeHoverBarComponent
];

@NgModule({
    imports: TREE_IMPORTS,
    exports: TREE_IMPORTS,
})
export class CodinusTreeModule { }