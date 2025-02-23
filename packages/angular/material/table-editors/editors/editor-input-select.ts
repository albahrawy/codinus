import { VIRTUAL_SCROLLABLE } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { IAction } from '@codinus/types';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { ICSValueChangeArgs } from '@ngx-codinus/core/data';
import { CSListChangeArgs, CSSelect } from '@ngx-codinus/material/drop-down';
import { CSTableEditorElementBase } from '@ngx-codinus/material/table';
import { ICSTableSelectEditorOptions } from '../shared/element-args-types';

@Component({
    selector: 'cs-table-editor-select',
    template: `
            <cs-select 
                [multiple]="options().multiple" [allowClear]="options().allowClear" 
                [showTitle]="options().showTitle" [showSearch]="options().showSearch"
                [stickySelected]="options().stickySelected" [iconType]="options().iconType"
                [selectOnlyByCheckBox]="options().selectOnlyByCheckBox"
                [optionHeight]="options().optionHeight" [dataSource]="_dataSource()" 
                [disableMember]="_disableMember()" [displayMember]="_displayMember()" 
                [valueMember]="_valueMember()" [iconMember]="_iconMember()" 
                [iconType]="options().iconType" [showIndex]="options().showIndex" [panelWidth]="options().panelWidth"
                [panelClass]="options().panelClass" [maxHeight]="options().maxHeight" 
                [overlayPanelClass]="options().overlayPanelClass" [moreText]="(options().moreText|csTranslate)()" 
                [moreSingleText]="(options().moreSingleText|csTranslate)()" (keydown.escape)="undo()" (keydown.enter)="commit()" 
                [displayedTitleCount]="options().displayedTitleCount" [(ngModel)]="bindingValue" (closed)="commit()"
                (selectionChange)="_selectionChange()?.($event)" (valueChange)="_valueChange()?.($event)"
                >
            </cs-select>
        `,
    imports: [MatInputModule, FormsModule, CSSelect, CSTranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: VIRTUAL_SCROLLABLE, useValue: null }]
})

export class CSTableEditorSelect extends CSTableEditorElementBase<unknown, ICSTableSelectEditorOptions> {

    private _selectElement = viewChild(CSSelect);
    protected readonly _displayMember = this.signalItemGetter<string>('displayMember');
    protected readonly _valueMember = this.signalItemGetter<unknown>('valueMember');
    protected readonly _disableMember = this.signalItemGetter<boolean>('disableMember');
    protected readonly _iconMember = this.signalItemGetter<string>('iconMember');
    protected readonly _dataSource = this.signalActionFromFunctionOrConfig("dataSource");
    protected _selectionChange = this.signalFunctionOf<IAction<CSListChangeArgs<unknown, unknown>>>('SelectionChange');
    protected _valueChange = this.signalFunctionOf<IAction<ICSValueChangeArgs<unknown>>>('ValueChange');

    override initialize(): void {
        super.initialize();
        setTimeout(() => {
            this._selectElement()?.focus();
            this._selectElement()?.open();
        }, 10);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatValue(value: any[]): string | null {
        const { trigger, more } = this._selectElement()?.getDisplayText(value) ?? {};
        return `${trigger} ${more}`
    }
}