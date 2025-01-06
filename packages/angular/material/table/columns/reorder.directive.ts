import { coerceElement } from '@angular/cdk/coercion';
import { CDK_DROP_LIST, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Directive, OnDestroy, booleanAttribute, effect, forwardRef, inject, input, untracked } from '@angular/core';
import { IAction } from '@codinus/types';
import { forceInputSet } from '@ngx-codinus/core/shared';
import { CODINUS_TABLE_API_REGISTRAR } from '../api';

@Directive({
    selector: 'mat-table[reorderColumns], cdk-table[reorderColumns]',
    hostDirectives: [CdkDropList],
    exportAs: 'reorderColumns',
    host: { 'class': 'cs-table-reorder-columns' },
    providers: [{
        provide: CDK_DROP_LIST,
        useFactory: (parent: CSTableReorderColumns) => parent.dropList,
        deps: [forwardRef(() => CSTableReorderColumns)],
    }]
})
export class CSTableReorderColumns implements OnDestroy {
    private dropList = inject(CdkDropList, { self: true });
    private _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });
    private remove: IAction | null = null;

    constructor() {
        this._apiRegistrar?.register('reorderDirective', this);
        this.dropList.orientation = 'horizontal';
        this.dropList.lockAxis = 'x';

        effect(() => {
            const enabled = this.reorderColumns();
            this.dropList.disabled = !enabled;
            if (enabled) {
                const droppedSub = this.dropList.dropped.subscribe(d => this._onDrop(d));
                const sortedSub = this.dropList.sorted.subscribe(() => this._applyTransform(true));
                this.remove = () => {
                    droppedSub.unsubscribe();
                    sortedSub.unsubscribe();
                    this.remove = null;
                }
            } else if (this.remove) {
                this.remove();
            }
        });
    }

    displayedColumns = input<string[]>([]);
    reorderColumns = input(false, { transform: booleanAttribute });

    getReorder() { return untracked(() => this.reorderColumns()); }
    setReorder(value: boolean) { forceInputSet(this.reorderColumns, value); }

    private _onDrop(event: CdkDragDrop<unknown>) {
        const columns = this.displayedColumns();
        const draggable = event.container.getSortedItems().map(i => i.data);
        const previousIndex = columns.indexOf(draggable[event.previousIndex]);
        const currentIndex = columns.indexOf(draggable[event.currentIndex]);
        this._applyTransform(false);
        if (previousIndex < 0 || currentIndex < 0)
            return;
        moveItemInArray(columns, previousIndex, currentIndex);
    }

    private _applyTransform(add: boolean): void {
        const siblings = this.dropList.getSortedItems();
        siblings.forEach(sibling => {
            const columnName = sibling._dragRef.data.data;
            if (add) {
                const transform = sibling._dragRef.getVisibleElement().style.transform
                if (transform)
                    coerceElement(this.dropList.element).style.setProperty(`--cs-${columnName}-drag-transform`, transform);
            } else {
                coerceElement(this.dropList.element).style.removeProperty(`--cs-${columnName}-drag-transform`);
            }
        });
    }

    ngOnDestroy(): void {
        this.remove?.();
    }
}
