import { Component, computed, inject } from "@angular/core";
import { CSRowDataContextBase } from "../data/data-context.directive";
import { CSTableVirtualScrollable } from "../scroll";
import { CODINUS_DATA_SOURCE_DIRECTIVE } from "../data";

@Component({
    selector: 'mat-cell[indexCell],cdk-cell[indexCell]',
    template: `<span class="cs-table-cell-text">{{displayIndex()}}</span>`,
})
export class CSTableIndexCell<TRecord> extends CSRowDataContextBase<TRecord> {
    private _scrollable = inject(CSTableVirtualScrollable, { optional: true });
    private dataSourceDirective = inject(CODINUS_DATA_SOURCE_DIRECTIVE);

    protected displayIndex = computed(() => {
        this.dataSourceDirective.getData();
        return 1 + (this._scrollable?.renderedRange?.start ?? 0) + (this.rowContext.index ?? 0);
    });
}