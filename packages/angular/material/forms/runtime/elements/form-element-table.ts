import { Component, computed, effect, viewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { getProperCssValue } from '@codinus/dom';
import { arrayToObject } from '@codinus/js-extensions';
import { IArglessFunc, IGenericRecord } from '@codinus/types';
import { CSButtonContainer, CSFormFieldToolBar, ICSButtonArgs, ICSButtonConfig } from '@ngx-codinus/material/buttons';
import {
    CODINUS_DATA_SOURCE_DIRECTIVE, CodinusTableModule, CSInteractiveTableDirective,
    CSTableFormInput, CSTableSelectionChange, ICSDataModifedArgs, SelectPredicate
} from '@ngx-codinus/material/table';
import { CSRunTimeFormValidableElementBase } from '../cs-element-base/form-element-validable-base';
import { ELEMENT_IMPORTS } from './_internal';
import { ICSRuntimeFormGrid } from './_types';

@Component({
    selector: 'cs-runtime-form-element-table',
    template: `
            <cs-button-container cs-form-field-bar [buttons]="speedButtons()" [absolute]="true"
             [disabled]="!table.canEdit()" (buttonClicked)="onSpeedBtnClicked(table,$event)">
            </cs-button-container>
            <mat-table csTableFormInput #table="csTableFormInput"
                [commitOnDestroy]="config().commitOnDestroy" [editWithF2]="config().editWithF2"
                [editWithEnter]="config().editWithEnter" [attachFilter]="config().attachFilter"
                [reorderColumns]="config().reorderColumns" [sortable]="config().sortable" 
                [showHeader]="config().showHeader"[showFilter]="config().showFilter" [showFooter]="config().showFooter" 
                [stickyHeader]="config().stickyHeader"[stickyFilter]="config().stickyFilter"
                [stickyFooter]="config().stickyFooter" [noDataText]="config().noDataText" 
                [selectColumn]="config().selectColumn" [keyboard-navigation]="config().keyboardNavigation" 
                [iconColumn]="config().iconColumn" [showIndex]="config().showIndex" [columns]="config().columns"
                [iconGetter]="config().iconGetter" [iconType]="config().iconType" 
                selectable="single" [selectionPredicate]="selectPredicate()" [selectableKey]="config().selectableKey"
                [csFormControlName]="config().dataKey" [asyncValidators]="asyncValidator()" [validators]="validator()"
                [required]="!!config().required" [readOnly]="config().readOnly"
                >
            </mat-table>
    `,
    imports: [...ELEMENT_IMPORTS, CodinusTableModule, MatTableModule, CSFormFieldToolBar, CSButtonContainer],
})

export class CSFormElementTable<TRecord> extends CSRunTimeFormValidableElementBase<ICSRuntimeFormGrid, IGenericRecord[]> {

    private _interactiveTable = viewChild(CSInteractiveTableDirective);
    private _dataSourceDirective = viewChild(CODINUS_DATA_SOURCE_DIRECTIVE);
    private _speedButton = viewChild(CSButtonContainer);

    private _selectionChange = this.signalFunctionOf<IArglessFunc<CSTableSelectionChange<TRecord, unknown>>>('selectionChange');
    private _dataModified = this.signalFunctionOf<IArglessFunc<ICSDataModifedArgs<TRecord>>>('dataModified');
    private _speedButtons = this.signalFunctionOf<(table: CSTableFormInput, args: ICSButtonArgs) => void>('selectionChange');

    protected selectPredicate = this.signalFunctionOf<SelectPredicate<TRecord, unknown>>('SelectPredicate');
    protected readonly height = computed(() => getProperCssValue(this.config().height) ?? '300px');

    protected speedButtons = computed<ICSButtonConfig>(() => {
        const baseButtons = {
            add: { icon: 'add', disabled: false, isFab: true },
            remove: { icon: 'delete', disabled: true, isFab: true }
        };
        const customButtons = arrayToObject(this.config().buttons ?? [], v => [v.name, { icon: v.icon, disabled: v.disabled }]);
        return { ...baseButtons, ...customButtons };
    });

    constructor() {
        super();
        const selectionEffect = effect(() => {
            const control = this._interactiveTable();
            const selectionChange = this._selectionChange();
            if (control && selectionChange) {
                control.selectionChange.subscribe(selectionChange);
                selectionEffect.destroy();
            }
        });

        const modifiedEffect = effect(() => {
            const control = this._dataSourceDirective();
            const dataModified = this._dataModified();
            if (control && dataModified) {
                control.dataModified.subscribe(dataModified);
                modifiedEffect.destroy();
            }
        });

        effect(() => this._speedButton()?.setButtonDisabledState('remove', !this._interactiveTable()?.hasSelection()));
    }

    protected onSpeedBtnClicked(table: CSTableFormInput, args: ICSButtonArgs) {
        switch (args.key) {
            case 'add':
                table.addNew();
                break;
            case 'remove':
                table.removeSelected();
                break;
            default:
                this._speedButtons?.()?.(table, args);
                break;
        }
    }
}