import { Directive, booleanAttribute, inject, input, output } from "@angular/core";
import { outputFromObservable } from "@angular/core/rxjs-interop";
import { Subject, debounceTime } from "rxjs";
import { CODINUS_DATA_SOURCE_DIRECTIVE } from "../data/types";
import { ICSCellFilterChangedArgs, ICSTableFilterArgs } from "../shared/types";

@Directive({
    selector: `
        cdk-table[attachFilter],
        mat-table[attachFilter]
    `,
})
export class CSTableFilterEvents {

    private _filterPredicates: Map<string, (data: unknown) => boolean> = new Map();
    private dataSourceDirective = inject(CODINUS_DATA_SOURCE_DIRECTIVE, { optional: true });

    private _filters: Map<string, string> = new Map();
    private readonly _debounceSubject = new Subject<ICSTableFilterArgs>();

    attachFilter = input(false, { transform: booleanAttribute });
    filterChanged = outputFromObservable(this._debounceSubject.pipe(debounceTime(200)));
    filterCleared = output();

    clearFilter(key: string) {
        this._filterPredicates.delete(key);
        this._filters.delete(key);
        this._emitEvent('clear', key);
    }

    changeFilter(args: ICSCellFilterChangedArgs) {
        this._filterPredicates.set(args.key, args.predicate);
        this._filters.set(args.key, args.filter);
        this._emitEvent('change', args);
    }

    private _emitEvent(reason: 'clear', key: string): void;
    private _emitEvent(reason: 'change', cellArgs: ICSCellFilterChangedArgs): void;
    private _emitEvent(reason: 'clear' | 'change', cellArgs: string | ICSCellFilterChangedArgs): void {
        if (this._filters.size == 0) {
            setTimeout(() => this._onFilterCleared());
            return;
        }

        const filter = Array.from(this._filters.values()).join(' and ');
        const predicate = (data: unknown) =>
            Array.from(this._filterPredicates.values()).every(p => p(data));
        this._onFilterChanged({ reason, predicate, cellArgs, filter } as ICSTableFilterArgs);
    }

    private _onFilterCleared() {
        this.filterCleared.emit();
        if (this.attachFilter() && this.dataSourceDirective) {
            this.dataSourceDirective.clearFilter();
        }
    }

    private _onFilterChanged(args: ICSTableFilterArgs) {
        this._debounceSubject.next(args);
        if (this.attachFilter() && this.dataSourceDirective) {
            this.dataSourceDirective.setFilter(args.predicate, args.filter);
        }
    }
}