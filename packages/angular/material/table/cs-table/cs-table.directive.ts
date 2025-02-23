import { CdkColumnDef, CdkFooterRowDef, CdkHeaderRowDef, CdkNoDataRow, CdkRowDef, CdkTable } from '@angular/cdk/table';
import { booleanAttribute, Component, computed, Directive, effect, ElementRef, EnvironmentInjector, forwardRef, inject, INJECTOR, Injector, input, viewChild, viewChildren, ViewContainerRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { arraySort } from '@codinus/js-extensions';
import { IStringRecord, Nullable, ValueGetter } from '@codinus/types';
import { CSTranslateFromDictionaryPipe, CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { booleanTrueAttribute, signalVersion } from '@ngx-codinus/core/shared';
import { CSIconType } from '@ngx-codinus/material/buttons';
import { CODINUS_TABLE_CELLS } from '../cells';
import { CSColumnReordable, CSColumnSortable, CSTableColumnResize, CSTableReorderColumns, CSTableReorderColumnsBase } from '../columns';
import { CSTableColumnDataDef, CSValueGetter } from '../data';
import { CODINUS_TABLE_EDITORS, CSColumnEditorDef } from '../editors';
import { CSInteractiveRowDirective, CSInteractiveTableDirective, CSTableNavigatableCell } from '../features';
import { CODINUS_TABLE_FILTERS, CSCdkFilterRowDef } from '../filters';
import { CSTableMetaRowModel } from './meta-row-model';
import { ICSTableColumn } from './types';
import { CDK_DROP_LIST } from '@angular/cdk/drag-drop';

@Component({
    selector: 'cs-table-dynamic-columns',
    template: `

  <ng-container matColumnDef="select-column" csColumnDataDef label="">
    <mat-header-cell *matHeaderCellDef [columnWidth]="40"></mat-header-cell>
    <mat-filter-cell *matFilterCellDef></mat-filter-cell>
    <mat-cell class="cs-selector-cell" *matCellDef selectorCell></mat-cell>
    <mat-footer-cell *matFooterCellDef></mat-footer-cell>
  </ng-container>

  <ng-container matColumnDef="row-index-column" csColumnDataDef label="">
    <mat-header-cell *matHeaderCellDef [columnWidth]="40"></mat-header-cell>
    <mat-filter-cell *matFilterCellDef></mat-filter-cell>
    <mat-cell *matCellDef indexCell></mat-cell>
    <mat-footer-cell *matFooterCellDef></mat-footer-cell>
  </ng-container>

  <ng-container matColumnDef="icon-column" label="" csColumnDataDef [dataKey]="(iConDataKey()|csTranslate)()" [cellValueGetter]="iconGetter()">
    <mat-header-cell *matHeaderCellDef [columnWidth]="40"></mat-header-cell>
    <mat-filter-cell *matFilterCellDef></mat-filter-cell>
    <mat-cell *matCellDef reactiveIcon [iconType]="iconType()"></mat-cell>
    <mat-footer-cell *matFooterCellDef></mat-footer-cell>
  </ng-container>

   @for (column of columns(); track column) {
    <ng-container [matColumnDef]="column.name" csColumnDataDef [sticky]="column.sticky==='start'" [stickyEnd]="column.sticky==='end'"
        [cellValueGetter]="column.cellValueGetter" [cellValueSetter]="column.cellValueSetter"
        [cellFormatter]="(column.cellFormatter|csTranslateFromDictionary)()"
        [footerFormatter]="(column.footerFormatter|csTranslateFromDictionary)()" 
        [footerAggregation]="column.footerAggregation" [cellDefaultValue]="column.cellDefaultValue" 
        [footerDefaultValue]="column.footerDefaultValue" [dataKey]="(column.dataKey|csTranslateFromDictionary)()" 
        [readOnly]="column.readOnly" [label]="(column.headerText|csTranslateFromDictionary)()"
        [editorType]="column.editor?.type" [editorOptions]="column.editor?.options">
            <mat-header-cell *matHeaderCellDef [resizable]="column.resizable" [reordable]="column.reordable"
            [columnWidth]="column.width" [sortable]="column.sortable">{{(column.headerText|csTranslateFromDictionary)()}}
            </mat-header-cell>
            <mat-filter-cell *matFilterCellDef="column.filter?.type; options: column.filter?.options" cs-filter
            [defaultOperation]="column.filter?.initialOperation" [operations]="column.filter?.operations">
            </mat-filter-cell>
            @if(column.editor?.type){<mat-cell *matCellDef editable></mat-cell>}
            @else{<mat-cell *matCellDef reactive></mat-cell>}
            <mat-footer-cell *matFooterCellDef reactive></mat-footer-cell>
    </ng-container>
  }
            <mat-header-row *matHeaderRowDef="_displayedColumns();sticky:stickyHeader();"></mat-header-row>
            <mat-row *matRowDef="let row; columns: _displayedColumns();"></mat-row>
            <mat-filter-row *matFilterRowDef="_displayedColumns();sticky:stickyFilter();"></mat-filter-row>
            <div class="mat-row" *matNoDataRow>
                <div class="mat-cell cs-table-no-data-row">{{(noDataText()|csTranslate)()}}</div>
            </div>
            <mat-footer-row *matFooterRowDef="_displayedColumns();sticky:stickyFooter();"></mat-footer-row>
    `,
    imports: [
        MatTableModule, CSTableColumnResize, CSTableColumnDataDef, CSColumnEditorDef, CSColumnReordable,
        CSColumnSortable, CSTranslateFromDictionaryPipe, CODINUS_TABLE_CELLS, CSTableNavigatableCell,
        CODINUS_TABLE_FILTERS, CODINUS_TABLE_EDITORS, CSTranslatePipe, CSInteractiveRowDirective
    ]
})
export class CSDynamicColumnsComponent {
    private parentTable = inject(CSTableDirective);

    columnDefs = viewChildren(CdkColumnDef);
    headerRowDef = viewChild.required(CdkHeaderRowDef);
    filterRowDef = viewChild.required(CSCdkFilterRowDef);
    rowDef = viewChild.required(CdkRowDef);
    footerRowDef = viewChild.required(CdkFooterRowDef);
    noDataRowDef = viewChild.required(CdkNoDataRow);

    stickyHeader = computed(() => this.parentTable.stickyHeader());
    stickyFooter = computed(() => this.parentTable.stickyFooter());
    stickyFilter = computed(() => this.parentTable.stickyFilter());
    columns = computed(() => this.parentTable.columns());
    noDataText = computed(() => this.parentTable.noDataText());
    iconType = computed(() => this.parentTable.iconType());
    iconGetter = computed(() => {
        const iconGetter = this.parentTable.iconGetter();
        if (typeof iconGetter === 'function')
            return iconGetter;
        return undefined;
    });
    iConDataKey = computed(() => {
        const iconGetter = this.parentTable.iconGetter();
        if (typeof iconGetter === 'string')
            return iconGetter;
        return null;
    });

    _displayedColumns = computed(() => this.parentTable._displayedColumns());

}

@Directive({
    selector: `mat-table[cs-table]`,
    exportAs: 'csTable',
    host: { 'class': 'cs-table' },
    providers: [
        { provide: CSTableReorderColumns, useExisting: CSTableDirective },
    ]
})
export class CSTableDirective<TRecord> extends CSTableReorderColumnsBase {

    protected _cdkTable = inject(CdkTable, { self: true });
    protected _elementRef = inject(ElementRef);
    private _interactiveTable = inject(CSInteractiveTableDirective, { optional: true, self: true });

    private _headerFilterState = 0;

    columns = input<Array<ICSTableColumn<TRecord>>>([]);
    stickyHeader = input(true, { transform: booleanTrueAttribute });
    stickyFilter = input(true, { transform: booleanTrueAttribute });
    stickyFooter = input(true, { transform: booleanTrueAttribute });
    showIndex = input(true, { transform: booleanTrueAttribute });
    selectColumn = input('none', { transform: (v: Nullable<'after' | 'before' | 'none'>) => v || 'none' });
    iconColumn = input('none', { transform: (v: Nullable<'after' | 'before' | 'none'>) => v || 'none' });
    showHeader = input(true, { transform: booleanTrueAttribute });
    showFilter = input(true, { transform: booleanTrueAttribute });
    showFooter = input(false, { transform: booleanAttribute });
    noDataText = input<Nullable<string | IStringRecord>>("CodinusTable.NoData");
    iconType = input<CSIconType>();
    iconGetter = input<CSValueGetter<TRecord, string> | string | IStringRecord | ValueGetter<TRecord, string>>();

    get api() { return this._apiRegistrar?.getApi(); }

    /** @internal */
    _selectableEnabled = computed(() => this._interactiveTable?.selectable() != 'none' && this.selectColumn() != 'none');

    /** @internal */
    _renderVersion = signalVersion();

    constructor() {
        super();
        const providers = [{ provide: CSTableDirective, useValue: this }];
        const elementInjector = Injector.create({ providers, parent: inject(INJECTOR) });
        const environmentInjector = inject(EnvironmentInjector);
        const component = inject(ViewContainerRef).createComponent(CSDynamicColumnsComponent, { injector: elementInjector, environmentInjector });
        this._elementRef.nativeElement.appendChild(component.location.nativeElement);
        component.changeDetectorRef.detectChanges();

        effect(() => {
            const showHeader = this.showHeader();
            const showFilter = this.showFilter();

            const newState = (showHeader ? 1 : 0) + (showFilter ? 2 : 0);
            if (newState === this._headerFilterState)
                return;

            this._headerFilterState = newState;
            this._cdkTable.removeHeaderRowDef(component.instance.headerRowDef());
            this._cdkTable.removeHeaderRowDef(component.instance.filterRowDef());
            if (showHeader)
                this._cdkTable.addHeaderRowDef(component.instance.headerRowDef());
            if (showFilter)
                this._cdkTable.addHeaderRowDef(component.instance.filterRowDef());
        });

        effect(() => {
            if (this.showFooter())
                this._cdkTable.addFooterRowDef(component.instance.footerRowDef());
            else
                this._cdkTable.removeFooterRowDef(component.instance.footerRowDef());
        });

        this._cdkTable.addRowDef(component.instance.rowDef());
        this._cdkTable.setNoDataRow(component.instance.noDataRowDef());

        this._apiRegistrar?.register('metaRowDirective', new CSTableMetaRowModel(this));

        effect(() => {
            component.instance.columnDefs().forEach(c => this._cdkTable.addColumnDef(c));
        });

        effect(() => {
            this.columns();
            component.changeDetectorRef.detectChanges();
        });

    }

    /** @internal */
    _displayedColumns = computed(() => {
        this._renderVersion();
        const columnNames = this.columns()?.filter(c => !c.hidden).map((c, i) => ({ name: c.name, order: c.order ?? i }));
        let displayedColumns = arraySort(columnNames, c => c.order).map(c => c.name);

        if (this.iconColumn() === 'after')
            displayedColumns.push('icon-column');
        else if (this.iconColumn() === 'before')
            displayedColumns = ['icon-column', ...displayedColumns];

        if (this.showIndex())
            displayedColumns = ['row-index-column', ...displayedColumns];

        if (this._selectableEnabled()) {
            if (this.selectColumn() === 'after')
                displayedColumns.push('select-column');
            else
                displayedColumns = ['select-column', ...displayedColumns];
        }

        return displayedColumns;
    });

    protected override moveColumn(draggable: string[], previousIndex: number, currentIndex: number): void {
        const columns = this.columns();
        previousIndex = columns.findIndex(c => c.name === draggable[previousIndex]);
        currentIndex = columns.findIndex(c => c.name === draggable[currentIndex]);

        if (previousIndex < 0 || currentIndex < 0)
            return;

        const previousColumn = columns[previousIndex];
        const currentColumn = columns[currentIndex];

        const previousOrder = previousColumn.order ?? previousIndex;
        const currentOrder = currentColumn.order ?? currentIndex;

        previousColumn.order = currentOrder;
        currentColumn.order = previousOrder;
        this._renderVersion.refresh();
    }
}