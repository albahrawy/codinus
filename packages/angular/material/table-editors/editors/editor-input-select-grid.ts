import { VIRTUAL_SCROLLABLE } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { IAction } from '@codinus/types';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { ICSValueChangeArgs } from '@ngx-codinus/core/data';
import { CSListChangeArgs, CSSelectGrid } from '@ngx-codinus/material/drop-down';
import { CSTableEditorElementBase, SelectPredicate } from '@ngx-codinus/material/table';
import { ICSTableSelectGridEditorOptions } from '../shared/element-args-types';

@Component({
    selector: 'cs-table-editor-select-grid',
    template: `
            <cs-select-grid 
                [multiple]="options().multiple" [allowClear]="options().allowClear" 
                [showHeader]="options().showHeader" [showFilter]="options().showFilter" [showFooter]="options().showFooter"
                [stickyHeader]="options().stickyHeader" [stickyFilter]="options().stickyFilter" 
                [stickyFooter]="options().stickyFooter" [columns]="options().columns" [noDataText]="options().noDataText"
                [optionHeight]="options().optionHeight" [dataSource]="_dataSource()" [sortable]="options().sortable"
                [disableMember]="_disableMember()" [displayMember]="_displayMember()" 
                [valueMember]="_valueMember()" [iconMember]="_iconMember()" 
                [iconType]="options().iconType" [showIndex]="options().showIndex" [panelWidth]="options().panelWidth"
                [panelClass]="options().panelClass" [maxHeight]="options().maxHeight" 
                [overlayPanelClass]="options().overlayPanelClass" [moreText]="(options().moreText|csTranslate)()" 
                [moreSingleText]="(options().moreSingleText|csTranslate)()" (keydown.escape)="undo()" (keydown.enter)="commit()" 
                [displayedTitleCount]="options().displayedTitleCount" [(ngModel)]="bindingValue" (closed)="commit()"
                (selectionChange)="_selectionChange()?.($event)" (valueChange)="_valueChange()?.($event)"
                [selectionPredicate]="_selectionPredicate()"
                >
            </cs-select-grid>
        `,
    imports: [MatInputModule, FormsModule, CSSelectGrid, CSTranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: VIRTUAL_SCROLLABLE, useValue: null }]
})

export class CSTableEditorSelectGrid extends CSTableEditorElementBase<unknown, ICSTableSelectGridEditorOptions> {

    private _selectElement = viewChild(CSSelectGrid);
    protected readonly _displayMember = this.signalItemGetter<string>('displayMember');
    protected readonly _valueMember = this.signalItemGetter<unknown>('valueMember');
    protected readonly _disableMember = this.signalItemGetter<boolean>('disableMember');
    protected readonly _iconMember = this.signalItemGetter<string>('iconMember');
    protected readonly _dataSource = this.signalActionFromFunctionOrConfig("dataSource");

    protected _selectionChange = this.signalFunctionOf<IAction<CSListChangeArgs<unknown, unknown>>>('SelectionChange');
    protected _valueChange = this.signalFunctionOf<IAction<ICSValueChangeArgs<unknown>>>('ValueChange');
    protected _selectionPredicate = this.signalFunctionOf<SelectPredicate<unknown, unknown>>('SelectionPredicate');

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