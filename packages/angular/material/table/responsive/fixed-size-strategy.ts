/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */
import { FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY } from "@angular/cdk/scrolling";
import { Directive, computed, effect, forwardRef, inject, input, numberAttribute } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { CODINUS_TABLE_API_REGISTRAR } from "../api";
import { CSTableResponsiveView } from "./responsive-view";


@Directive({
    selector: 'cdk-table[responsive][virtual-scroll], mat-table[responsive][virtual-scroll]',
    host: {
        'class': 'cs-fixed-size-virtual-scroll-table',
        '[style.--cs-table-row-height.px]': 'domRowHeight()',
        '[style.--cs-table-responsive-cell-height.px]': 'cellHeight()'
    },
    providers: [
        // { provide: CSTableResponsiveView, useExisting: CSTableResponsiveVirtualScroll },
        {
            provide: VIRTUAL_SCROLL_STRATEGY,
            useFactory: (fixedSizeDir: CSTableResponsiveVirtualScroll) => fixedSizeDir._scrollStrategy,
            deps: [forwardRef(() => CSTableResponsiveVirtualScroll)],
        },
    ],
})
export class CSTableResponsiveVirtualScroll {
    private _responsiveView = inject(CSTableResponsiveView, { self: true });
    protected _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });

    private _currentView = toSignal(this._responsiveView.viewChanged, { initialValue: { cells: 0, columns: 0 } });

    constructor() {
        this._apiRegistrar?.register('tableApiResponsiveStrategy', this);
        effect(() => this._scrollStrategy.updateItemAndBufferSize(this.domRowHeight(), this._minBufferPx(), this._maxBufferPx()));
    }

    domRowHeight = computed(() => {
        const args = this._currentView();
        return this.cellHeight() * (args.columns ? args.cells : 1);
    });

    private _minBufferPx = computed(() => {
        const args = this._currentView();
        return this.domRowHeight() * 8 * (args.columns ? args.cells : 1);
    });

    private _maxBufferPx = computed(() => {
        const args = this._currentView();
        return this.domRowHeight() * 8 * 2 * (args.columns ? args.cells : 1);
    });

    cellHeight = input(40, { transform: numberAttribute });
    // minBufferPx = input(100, { transform: numberAttribute });
    // maxBufferPx = input(300, { transform: numberAttribute });


    /** The scroll strategy used by this directive. */
    _scrollStrategy = new FixedSizeVirtualScrollStrategy(this.domRowHeight(), this._minBufferPx(), this._maxBufferPx());

    // protected override onViewChanged(arg: ICSTableResponsiveArgs): void {
    //     super.onViewChanged(arg);
    //     this._currentView.set(arg);
    // }
}