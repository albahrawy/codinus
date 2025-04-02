import { Component } from '@angular/core';
import { IAction } from '@codinus/types';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { DataSourceFunc, ICSValueChangeArgs } from '@ngx-codinus/core/data';
import { CSListChangeArgs, CSSelectGrid } from '@ngx-codinus/material/drop-down';
import { SelectPredicate } from '@ngx-codinus/material/table';
import { CSFormElementBindingBase } from '../cs-element-base/form-element-binding-base';
import { ELEMENT_IMPORTS } from './_internal';
import { ICSRuntimeFormFieldSelectGrid } from './_types';

@Component({
    selector: 'cs-runtime-form-element-select-grid',
    template: `
            <cs-select-grid 
                [multiple]="config().multiple" [allowClear]="config().allowClear" 
                [optionHeight]="config().optionHeight" [dataSource]="_dataSource()" 
                [disableMember]="disableMember()" [displayMember]="displayMember()" 
                [valueMember]="valueMember()" [iconMember]="iconMember()" 
                [iconType]="config().iconType" [showHeader]="config().showHeader"[showFilter]="config().showFilter"
                [showFooter]="config().showFooter"  [stickyHeader]="config().stickyHeader"  [stickyFilter]="config().stickyFilter" 
                [stickyFooter]="config().stickyFooter" 
                [sortable]="config().sortable" [showIndex]="config().showIndex" [panelWidth]="config().panelWidth"
                [panelClass]="config().panelClass" [required]="!!config().required" [maxHeight]="config().maxHeight" 
                [overlayPanelClass]="config().overlayPanelClass" [moreText]="(config().moreText|csTranslate)()" 
                [moreSingleText]="(config().moreSingleText|csTranslate)()" [displayedTitleCount]="config().displayedTitleCount" 
                 [columns]="config().columns" [noDataText]="config().noDataText" [selectionPredicate]="_selectionPredicate()"
                [csFormControlName]="config().dataKey" [defaultValue]="defaultValue()" 
                [asyncValidators]="asyncValidator()" [validators]="validator()" 
                (selectionChange)="_selectionChange()?.($event)" (valueChange)="_valueChange()?.($event)">
            </cs-select-grid>
    `,
    imports: [...ELEMENT_IMPORTS, CSSelectGrid, CSTranslatePipe],
})

export class CSFormElementSelectGrid extends CSFormElementBindingBase<ICSRuntimeFormFieldSelectGrid> {

    protected _selectionChange = this.signalFunctionOf<IAction<CSListChangeArgs<unknown, unknown>>>('SelectionChange');
    protected _valueChange = this.signalFunctionOf<IAction<ICSValueChangeArgs<unknown>>>('ValueChange');
    protected _selectionPredicate = this.signalFunctionOf<SelectPredicate<unknown, unknown>>('SelectionPredicate');
    protected _dataSource = this.signalFromFunctionOrConfig("dataSource") as DataSourceFunc<unknown>;
    protected readonly valueMember = this.signalItemGetter<unknown>('valueMember');

}