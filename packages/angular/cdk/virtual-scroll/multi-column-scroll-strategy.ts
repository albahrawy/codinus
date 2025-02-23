import { NumberInput } from '@angular/cdk/coercion';
import { CdkVirtualScrollViewport, VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Directive, effect, forwardRef, input, isDevMode } from '@angular/core';
import { toNumber } from '@codinus/js-extensions';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/** Virtual scrolling strategy for lists with multi columns items of known fixed size. */
export class MultiColumnsVirtualScrollStrategy implements VirtualScrollStrategy {
    private readonly _scrolledIndexChange = new Subject<number>();

    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    scrolledIndexChange: Observable<number> = this._scrolledIndexChange.pipe(distinctUntilChanged());

    /** The attached viewport. */
    private _viewport: CdkVirtualScrollViewport | null = null;

    /**
     * @param itemWidth The width of the items in the virtually scrolling list.
     * @param gap The size of the gap between the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    constructor(private itemWidth: number, private itemHeight: number,
        private columnGap: number, private rowGap: number,
        private minBufferPx: number, private maxBufferPx: number) {
    }

    /**
     * Attaches this scroll strategy to a viewport.
     * @param viewport The viewport to attach this strategy to.
     */
    attach(viewport: CdkVirtualScrollViewport) {
        this._viewport = viewport;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }

    /** Detaches this scroll strategy from the currently attached viewport. */
    detach() {
        this._scrolledIndexChange.complete();
        this._viewport = null;
    }

    /**
     * Update the item size and buffer size.
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    updateItemAndBufferSize(itemWidth: number, itemHeight: number, columnGap: number, rowGap: number,
        minBufferPx: number, maxBufferPx: number) {
        if (maxBufferPx < minBufferPx && isDevMode()) {
            throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
        }
        this.itemWidth = itemWidth;
        this.itemHeight = itemHeight;
        this.minBufferPx = minBufferPx;
        this.maxBufferPx = maxBufferPx;
        this.columnGap = columnGap;
        this.rowGap = rowGap;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }

    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentScrolled() {
        this._updateRenderedRange();
    }

    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onDataLengthChanged() {
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }

    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentRendered() {
        /* no-op */
    }

    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onRenderedOffsetChanged() {
        /* no-op */
    }

    /**
     * Scroll to the offset for the given index.
     * @param index The index of the element to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling.
     */
    scrollToIndex(index: number, behavior: ScrollBehavior): void {
        if (this._viewport) {
            const columnsPerRow = this.getColumnsPerRow();
            const requiredIndex = Math.ceil(index / columnsPerRow);
            this._viewport.scrollToOffset(requiredIndex * (this.itemHeight + this.rowGap), behavior);
        }
    }

    /** Update the viewport's total content size. */
    private _updateTotalContentSize() {
        if (!this._viewport) {
            return;
        }

        const columnsPerRow = this.getColumnsPerRow();
        const totalRows = Math.ceil(this._viewport.getDataLength() / columnsPerRow);
        const totalSize = totalRows * (this.itemHeight + this.rowGap);

        this._viewport.setTotalContentSize(totalSize);
    }

    private getColumnsPerRow() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const viewportWidth = this._viewport!.elementRef.nativeElement.clientWidth;
        let columnsPerRow = Math.floor(viewportWidth / (this.itemWidth + this.columnGap));
        const remaning = viewportWidth % (this.itemWidth + this.columnGap);
        if (remaning >= this.itemWidth)
            columnsPerRow++;
        return Math.max(1, columnsPerRow);
    }

    private _updateRenderedRange() {
        if (!this._viewport) return;

        const viewportElement = this._viewport.elementRef.nativeElement;
        const viewportHeight = viewportElement.clientHeight;

        const columnsPerRow = this.getColumnsPerRow();
        const totalItems = this._viewport.getDataLength();
        const totalRows = Math.ceil(totalItems / columnsPerRow);
        const rowHeight = this.itemHeight + this.rowGap;

        const scrollOffset = this._viewport.measureScrollOffset();
        const firstVisibleRow = Math.ceil(scrollOffset / rowHeight);
        const visibleRowCount = Math.ceil(viewportHeight / rowHeight);

        // Apply buffer
        const bufferRows = Math.ceil(this.maxBufferPx / rowHeight);
        const startRow = Math.max(0, firstVisibleRow - bufferRows);
        const endRow = Math.min(totalRows, firstVisibleRow + visibleRowCount + bufferRows);

        // Convert rows back to item indices
        const newRange = {
            start: startRow * columnsPerRow,
            end: Math.min(totalItems, endRow * columnsPerRow),
        };

        // Apply the new render range
        this._viewport.setRenderedRange(newRange);
        this._viewport.setRenderedContentOffset(startRow * rowHeight);
        this._scrolledIndexChange.next(newRange.start);
    }
}

/**
 * Provider factory for `MultiColumnsVirtualScrollStrategy` that simply extracts the already created
 * `MultiColumnsVirtualScrollStrategy` from the given directive.
 * @param fixedSizeDir The instance of `CdkMultiColumnsFixedSizeVirtualScroll` to extract the
 *     `MultiColumnsVirtualScrollStrategy` from.
 */
export function _multiColumnsFixedSizeVirtualScrollStrategyFactory(fixedSizeDir: CSMultiColumnsFixedSizeVirtualScroll) {
    return fixedSizeDir._scrollStrategy;
}

/** A virtual scroll strategy that supports fixed-size items. */
@Directive({
    selector: 'cdk-virtual-scroll-viewport[itemWidth][itemHeight]',
    providers: [
        {
            provide: VIRTUAL_SCROLL_STRATEGY,
            useFactory: _multiColumnsFixedSizeVirtualScrollStrategyFactory,
            deps: [forwardRef(() => CSMultiColumnsFixedSizeVirtualScroll)],
        },
    ],
})
export class CSMultiColumnsFixedSizeVirtualScroll {

    itemWidth = input(20, { transform: (value: NumberInput) => toNumber(value, 20) });
    itemHeight = input(20, { transform: (value: NumberInput) => toNumber(value, 20) });
    itemRowGap = input(0, { transform: (value: NumberInput) => toNumber(value, 0) });
    itemColumnGap = input(0, { transform: (value: NumberInput) => toNumber(value, 0) });
    minBufferPx = input(100, { transform: (value: NumberInput) => toNumber(value, 100) });
    maxBufferPx = input(200, { transform: (value: NumberInput) => toNumber(value, 200) });

    /** The scroll strategy used by this directive. */
    _scrollStrategy = new MultiColumnsVirtualScrollStrategy(
        this.itemWidth(),
        this.itemHeight(),
        this.itemColumnGap(),
        this.itemRowGap(),
        this.minBufferPx(),
        this.maxBufferPx()
    );

    /**
     *
     */
    constructor() {
        effect(() => {
            this._scrollStrategy.updateItemAndBufferSize(this.itemWidth(), this.itemHeight(),
                this.itemColumnGap(), this.itemRowGap(), this.minBufferPx(), this.maxBufferPx());
        });
    }
}