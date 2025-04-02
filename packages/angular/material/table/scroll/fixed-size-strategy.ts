/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */
import { FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY } from "@angular/cdk/scrolling";
import { computed, Directive, effect, forwardRef, input, numberAttribute } from "@angular/core";


@Directive({
    selector: `cdk-table:not([responsive])[virtual-scroll][rowHeight], 
               mat-table:not([responsive])[virtual-scroll][rowHeight],
               mat-table:not([responsive]):not([virtual-scroll])[cs-table-tree][rowHeight],
               cdk-table:not([responsive]):not([virtual-scroll])[cs-table-tree][rowHeight]
               `,
    host: {
        'class': 'cs-fixed-size-virtual-scroll-table',
        '[style.--cs-table-row-height.px]': 'rowHeight()'
    },
    providers: [
        {
            provide: VIRTUAL_SCROLL_STRATEGY,
            useFactory: (fixedSizeDir: CSTableFixedSizeVirtualScroll) => fixedSizeDir._scrollStrategy,
            deps: [forwardRef(() => CSTableFixedSizeVirtualScroll)],
        },
    ],
})
export class CSTableFixedSizeVirtualScroll {

    rowHeight = input(40, { transform: numberAttribute });
    // minBufferPx = input(100, { transform: numberAttribute });
    // maxBufferPx = input(200, { transform: numberAttribute });

    private _minBufferPx = computed(() => this.rowHeight() * 8);

    private _maxBufferPx = computed(() => this.rowHeight() * 8 * 2);

    /**
     *
     */
    constructor() {
        effect(() => this._scrollStrategy.
            updateItemAndBufferSize(this.rowHeight(), this._minBufferPx(), this._maxBufferPx()));
    }

    /** The scroll strategy used by this directive. */
    _scrollStrategy = new FixedSizeVirtualScrollStrategy(this.rowHeight(), this._minBufferPx(), this._maxBufferPx());
}