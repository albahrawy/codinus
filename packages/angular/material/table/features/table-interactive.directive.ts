import { CDK_TABLE, CdkTable, RowOutlet } from "@angular/cdk/table";
import { booleanAttribute, computed, Directive, effect, inject, input, output } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { focusElement, preventEvent } from "@codinus/dom";
import { Nullable, ObjectGetter } from "@codinus/types";
import { CSSelectionModel, normalizeGetterMember } from "@ngx-codinus/core/data";
import { map } from "rxjs";
import { CODINUS_TABLE_API_REGISTRAR, CSTableSelectionChange, KeyboardNavigationType, SelectionType, SelectPredicate } from "../api";
import { CSTableDataSourceDirective } from "../data";

const DefaultValueFn = <T, V>(record: T) => record as unknown as V;

@Directive({
    selector: `cdk-table[keyboard-navigation],
               mat-table[keyboard-navigation],
               cdk-table[selectable],
               mat-table[selectable]
    `,
    host: {
        'class': 'cs-table-interactive',
        '[class.cs-table-keyboard-navigation]': 'navigationMode()!="none"',
        '[class.cs-table-selectable]': 'selectable()!="none"',
        '[style.--cs-table-sticky-bottom.px]': 'stickyBottomHeight()',
        '[style.--cs-table-sticky-top.px]': 'stickyTopHeight()'
    },
})
export class CSInteractiveTableDirective<TRecord, TSelectValue> {

    private _cdkTable: CdkTable<TRecord> = inject(CDK_TABLE);
    //TODO: handle selection after data changed
    private readonly dataSourceDirective = inject(CSTableDataSourceDirective<TRecord>, { optional: true });
    private _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });

    // private _renderer = inject(Renderer2);
    // private _dir = inject(Directionality, { optional: true });
    private _tableContentChanged = toSignal(this._cdkTable.contentChanged.pipe(map(() => Math.random())));

    private _selectionModel = new CSSelectionModel<TSelectValue>(false, []);
    protected stickyTopHeight = computed(() => {
        this._tableContentChanged();
        return calculateCdkTableSticky(this._cdkTable, this._cdkTable._headerRowOutlet);
    });

    protected stickyBottomHeight = computed(() => {
        this._tableContentChanged();
        return calculateCdkTableSticky(this._cdkTable, this._cdkTable._footerRowOutlet);
    });

    constructor() {

        //this._apiRegistrar?.register('keyboardNavigationDirective', this);

        // effect(() => {
        //     this._tableContentChanged();
        //     //this.updateEvents(this.navigationMode());
        //     console.log('changed from signal');
        // });

        effect(() => this._selectionModel.multiple = this.selectable() === 'multiple');
    }

    readonly selectionChange = output<CSTableSelectionChange<TRecord, TSelectValue>>();

    selectable = input('single', { transform: (v: Nullable<SelectionType>) => v || 'single' });
    navigationMode = input('row', { alias: 'keyboard-navigation', transform: (v: Nullable<KeyboardNavigationType>) => v || 'row' });
    selectableKey = input<ObjectGetter<TRecord, TSelectValue>>();
    selectionPredicate = input<SelectPredicate<TRecord, TSelectValue>>();
    readOnly = input(false, { transform: booleanAttribute });

    selectableKeyFn = computed(() => normalizeGetterMember(this.selectableKey(), DefaultValueFn<TRecord, TSelectValue>));

    //#region selection public methods

    isSelected(row?: TRecord): boolean {
        if (!row)
            return false;
        this._selectionModel.changedSignal();
        this._tableContentChanged();
        const value = this.selectableKeyFn()(row);
        return this.isSelectedByValue(value);
    }

    isSelectedByValue(value: TSelectValue): boolean {
        return this._selectionModel.isSelected(value);
    }

    isAllSelected(): boolean {
        return this._selectionModel.selected.length > 0
            && this._selectionModel.selected.length === this.dataSourceDirective?.getData().length;
    }

    toggle(row: TRecord, raiseEvent = true): boolean {
        const value = this.selectableKeyFn()(row);
        return this._selectByValueCore(row, value, 'toggle', raiseEvent);
    }

    toggleByValue(value: TSelectValue, raiseEvent = false): boolean {
        return this._selectByValueCore(null, value, 'toggle', raiseEvent);
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    toggleAll(): void {
        if (!this._selectionModel.multiple)
            return;
        if (this.isAllSelected()) {
            this._selectionModel.clear();
            this.selectionChange.emit({ api: this._apiRegistrar?.getApi(), reason: 'all', selectedData: [], type: 'deselect' });
            return;
        }
        const valueGetter = this.selectableKeyFn();
        const rowsToSelect = this.dataSourceDirective?.getData().map(r => valueGetter(r));
        if (!rowsToSelect?.length)
            return;

        const _data = this.selectionPredicate()
            ? rowsToSelect.filter(v => this._isSelectableCore(null, v, 'select').success)
            : rowsToSelect;

        this._selectionModel.select(..._data);
        this.selectionChange.emit({ api: this._apiRegistrar?.getApi(), reason: 'all', selectedData: _data, type: 'select' });
    }

    isSelectable(rowData: TRecord | null, keyValue: TSelectValue, type: 'select' | 'deselect'): boolean {
        return this._isSelectableCore(rowData, keyValue, type).success;
    }

    select(row: TRecord, raiseEvent = true): boolean {
        const value = this.selectableKeyFn()(row);
        return this._selectByValueCore(row, value, 'select', raiseEvent);

    }

    selectByValue(value: TSelectValue, raiseEvent = false): boolean {
        return this._selectByValueCore(null, value, 'select', raiseEvent);

    }

    deselect(row: TRecord, raiseEvent = true): boolean {
        const value = this.selectableKeyFn()(row);
        return this._selectByValueCore(row, value, 'deselect', raiseEvent);
    }

    deselectByValue(value: TSelectValue, raiseEvent = false): boolean {
        return this._selectByValueCore(null, value, 'deselect', raiseEvent);

    }

    setSelection(keys: TSelectValue[] | null): boolean {
        if (this.selectable() === 'none')
            return false;
        if (keys == null || keys.length == 0) {
            return this._selectionModel.clear() ?? false;
        }

        if (this.selectionPredicate())
            keys = keys.filter(r => this._isSelectableCore(null, r, 'select').success);

        if (this.selectable() === 'single')
            keys = [keys[0]];

        return this._selectionModel.setSelection(...keys) ?? false;
    }

    getSelection(): TSelectValue[] {
        return this._selectionModel.selected;
    }

    getSelectedRows(): TRecord[] | null {
        const selectedSet = new Set(this.getSelection());
        const valueGetter = this.selectableKeyFn();
        return this.dataSourceDirective?.getData()?.filter(record => selectedSet.has(valueGetter(record))) ?? null;
    }

    //#endregion

    //#region navigation public methods

    moveByRow(event: KeyboardEvent, rowElement: HTMLElement): boolean {
        if (rowElement !== event.target)
            return false;
        const responsiveColumns = this._apiRegistrar?.tableApiResponsive?.columnsInRow() ?? 0;
        if (responsiveColumns > 1) {
            switch (event.code) {
                case 'ArrowDown':
                    return this._moveByPage(rowElement, event, responsiveColumns);
                case 'ArrowRight':
                    return this._moveToNextRow(rowElement, event);
                case 'ArrowUp':
                    return this._moveByPage(rowElement, event, -responsiveColumns);
                case 'ArrowLeft':
                    return this._moveToPreviousRow(rowElement, event);
                case 'PageDown':
                    return this._moveByPage(rowElement, event, responsiveColumns * 8);
                case 'PageUp':
                    return this._moveByPage(rowElement, event, responsiveColumns * -8);
            }
        } else {
            switch (event.code) {
                case 'ArrowDown':
                    return this._moveToNextRow(rowElement, event);
                case 'ArrowUp':
                    return this._moveToPreviousRow(rowElement, event);
                case 'PageDown':
                    return this._moveByPage(rowElement, event, 8);
                case 'PageUp':
                    return this._moveByPage(rowElement, event, -8);
            }
        }
        return false;
    }

    private _moveToPreviousRow(element: HTMLElement, event: KeyboardEvent): boolean {
        preventEvent(event);
        focusElement(element.previousElementSibling);
        return true;
    }

    private _moveToNextRow(element: HTMLElement, event: KeyboardEvent): boolean {
        preventEvent(event);
        focusElement(element.nextElementSibling);
        return true;
    }

    private _moveByPage(element: HTMLElement, event: KeyboardEvent, count: number): boolean {
        preventEvent(event);
        const nextRow = this._getExpectedRowWithPage(element, count);
        focusElement(nextRow);
        return true;
    }

    //#endregion

    //#region selection private methods

    private _raiseSingleEvent(type: 'select' | 'deselect', row: TRecord, value: TSelectValue) {
        this.selectionChange.emit({
            api: this._apiRegistrar?.getApi(),
            reason: 'option', optionData: row, optionValue: value,
            type, selectedData: this._selectionModel.selected
        });
    }

    private _isSelectableCore(rowData: TRecord | null, keyValue: TSelectValue, type: 'select' | 'deselect')
        : { success: false, dataItem?: Nullable<TRecord> } | { success: true, dataItem: TRecord } {
        if (this.readOnly() || this.selectable() === 'none')
            return { success: false };
        const predicate = this.selectionPredicate();
        if (typeof predicate === 'function') {
            const data = this.dataSourceDirective?.getData() ?? [];
            const dataItem = rowData ?? this._getRowByValue(keyValue, data);
            if (!dataItem)
                return { success: false };
            const args = {
                data,
                selected: this._selectionModel.selected,
                rowKey: keyValue,
                rowData: dataItem,
                type
            }
            return { dataItem, success: predicate(args) };
        }
        const success = this._selectionModel.multiple || type == 'select';
        if (!success)
            return { success };

        const data = this.dataSourceDirective?.getData() ?? [];
        const dataItem = rowData ?? this._getRowByValue(keyValue, data);
        if (dataItem)
            return { success, dataItem };
        return { success: false }
    }

    private _selectByValueCore(dataRow: TRecord | null, value: TSelectValue, type: 'select' | 'deselect' | 'toggle', raiseEvent = false): boolean {
        const isToggle = type === 'toggle';
        if (type === 'toggle')
            type = this._selectionModel.isSelected(value) ? 'deselect' : 'select';

        const selectable = this._isSelectableCore(dataRow, value, type);
        if (selectable.success) {
            const success =
                isToggle
                    ? this._selectionModel.toggle(value)
                    : type === 'deselect'
                        ? this._selectionModel.deselect(value)
                        : this._selectionModel.select(value);
            if (success && raiseEvent) {
                this._raiseSingleEvent(type, selectable.dataItem, value);
                return true;
            }
        }
        return false;
    }

    private _getRowByValue(keyValue: TSelectValue, data?: TRecord[]) {
        data ??= this.dataSourceDirective?.getData() ?? [];
        const valueGetter = this.selectableKeyFn();
        return data.find(d => valueGetter(d) == keyValue);
    }

    //#endregion

    //#region navigation private methods

    private _getExpectedRowWithPage(currentRow: Element | null, count: number) {
        if (!currentRow || !currentRow.parentElement)
            return null;
        const renderedRows = Array.from(currentRow.parentElement.children) as Element[];
        const reqCount = renderedRows.indexOf(currentRow) + count;
        const requiredIndex = Math.max(0, Math.min(reqCount, renderedRows.length - 1));
        return renderedRows.at(requiredIndex) ?? null;
    }

    //#endregion

    // private updateEvents(navigationMode: KeyboardNavigationType) {
    //     if (navigationMode === 'none')
    //         return;

    //     const stickyHeight = {
    //         top: calculateCdkTableSticky(this._cdkTable, this._cdkTable._headerRowOutlet),
    //         bottom: calculateCdkTableSticky(this._cdkTable, this._cdkTable._footerRowOutlet)
    //     }
    //     this.stickyHeight.set(stickyHeight);

    //     const rowOutlet = this._cdkTable._rowOutlet;
    //     for (let i = 0; i < rowOutlet.viewContainer.length; i++) {
    //         const rowElement = (rowOutlet.viewContainer.get(i) as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;
    //         if (rowElement.getAttribute('keyboard-event-binded'))
    //             continue;

    //         rowElement.setAttribute('keyboard-event-binded', 'true');
    //         switch (this.navigationMode()) {
    //             case 'row':
    //                 rowElement.tabIndex = 0;
    //                 this._renderer.listen(rowElement, 'keydown', e => this._onRowKeyDown(rowElement, e));
    //                 break;
    //             case 'cell':
    //             case 'cell-round':
    //                 this._renderer.listen(rowElement, 'keydown.space', e => {
    //                     if (Array.from(rowElement.children).includes(e.target))
    //                         preventEvent(e);
    //                 });
    //                 rowElement.querySelectorAll('.cdk-cell').forEach((cell, index) => {
    //                     this._renderer.listen(cell, 'keydown', e => this._onCellKeyDown(rowElement, cell as HTMLElement, index, e));
    //                     cell.setAttribute('tabIndex', '0');
    //                 });
    //                 break;
    //         }

    //     }
    // }

    //#region row events

    // private _onRowKeyDown(rowElement: HTMLElement, event: KeyboardEvent): boolean | void {
    //     if (rowElement !== event.target)
    //         return;
    //     switch (event.code) {
    //         case 'ArrowDown':
    //             this._moveDownRow(rowElement, event);
    //             break;
    //         case 'ArrowUp':
    //             this._moveUpRow(rowElement, event);
    //             break;
    //         case 'PageDown':
    //             this._proceedPageKeyRow(rowElement, event, 10);
    //             break;
    //         case 'PageUp':
    //             this._proceedPageKeyRow(rowElement, event, -10);
    //             break;
    //         case 'Space':
    //             preventEvent(event);
    //             break;
    //     }
    // }

    // private _moveDownRow(element: HTMLElement, event: Event) {
    //     preventEvent(event);
    //     focusElement(element.nextElementSibling);
    // }

    // private _moveUpRow(element: HTMLElement, event: Event) {
    //     preventEvent(event);
    //     focusElement(element.previousElementSibling);
    // }

    // private _proceedPageKeyRow(element: HTMLElement, event: Event, count: number) {
    //     preventEvent(event);
    //     const nextRow = this._getExpectedRowWithPage(element, count);
    //     focusElement(nextRow);
    // }

    // private _getExpectedRowWithPage(currentRow: Element | null, count: number) {
    //     if (!currentRow || !currentRow.parentElement)
    //         return null;
    //     const renderedRows = Array.from(currentRow.parentElement.children) as Element[];
    //     const reqCount = renderedRows.indexOf(currentRow) + count;
    //     const requiredIndex = Math.max(0, Math.min(reqCount, renderedRows.length - 1));
    //     return renderedRows.at(requiredIndex) ?? null;
    // }

    // //#endregion

    // //#region cell events

    // private _onCellKeyDown(rowElement: HTMLElement, cell: HTMLElement, cellIndex: number, event: KeyboardEvent): boolean | void {
    //     if (cell !== event.target)
    //         return;
    //     switch (event.code) {
    //         case 'ArrowLeft':
    //             this._dir?.value === 'rtl' ? this._moveRight(rowElement, cell, event) : this._moveLeft(rowElement, cell, event);
    //             break;
    //         case 'ArrowRight':
    //             this._dir?.value === 'rtl' ? this._moveLeft(rowElement, cell, event) : this._moveRight(rowElement, cell, event);
    //             break;
    //         case 'ArrowDown':
    //             this._moveDownCell(rowElement, cell, cellIndex, event);
    //             break;
    //         case 'ArrowUp':
    //             this._moveUpCell(rowElement, cell, cellIndex, event);
    //             break;
    //         case 'PageDown':
    //             this._proceedPageKeyCell(rowElement, cell, cellIndex, event, 10);
    //             break;
    //         case 'PageUp':
    //             this._proceedPageKeyCell(rowElement, cell, cellIndex, event, -10);
    //             break;
    //     }
    // }

    // private _moveLeft(rowElement: HTMLElement, cellElement: HTMLElement, event: Event) {
    //     preventEvent(event);
    //     const reqCell = cellElement.previousElementSibling;
    //     if (reqCell)
    //         focusElement(reqCell);
    //     else if (this.navigationMode === 'cell-round')
    //         this._moveUpCell(rowElement, cellElement, rowElement.children.length - 1, event);
    // }

    // private _moveRight(rowElement: HTMLElement, cellElement: HTMLElement, event: Event) {
    //     const reqCell = cellElement.nextElementSibling;
    //     if (reqCell)
    //         focusElement(reqCell);
    //     else if (this.navigationMode === 'cell-round')
    //         this._moveDownCell(rowElement, cellElement, 0, event);
    // }

    // private _moveDownCell(rowElement: HTMLElement, cellElement: HTMLElement, cellIndex: number, event: Event) {
    //     preventEvent(event);
    //     this._moveCellAndFocus(rowElement, rowElement.nextElementSibling, cellIndex);
    // }

    // private _moveUpCell(rowElement: HTMLElement, cellElement: HTMLElement, cellIndex: number, event: Event) {
    //     preventEvent(event);
    //     this._moveCellAndFocus(rowElement, rowElement.previousElementSibling, cellIndex);
    // }

    // private _proceedPageKeyCell(rowElement: HTMLElement, cellElement: HTMLElement, cellIndex: number, event: Event, count: number) {
    //     preventEvent(event);
    //     const nextRow = this._getExpectedRowWithPage(rowElement, count);
    //     this._moveCellAndFocus(rowElement, nextRow, cellIndex);
    // }

    // private _moveCellAndFocus(currentRow: Element | null, reqRow: Element | null, cellIndex: number) {
    //     if (!reqRow || !currentRow)
    //         return;
    //     scrollIntoViewIfNeeded(reqRow, false);
    //     (reqRow.children.item(cellIndex) as HTMLElement)?.focus();
    // }

    //#endregion
}

function calculateCdkTableSticky<TRow>(table: CdkTable<TRow>, rowOutlet?: RowOutlet) {
    if (!rowOutlet?.viewContainer)
        return null;
    const height = table._getRenderedRows(rowOutlet).filter(e => Array.from(e.classList)
        .some(e => e.endsWith('table-sticky')))
        .reduce((acc, o) => acc + o.clientHeight, 0);
    return height > 0 ? height : null;
}
