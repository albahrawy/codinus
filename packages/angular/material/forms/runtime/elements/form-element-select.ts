import { Component } from '@angular/core';
import { IAction } from '@codinus/types';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { DataSourceFunc, ICSValueChangeArgs } from '@ngx-codinus/core/data';
import { CSListChangeArgs, CSSelect } from '@ngx-codinus/material/drop-down';
import { CSFormElementBindingBase } from '../cs-element-base/form-element-binding-base';
import { ELEMENT_IMPORTS } from './_internal';
import { ICSRuntimeFormFieldSelect } from './_types';

@Component({
    selector: 'cs-runtime-form-element-select',
    template: `
            <cs-select 
                [multiple]="config().multiple" [allowClear]="config().allowClear" 
                [showTitle]="config().showTitle" [showSearch]="config().showSearch"
                [stickySelected]="config().stickySelected" [iconType]="config().iconType"
                [selectOnlyByCheckBox]="config().selectOnlyByCheckBox"
                [optionHeight]="config().optionHeight" [dataSource]="_dataSource()" 
                [disableMember]="disableMember()" [displayMember]="displayMember()" 
                [valueMember]="valueMember()" [iconMember]="iconMember()" 
                [iconType]="config().iconType" [showIndex]="config().showIndex" [panelWidth]="config().panelWidth"
                [panelClass]="config().panelClass" [required]="!!config().required" [maxHeight]="config().maxHeight" 
                [overlayPanelClass]="config().overlayPanelClass" [moreText]="(config().moreText|csTranslate)()" 
                [moreSingleText]="(config().moreSingleText|csTranslate)()" [displayedTitleCount]="config().displayedTitleCount" 
                [csFormControlName]="config().dataKey" [defaultValue]="defaultValue()" 
                [asyncValidators]="asyncValidator()" [validators]="validator()" 
                (selectionChange)="_selectionChange()?.($event)" (valueChange)="_valueChange()?.($event)">
            </cs-select>
    `,
    imports: [...ELEMENT_IMPORTS, CSSelect, CSTranslatePipe],
})

export class CSFormElementSelect extends CSFormElementBindingBase<ICSRuntimeFormFieldSelect> {
    protected _selectionChange = this.signalFunctionOf<IAction<CSListChangeArgs<unknown, unknown>>>('selectionChange');
    protected _valueChange = this.signalFunctionOf<IAction<ICSValueChangeArgs<unknown>>>('valueChange');
    protected _dataSource = this.signalFromFunctionOrConfig("dataSource") as DataSourceFunc<unknown>;
    protected readonly valueMember = this.signalItemGetter<unknown>('valueMember');
}