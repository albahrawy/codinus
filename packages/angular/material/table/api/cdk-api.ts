import { CdkTable, RowOutlet } from "@angular/cdk/table";
import { QueryList } from "@angular/core";
import { CSTableResponsive, EditablePredicate, ICSTableApi, ICSTableApiRegistrar, ICSTableApiSelectModel } from "./types";

export class CSTableApi<TRow> implements ICSTableApi<TRow> {

    constructor(
        private readonly _cdkTable: CdkTable<TRow>,
        private readonly registrar: ICSTableApiRegistrar<TRow>) {
    }

    get showHeader() { return this.registrar.metaRowDirective?.getVisibility('header') ?? false; }
    set showHeader(value: boolean) { this.registrar.metaRowDirective?.setVisibility('header', value); }

    get showFilter() { return this.registrar.metaRowDirective?.getVisibility('filter') ?? false; }
    set showFilter(value: boolean) { this.registrar.metaRowDirective?.setVisibility('filter', value); }

    get showFooter() { return this.registrar.metaRowDirective?.getVisibility('footer') ?? false; }
    set showFooter(value: boolean) { this.registrar.metaRowDirective?.setVisibility('footer', value); }

    get reorderColumns() { return this.registrar.reorderDirective?.getReorder() ?? false; }
    set reorderColumns(value: boolean) { this.registrar.reorderDirective?.setReorder(value); }

    get sortable(): boolean { return this.registrar.sortableDirective?.sortable ?? false; }
    set sortable(value: boolean) {
        if (this.registrar.sortableDirective)
            this.registrar.sortableDirective.sortable = value;
    }

    get editable(): boolean { return this.registrar.editableDirective?.editable ?? false; }
    set editable(value: boolean) {
        if (this.registrar.editableDirective)
            this.registrar.editableDirective.editable = value;
    }

    get commitOnDestroy(): boolean { return this.registrar.editableDirective?.commitOnDestroy ?? false; }
    set commitOnDestroy(value: boolean) {
        if (this.registrar.editableDirective)
            this.registrar.editableDirective.commitOnDestroy = value;
    }

    get editWithF2(): boolean { return this.registrar.editableDirective?.editWithF2 ?? false; }
    set editWithF2(value: boolean) {
        if (this.registrar.editableDirective)
            this.registrar.editableDirective.editWithF2 = value;
    }

    get editWithEnter(): boolean { return this.registrar.editableDirective?.editWithEnter ?? false; }
    set editWithEnter(value: boolean) {
        if (this.registrar.editableDirective)
            this.registrar.editableDirective.editWithEnter = value;
    }

    get editablePredicate(): EditablePredicate { return this.registrar.editableDirective?.editablePredicate; }
    set editablePredicate(value: EditablePredicate) {
        if (this.registrar.editableDirective)
            this.registrar.editableDirective.editablePredicate = value;
    }

    get responsive(): CSTableResponsive { return this.registrar.tableApiResponsive?.getResponsive(); }
    set responsive(value: CSTableResponsive) {
        this.registrar.tableApiResponsive?.setResponsive(value);
    }

    get selectionModel(): ICSTableApiSelectModel<TRow> | undefined { return this.registrar.tableApiSelectModel; }
    get renderedRange() { return this.registrar.tableApiScrollable?.renderedRange; }

    getData(): TRow[] | null {
        return this.registrar.dataSourceDirective?.getData() ?? null;
    }

    // getRenderedData(): TRow[] | null {
    //     return this.registrar.dataSourceDirective?.getRenderedData() ?? null;
    // }

    addRecord(options?: { index?: number, scroll?: boolean }) {
        this.addRecords(1, options);
    }

    addRecords(records?: TRow[] | number, options?: { index?: number, scroll?: boolean }) {
        this.registrar.dataSourceDirective?.addRecords(records, options);
    }

    removeSelected(selectPrevious = true) {
        const records = this.selectionModel?.getSelectedRows();
        if (records)
            this.removeRecords(records, selectPrevious);
    }

    removeRecords(predicate: TRow[] | number | ((row: TRow) => boolean), selectPrevious?: boolean) {
        this.registrar.dataSourceDirective?.removeRecords(predicate, selectPrevious);
    }

    notifyChanged(): void {
        this.registrar.dataSourceDirective?.notifyChanged();
    }

    aggregate<T = unknown>(key: string, type: 'sum' | 'max' | 'min' | 'count' | 'avg' | 'first' | 'last'): T {
        return this.registrar.dataSourceDirective?.aggregate(key, type) as T;
    }

    refreshAggregation(key?: string): void {
        this.registrar.dataSourceDirective?.refreshAggregation(key);
    }

    scrollToOffset(offset: number, behavior?: ScrollBehavior): void {
        this.registrar.tableApiScrollable?.scrollToOffset(offset, behavior);
    }
    /**
     * Scrolls to the offset for the given index.
     * @param index The index of the element to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling. Default is behavior is `auto`.
     */
    scrollToIndex(index: number, behavior?: ScrollBehavior): void {
        this.registrar.tableApiScrollable?.scrollToIndex(index, behavior);
    }

    scrollToStart(behavior?: ScrollBehavior): void {
        this.registrar.tableApiScrollable?.scrollToStart(behavior);
    }

    scrollToEnd(behavior?: ScrollBehavior): void {
        this.registrar.tableApiScrollable?.scrollToEnd(behavior);
    }

    getMetRowsHeight() {
        return this._calculateMetaRowHeight(this._cdkTable._contentHeaderRowDefs, this._cdkTable._headerRowOutlet)
            + this._calculateMetaRowHeight(this._cdkTable._contentFooterRowDefs, this._cdkTable._footerRowOutlet);

    }

    getResponsiveHeight(): number {
        return (!this.registrar.tableApiResponsive?.getResponsive())
            ? 0
            : this.registrar.tableApiResponsiveStrategy?.domRowHeight() ?? 0;
    }

    private _calculateMetaRowHeight(_contentRowDefs: QueryList<unknown>, rowOutlet: RowOutlet) {
        if (!_contentRowDefs?.length)
            return 0;
        const rows = this._cdkTable._getRenderedRows(rowOutlet);
        return rows.reduce((acc, o) => acc + o.clientHeight, 0);
    }
}