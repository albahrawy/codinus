const EXECLUDE_CDK_TREE = ':not([dataSource]):not([levelAccessor]):not([childrenAccessor])';
const BINDING_TREE = EXECLUDE_CDK_TREE + ':not([csChildrenAccessor])[parentkey][nodeKey]';
const OBJECT_TREE = EXECLUDE_CDK_TREE + ':not([parentkey]):not([nodeKey])[csChildrenAccessor]';
const CS_MAT_TREE_SELECTOR = `mat-tree${BINDING_TREE}[csTree], mat-tree${OBJECT_TREE}[csTree]`;
const CS_CDK_TREE_SELECTOR = `cdk-tree${BINDING_TREE}[csTree], cdk-tree${OBJECT_TREE}[csTree]`;
export const CS_TREE_SELECTOR = `${CS_MAT_TREE_SELECTOR}, ${CS_CDK_TREE_SELECTOR}`;
export const CS_TREE_FORM_INPUT_SELECTOR = `mat-tree${OBJECT_TREE}[csTreeInput], cdk-tree${OBJECT_TREE}[csTreeInput]`;