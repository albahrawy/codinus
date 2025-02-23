import { CdkTable } from '@angular/cdk/table';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, viewChild, ViewEncapsulation } from '@angular/core';
import { toStringValue } from '@codinus/js-extensions';
import { IStringRecord, Nullable, ValueGetter } from '@codinus/types';
import { DefaultMemberFn, getDisplayText, normalizeGetterMember, ValueChangeReason } from '@ngx-codinus/core/data';
import { booleanTrueAttribute } from '@ngx-codinus/core/shared';
import { CSIconType } from '@ngx-codinus/material/buttons';
import { CSMatFormFieldControl } from '@ngx-codinus/material/inputs';
import {
    CODINUS_DATA_SOURCE_DIRECTIVE, CodinusTableModule, CSInteractiveTableDirective, CSTableSelectionChange,
    CSTableVirtualScrollable, ICSSelectionChangingArgs, ICSTableColumn, ICSTableDataSourceDirective, SelectPredicate
} from '@ngx-codinus/material/table';
import { CsDropDownHost } from '../host/drop-down-host';
import { CSOverlayHost } from '../host/overlay-host';
import { ListType } from '../types';
//TODO: 1- filter sticky top value // 2-flicker in scroll
@Component({
    selector: 'cs-select-grid',
    templateUrl: './cs-select-grid.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [CSMatFormFieldControl],
    imports: [CodinusTableModule, CSOverlayHost],
})

export class CSSelectGrid<TRow, TValue> extends CsDropDownHost<TRow, TValue> {

    protected override dropDownElementLoaded = computed(() => !!this._dataSourceDirective() && !!this._selectableDirective());
    private _dataSourceDirective = viewChild<ICSTableDataSourceDirective<TRow>>(CODINUS_DATA_SOURCE_DIRECTIVE);
    private _selectableDirective = viewChild(CSInteractiveTableDirective<TRow, TValue>);
    private _scrollbleDirective = viewChild(CSTableVirtualScrollable);
    private _cdkTable = viewChild(CdkTable);

    protected _selectable = computed(() => this.multiple() ? 'multiple' : 'single');
    private _displayMemberFn = computed(() => normalizeGetterMember(this.displayMember(), (r: TRow) => toStringValue(r)));
    private _disabledMemberFn = computed(() => normalizeGetterMember(this.disableMember(), null));
    private _valueMemberFn = computed(() => normalizeGetterMember(this.valueMember(), DefaultMemberFn<TRow, TValue>));

    iconType = input<CSIconType>();
    iconColumn = computed(() =>
        (!this.iconType() || !this.iconMember())
            ? 'none'
            : this.togglePosition() === 'after'
                ? 'before'
                : 'after'
    );

    iconMember = input<ValueGetter<TRow, string> | string>();
    columns = input<Array<ICSTableColumn<TRow>>>([]);
    stickyHeader = input(true, { transform: booleanTrueAttribute });
    stickyFilter = input(true, { transform: booleanTrueAttribute });
    stickyFooter = input(true, { transform: booleanTrueAttribute });
    showHeader = input(true, { transform: booleanTrueAttribute });
    showFilter = input(true, { transform: booleanTrueAttribute });
    showFooter = input(false, { transform: booleanAttribute });
    noDataText = input<Nullable<string | IStringRecord>>("CodinusTable.NoData");
    sortable = input(false, { transform: booleanAttribute });
    selectionPredicate = input<SelectPredicate<TRow, unknown>>();
    selectColumn = computed(() => !this.multiple() ? 'none' : this.togglePosition() || 'before');

    activateFirstItem = input(false, { transform: booleanAttribute });

    protected override getInnerValue() { return this._selectableDirective()?.getSelection(); }
    protected override setInnerValue(value: ListType<TValue>, reason: ValueChangeReason): void {
        value = value ? Array.isArray(value) ? value : [value] : null;
        if (this._selectableDirective()?.setSelection(value))
            this._elementValueChanged({ value: this.getInnerValue(), reason });
    }

    protected override listHeight = computed(() => {
        const sd = this._selectableDirective();
        const metaHeight = (sd?.footerHeight() ?? 0) + (sd?.headerHeight() ?? 0);
        return ((this._dataSourceDirective()?.getData()?.length ?? 0) * this.optionHeight()) + metaHeight;
    });

    protected override selectedTitles = computed(() => {
        const rows = this._selectableDirective()?.getSelectedRows();
        const fn = this._displayMemberFn();
        if (!rows || !fn)
            return null;

        this._selectableDirective()?.changedSignal();

        return rows.map(r => fn(r));
    });

    protected _tableSelctionChanged(args: CSTableSelectionChange<TRow, TValue>) {
        this._elementValueChanged({ value: args.selectedData as TValue, reason: 'user' });
        this._elementSelectionChange(args);
    }

    protected override positioningSettled(): void {
        this._selectableDirective()?.recalculateMetaRowsHeight();
        setTimeout(() => {
            this._cdkTable()?.updateStickyHeaderRowStyles();
            this._cdkTable()?.updateStickyFooterRowStyles();
        });
        this._scrollbleDirective()?.scrollToStart();
    }

    protected _selectionPredicate = computed<SelectPredicate<TRow, unknown>>(() => {
        const sp = this.selectionPredicate();
        if (sp)
            return sp;
        const disabledFn = this._disabledMemberFn();
        if (disabledFn)
            return (args: ICSSelectionChangingArgs<TRow, unknown>) => !disabledFn(args.rowData);
        return null;
    });

    getDisplayText(values: TValue[]) {
        const titles = getDisplayText(this._displayMemberFn(), this._valueMemberFn(),
            this._dataSourceDirective()?.getData(), values);
        return this.getDisplayTextCore(titles);
    }
}
