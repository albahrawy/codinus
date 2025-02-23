import { Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { CSRowDataContextBase } from '../data/data-context.directive';
import { CSInteractiveTableDirective } from '../features';
@Component({
    selector: 'mat-cell[selectorCell],cdk-cell[selectorCell]',
    exportAs: 'csSelectColumn',
    host: {
        'class': 'cs-table-selector-cell',
        '(click)': '_toggle($event)'

    },
    template: `
        <div class="mdc-checkbox" [class.mdc-checkbox--disabled]="!selectionEnabled()" >
            <input type="checkbox" class="mdc-checkbox__native-control" [checked]="isSelected()" />
            <div class="mdc-checkbox__background" >
            <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24" aria-hidden="true">
                <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
            </svg>
            </div>
        </div>
    `,
    encapsulation: ViewEncapsulation.None,
})

export class CSTableSelectorCell<TRecord> extends CSRowDataContextBase<TRecord> {

    protected _interactiveTable = inject(CSInteractiveTableDirective, { optional: true });
    protected _toggle(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        if (this.selectionEnabled()) {
            this._interactiveTable?.toggle(this.rowData);
        }
    }

    protected isSelected = computed(() => {
        return this.selectionEnabled() && (this._interactiveTable?.isSelected(this.rowData) ?? false);
    });

    protected selectionEnabled = computed(() =>
        this._interactiveTable?.selectable() != 'none' && this.rowData != null);

}