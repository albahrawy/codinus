import { computed, Directive, input } from '@angular/core';
import { IFunc, Nullable } from '@codinus/types';
import { CSTreeFeaturesBase } from './cs-tree-features-base';
import { CODINUS_TREE_FEATURES } from './cs-types';
import { CsTreeBindingHandler } from './handlers/binding';
import { CsTreeObjectHandler } from './handlers/object';
import { CS_TREE_SELECTOR } from './internal';

@Directive({
    selector: CS_TREE_SELECTOR,
    exportAs: 'csTree',
    providers: [{ provide: CODINUS_TREE_FEATURES, useExisting: CSTreeFeatures }]
})
export class CSTreeFeatures<TNode> extends CSTreeFeaturesBase<TNode> {


    csChildrenAccessor = input<IFunc<TNode, TNode[] | null>>();
    parentKey = input<string>();
    nodeKey = input<string>();

    protected override _treeOperationHandler = computed(() => {
        if (this.csChildrenAccessor())
            return new CsTreeObjectHandler(this._csDataManager, this);
        else if (this.parentKey() && this.nodeKey())
            return new CsTreeBindingHandler(this._csDataManager, this);
        else
            return null;
    });

    readonly _isRecordPartOfData = (data: readonly TNode[], record: Nullable<TNode>) => {
        const checker = this._treeOperationHandler()?._isRecordPartOfData;
        if (checker)
            return checker(data, record);
        return this._csDataManager.DefaultIsRecordPartOfData(data, record);
    };

    readonly _dataRemoveHandler = (rows: TNode[]) => {
        const handler = this._treeOperationHandler()?._dataRemoveHandler;
        if (handler)
            return handler(rows);
        return this._csDataManager.DefaultRemoveHandler(rows);
    };
}