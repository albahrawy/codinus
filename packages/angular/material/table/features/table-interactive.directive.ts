import { Directionality } from "@angular/cdk/bidi";
import { CDK_TABLE, CdkCellOutletRowContext, CdkTable, RowOutlet } from "@angular/cdk/table";
import {
    AfterViewInit, booleanAttribute, computed, Directive, effect, ElementRef, EmbeddedViewRef, inject, input, output,
    signal,
    untracked
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { focusElement, preventEvent, scrollIntoViewIfNeeded } from "@codinus/dom";
import { Nullable, ValueGetter } from "@codinus/types";
import { CSSelectionModel, DefaultMemberFn, normalizeGetterMember } from "@ngx-codinus/core/data";
import { map } from "rxjs";
import {
    CODINUS_TABLE_API_REGISTRAR, CSTableSelectionChange, KeyboardNavigationType,
    SelectionType, SelectPredicate
} from "../api";
import { CODINUS_DATA_SOURCE_DIRECTIVE, ICSTableDataSourceDirective } from "../data";
import { CSTableApiSelectModel } from "./table-api-select-model";

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
    exportAs: 'csTableInteractive'
})
export class CSInteractiveTableDirective<TRecord, TSelectValue> implements AfterViewInit {

    private _cdkTable: CdkTable<TRecord> = inject(CDK_TABLE);
    //TODO: handle selection after data changed
    private readonly dataSourceDirective = inject<ICSTableDataSourceDirective<TRecord>>(CODINUS_DATA_SOURCE_DIRECTIVE, { optional: true });
    private _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });
    private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private _dir = inject(Directionality, { optional: true });

    private _tableContentChanged = toSignal(this._cdkTable.contentChanged.pipe(map(() => Math.random())));
    private _selectionModel = new CSSelectionModel<TSelectValue>(false, []);
    private _pendingValue: TSelectValue[] | null = null;
    private _initialized = false;
    private _rndSignal = signal(0);

    changedSignal = this._selectionModel.changedSignal;

    stickyTopHeight = computed(() => {
        this._rndSignal();
        this._tableContentChanged();
        return calculateCdkTableMetaRowsHeight(this._cdkTable, this._cdkTable._headerRowOutlet);
    });

    stickyBottomHeight = computed(() => {
        this._rndSignal();
        this._tableContentChanged();
        return calculateCdkTableMetaRowsHeight(this._cdkTable, this._cdkTable._footerRowOutlet);
    });

    headerHeight = computed(() => {
        this._rndSignal();
        this._tableContentChanged();
        return calculateCdkTableMetaRowsHeight(this._cdkTable, this._cdkTable._headerRowOutlet, false);
    });

    footerHeight = computed(() => {
        this._rndSignal();
        this._tableContentChanged();
        return calculateCdkTableMetaRowsHeight(this._cdkTable, this._cdkTable._footerRowOutlet, false);
    });


    constructor() {
        this._apiRegistrar?.register('tableApiSelectModel', new CSTableApiSelectModel(this));
        effect(() => this._selectionModel.multiple = this.selectable() === 'multiple');
        effect(() => {
            const data = this.dataSourceDirective?.getData();
            const selection = this.getSelection();
            if (selection.length > 0) {
                if (!data || data.length == 0) {
                    this._selectionModel.clear();
                    return;
                }
                const valueGetterFn = this.selectableKeyFn();
                const availableKeys = new Set(data.map(valueGetterFn));
                const verifiedSelected = selection.filter((key) => availableKeys.has(key));
                untracked(() => this.setSelection(verifiedSelected));
            }
        });
    }

    ngAfterViewInit(): void {
        this._initialized = true;
        if (this._pendingValue) {
            this.setSelection(this._pendingValue);
            this._pendingValue = null;
        }
    }

    readonly selectionChange = output<CSTableSelectionChange<TRecord, TSelectValue>>();

    selectable = input('single', { transform: (v: Nullable<SelectionType>) => v || 'single' });
    navigationMode = input('row', { alias: 'keyboard-navigation', transform: (v: Nullable<KeyboardNavigationType>) => v || 'row' });
    selectableKey = input<ValueGetter<TRecord, TSelectValue>>();
    selectionPredicate = input<SelectPredicate<TRecord, TSelectValue>>();
    readOnly = input(false, { transform: booleanAttribute });

    private selectableKeyFn = computed(() => normalizeGetterMember(this.selectableKey(), DefaultMemberFn<TRecord, TSelectValue>));

    //#region selection public methods

    isSelected(row?: TRecord): boolean {
        if (!row)
            return false;
        this._selectionModel.changedSignal();
        this._tableContentChanged();
        const value = this.selectableKeyFn()(row);
        return this.isSelectedByValue(value);
    }

    hasSelection = computed(() => {
        this._selectionModel.changedSignal();
        return this._selectionModel.selected?.length > 0;
    });

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

    recalculateMetaRowsHeight() {
        this._rndSignal.set(Math.random());

    }

    get inEditMode(): boolean {
        return this._elementRef.nativeElement.getAttribute('editing-mode') === 'true';
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
            ? rowsToSelect.filter(v => this._isSelectableAllowedCore(null, v, 'select').success)
            : rowsToSelect;

        this._selectionModel.select(..._data);
        this.selectionChange.emit({ api: this._apiRegistrar?.getApi(), reason: 'all', selectedData: _data, type: 'select' });
    }

    isSelectableAllowed(rowData: TRecord | null, keyValue: TSelectValue, type: 'select' | 'deselect'): boolean {
        return this._isSelectableAllowedCore(rowData, keyValue, type).success;
    }

    select(row: TRecord, raiseEvent = true, setFocus = false): boolean {
        const value = this.selectableKeyFn()(row);
        return this._selectByValueCore(row, value, 'select', raiseEvent, setFocus);
    }

    selectByValue(value: TSelectValue, raiseEvent = false, setFocus = false): boolean {
        return this._selectByValueCore(null, value, 'select', raiseEvent, setFocus);

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

        if (!this._initialized) {
            this._pendingValue = keys;
            return false;
        }

        if (this.selectionPredicate())
            keys = keys.filter(r => this._isSelectableAllowedCore(null, r, 'select').success);

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
            return true;
        const nextRow = this._getNextRow(event.code, rowElement);
        if (nextRow) {
            preventEvent(event);
            this._focusElement(nextRow);
            return true;
        }
        return false;
    }

    moveByCell(event: KeyboardEvent, cellElement: HTMLElement): boolean {
        if (cellElement !== event.target)
            return true;

        const nextCell = this._getNextCell(event.code, cellElement);
        if (nextCell) {
            preventEvent(event);
            if (nextCell.parentElement == cellElement.parentElement)
                focusElement(nextCell, false);
            else
                this._scrollToElement(nextCell.parentElement)?.then(() => focusElement(nextCell));

            return false;
        }
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

    private _isSelectableAllowedCore(rowData: TRecord | null, keyValue: TSelectValue, type: 'select' | 'deselect')
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

    private _selectByValueCore(dataRow: TRecord | null, value: TSelectValue, type: 'select' | 'deselect' | 'toggle', raiseEvent = false, setFocus = false): boolean {
        const isToggle = type === 'toggle';
        if (type === 'toggle')
            type = this._selectionModel.isSelected(value) ? 'deselect' : 'select';

        const selectable = this._isSelectableAllowedCore(dataRow, value, type);
        if (selectable.success) {
            const success =
                isToggle
                    ? this._selectionModel.toggle(value)
                    : type === 'deselect'
                        ? this._selectionModel.deselect(value)
                        : this._selectionModel.select(value);
            if (success && raiseEvent) {
                this._raiseSingleEvent(type, selectable.dataItem, value);
                if (setFocus)
                    this._tryToSetFocus(selectable.dataItem);
                return true;
            }
        }
        return false;
    }

    private _tryToSetFocus(dataRow: TRecord) {
        const viewContainer = this._cdkTable._rowOutlet.viewContainer;
        for (let i = 0; i < viewContainer.length; i++) {
            const viewRef = viewContainer.get(i) as EmbeddedViewRef<CdkCellOutletRowContext<TRecord>>;
            if (viewRef.context.$implicit === dataRow) {
                this._setFocusBasedOnNavigationType(viewRef.rootNodes.at(0));
                break;
            }
        }
    }

    private _setFocusBasedOnNavigationType(rowElement?: HTMLElement) {
        if (!rowElement)
            return;
        const mode = this.navigationMode();
        if (mode === 'row') {
            rowElement.focus();
            return;
        }
        if (mode.startsWith('cell'))
            (rowElement.childNodes.item(0) as HTMLElement)?.focus();
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

    private _scrollToElement(element: Element | null) {
        const rootMargin = this._apiRegistrar?.tableApiResponsive?.columnsInRow()
            ? undefined
            : `-${this.stickyTopHeight() ?? 0}px 0px -${this.stickyBottomHeight() ?? 0}px 0px`;
        return scrollIntoViewIfNeeded(element, this._elementRef.nativeElement, rootMargin);
    }

    private _focusElement(element: Element | null) {
        this._scrollToElement(element)?.then(() => focusElement(element));
    }

    private _getNextRow(code: string, rowElement: Element | null): Element | null {
        if (!rowElement)
            return null;
        const responsiveColumns = this._apiRegistrar?.tableApiResponsive?.columnsInRow() ?? 0;
        if (responsiveColumns > 1) {
            switch (code) {
                case 'ArrowDown':
                    return this._getExpectedRowWithPage(rowElement, responsiveColumns);
                case 'ArrowUp':
                    return this._getExpectedRowWithPage(rowElement, -responsiveColumns);
                case 'ArrowRight':
                    return this._dir?.value === 'rtl'
                        ? rowElement.previousElementSibling
                        : rowElement.nextElementSibling;
                case 'ArrowLeft':
                    return this._dir?.value === 'rtl'
                        ? rowElement.nextElementSibling
                        : rowElement.previousElementSibling;
                case 'PageDown':
                    return this._getExpectedRowWithPage(rowElement, responsiveColumns * 8);
                case 'PageUp':
                    return this._getExpectedRowWithPage(rowElement, responsiveColumns * -8);
            }
        } else {
            switch (code) {
                case 'ArrowDown':
                    return rowElement.nextElementSibling;
                case 'ArrowUp':
                    return rowElement.previousElementSibling;
                case 'PageDown':
                    return this._getExpectedRowWithPage(rowElement, 8);
                case 'PageUp':
                    return this._getExpectedRowWithPage(rowElement, -8);
            }
        }
        return null;
    }

    private _getNextCell(code: string, cellElement: HTMLElement): Element | null {
        const responsiveColumns = (this._apiRegistrar?.tableApiResponsive?.columnsInRow() ?? 0) > 1;
        switch (code) {
            case 'ArrowDown':
                return responsiveColumns
                    ? this._getCellHorizontally(cellElement, this._dir?.value === 'rtl')
                    : this._getCellVertically(cellElement, code);
            case 'ArrowUp':
                return responsiveColumns
                    ? this._getCellHorizontally(cellElement, this._dir?.value !== 'rtl')
                    : this._getCellVertically(cellElement, code);
            case 'ArrowRight':
                return responsiveColumns
                    ? this._getCellVertically(cellElement, code)
                    : this._getCellHorizontally(cellElement, this._dir?.value === 'rtl');
            case 'ArrowLeft':
                return responsiveColumns
                    ? this._getCellVertically(cellElement, code)
                    : this._getCellHorizontally(cellElement, this._dir?.value !== 'rtl');
            case 'PageDown':
            case 'PageUp':
                return this._getCellVertically(cellElement, code);
        }
        return null;
    }

    private _getCellHorizontally(cellElement: Element, previous: boolean) {
        const nextCell = previous
            ? cellElement.previousElementSibling
            : cellElement.nextElementSibling;
        if (nextCell)
            return nextCell;
        const nextRow = this._getNextRow(previous ? 'ArrowUp' : 'ArrowDown', cellElement.parentElement);
        const children = nextRow?.children;
        return children ? children.item(previous ? children.length - 1 : 0) : null;
    }

    private _getCellVertically(cellElement: Element, code: string) {
        const index = this._getCellIndex(cellElement);
        if (index === -1)
            return null;
        const nextRow = this._getNextRow(code, cellElement.parentElement);
        return nextRow?.children.item(index) ?? null;
    }

    private _getCellIndex(cellElement: Element) {
        if (!cellElement.parentElement)
            return -1;
        for (let i = 0; i < cellElement.parentElement.children.length; i++) {
            if (cellElement.parentElement.children[i] === cellElement) {
                return i;
            }
        }
        return -1;
    }

    //#endregion
}

function calculateCdkTableMetaRowsHeight<TRow>(table: CdkTable<TRow>, rowOutlet?: RowOutlet, onlySticky = true) {
    if (!rowOutlet?.viewContainer)
        return null;
    let rows = table._getRenderedRows(rowOutlet);
    if (onlySticky)
        rows = rows.filter(e => Array.from(e.classList)
            .some(e => e.endsWith('table-sticky')));
    const height = rows.reduce((acc, o) => acc + o.clientHeight, 0);
    return height > 0 ? height : null;
}
