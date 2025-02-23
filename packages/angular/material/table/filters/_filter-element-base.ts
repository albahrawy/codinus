import { computed, Directive, ElementRef, inject } from '@angular/core';
import { noopFn, Nullable } from '@codinus/types';
import { CSTableFilterPredicates, ICSTableFilterElement, ValueConverterFactoryFn } from '../shared/types';
import { CSCdkFilterCellDef } from './filter-def.directive';

@Directive({
    host: { 'class': 'cs-table-cell-filter-element' },
})
export abstract class CSTableFilterElementBase<TValue = unknown, TOptions = unknown>
    implements ICSTableFilterElement<TValue> {

    protected elementRef: ElementRef<HTMLElement> = inject(ElementRef);
    protected readonly _filterCellDef = inject(CSCdkFilterCellDef);

    abstract readonly predicates: CSTableFilterPredicates<TValue>;
    abstract readonly defaultOperation: string;

    valueConverterFactory: ValueConverterFactoryFn<TValue> = null;

    changeFilter = noopFn;
    clearFilter = noopFn;

    protected options = computed(() => (this._filterCellDef.options() ?? {}) as TOptions);

    registerClearFilter(fn: () => void): void {
        this.clearFilter = fn;
    }

    registerChangeFilter(fn: (value: unknown) => void): void {
        this.changeFilter = fn;
    }

    protected onValueChange(value?: TValue | null) {
        if (this.isValueEmpty(value))
            this.clearFilter();
        else
            this.changeFilter(value);
    }

    protected abstract isValueEmpty(value: Nullable<TValue>): boolean;
}