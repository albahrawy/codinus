import { Directive, input } from "@angular/core";
import { IFunc, Nullable } from '@codinus/types';
import { CSMatFormFieldControl } from "@ngx-codinus/material/inputs";
import { CSTreeFeatures } from './cs-tree-features';
import { CSTreeFormInputBase } from './cs-tree-form-control-base';
import { CS_TREE_FORM_INPUT_SELECTOR } from "./internal";

@Directive({
    selector: CS_TREE_FORM_INPUT_SELECTOR,
    exportAs: 'csTreeInput',
    hostDirectives: [CSMatFormFieldControl, {
        directive: CSTreeFeatures,
        inputs: ['csChildrenAccessor', 'displayMember', 'iconMember', 'showIcon', 'activateFirstItem',
            'allowedChildTypes', 'isRemoveAllowed', 'optionHeight']
    }],
})
export class CSTreeFormInput<TNode = unknown> extends CSTreeFormInputBase<TNode> {
    csChildrenAccessor = input.required<IFunc<TNode, Nullable<TNode[]>>>();
}

// @Directive({
//     selector: `mat-tree:not([childrenAccessor]):not([dataSource]):not([csDataSource]):not([csTree])[parentKey][csTreeInput],
//                cdk-tree:not([childrenAccessor]):not([dataSource]):not([csDataSource]):not([csTree])[parentKey][csTreeInput]
//                `,
//     exportAs: 'csTreeInput',
//     hostDirectives: [CSMatFormFieldControl,
//         {
//             directive: CSTreeBidningFeatures,
//             inputs: ['parentKey', 'nodeKey', 'displayMember', 'iconMember', 'showIcon', 'activateFirstItem']
//         }
//     ],
// })
// export class CSTreeBindingFormInput<TNode = unknown> extends CSTreeFormInputBase<TNode> {
//     parentKey = input.required<string>();
//     nodeKey = input.required<string>();
// }