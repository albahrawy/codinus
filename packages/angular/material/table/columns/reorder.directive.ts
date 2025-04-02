import { coerceElement } from '@angular/cdk/coercion';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Directive, ElementRef, OnDestroy, booleanAttribute, effect, inject, input, untracked } from '@angular/core';
import { IAction } from '@codinus/types';
import { forceInputSet } from '@ngx-codinus/core/shared';
import { CODINUS_TABLE_API_REGISTRAR } from '../api';

@Directive({
    hostDirectives: [CdkDropList],
    host: { 'class': 'cs-table-reorder-columns' },
})
export abstract class CSTableReorderColumnsBase implements OnDestroy {

    readonly elementRef = inject(ElementRef);
    protected dropList = inject(CdkDropList, { self: true });
    protected _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });
    private remove: IAction | null = null;

    protected abstract moveColumn(draggable: string[], previousIndex: number, currentIndex: number): void;

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
                this.dropList.sortPredicate = this._sortPredicate;
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

    private _sortPredicate = (index: number, drag: CdkDrag, drop: CdkDropList) => {
        const dropped = drop.getSortedItems()[index];
        return !dropped?.disabled;
    };

    reorderColumns = input(false, { transform: booleanAttribute });

    getReorder() { return untracked(() => this.reorderColumns()); }
    setReorder(value: boolean) { forceInputSet(this.reorderColumns, value); }

    private _onDrop(event: CdkDragDrop<unknown>) {
        if (event.container != event.previousContainer)
            return;
        this._applyTransform(false);
        const draggable = event.container.getSortedItems().map(i => i.data);
        this.moveColumn(draggable, event.previousIndex, event.currentIndex);
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

    protected moveColumnCore(columns: string[], draggable: string[], previousIndex: number, currentIndex: number): boolean {
        previousIndex = columns.indexOf(draggable[previousIndex]);
        currentIndex = columns.indexOf(draggable[currentIndex]);

        if (previousIndex < 0 || currentIndex < 0)
            return false;

        moveItemInArray(columns, previousIndex, currentIndex);
        return true;
    }

    ngOnDestroy(): void {
        this.remove?.();
    }
}

@Directive({
    selector: `mat-table:not([cs-table]):not([csTableFormInput])[reorderColumns], 
               cdk-table:not([cs-table]):not([csTableFormInput])[reorderColumns]`,
    exportAs: 'reorderColumns',
})
export class CSCDKTableReorderColumns extends CSTableReorderColumnsBase {
    displayedColumns = input<string[]>([]);

    protected override moveColumn(draggable: string[], previousIndex: number, currentIndex: number): void {
        this.moveColumnCore(this.displayedColumns(), draggable, previousIndex, currentIndex);
    }
}