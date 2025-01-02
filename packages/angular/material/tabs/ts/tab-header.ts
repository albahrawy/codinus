import { CdkObserveContent } from '@angular/cdk/observers';
import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, input } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { MatTabHeader, ScrollDirection } from '@angular/material/tabs';
import { Nullable } from '@codinus/types';
import { CSTabOrientation } from './types';

@Component({
    selector: 'cs-tab-header',
    templateUrl: '../html/tab-header.html',
    styleUrl: '../scss/tab-header.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [MatRipple, CdkObserveContent],
})
export class CSTabHeader extends MatTabHeader {

    orientation = input('horizontal', { transform: (v: Nullable<CSTabOrientation>) => v || 'horizontal' });

    private platform = inject(Platform);

    private _effect = effect(() => {
        this.orientation();
        if (this.selectedIndex) {
            if (this.selectedIndex) {
                this._scrollToLabel(this.selectedIndex);
            }
        }
    });

    override _getMaxScrollDistance(): number {
        if (this.orientation() === 'horizontal')
            return super._getMaxScrollDistance();

        const lengthOfTabList = this._tabListInner.nativeElement.scrollHeight;
        const viewLength = this._tabListContainer.nativeElement.offsetHeight;
        return lengthOfTabList - viewLength || 0;
    }

    override _checkPaginationEnabled() {

        if (this.orientation() === 'horizontal')
            return super._checkPaginationEnabled();

        if (this.disablePagination) {
            this._showPaginationControls = false;
        } else {
            const scrollHeight = this._tabListInner.nativeElement.scrollHeight;
            const containerHeight = this._elementRef.nativeElement.offsetHeight;

            // Usually checking that the scroll width is greater than the container width should be
            // enough, but on Safari at specific widths the browser ends up rounding up when there's
            // no pagination and rounding down once the pagination is added. This can throw the component
            // into an infinite loop where the pagination shows up and disappears constantly. We work
            // around it by adding a threshold to the calculation. From manual testing the threshold
            // can be lowered to 2px and still resolve the issue, but we set a higher one to be safe.
            // This shouldn't cause any content to be clipped, because tabs have a 24px horizontal
            // padding. See b/316395154 for more information.
            const isEnabled = scrollHeight - containerHeight >= 5;

            if (!isEnabled) {
                this.scrollDistance = 0;
            }

            if (isEnabled !== this._showPaginationControls) {
                this._showPaginationControls = isEnabled;
                this._changeDetectorRef.markForCheck();
            }
        }
    }

    override _scrollHeader(direction: ScrollDirection) {
        if (this.orientation() === 'horizontal')
            return super._scrollHeader(direction);


        const viewLength = this._tabListContainer.nativeElement.offsetHeight;

        // Move the scroll distance one-third the length of the tab list's viewport.
        const scrollAmount = ((direction == 'before' ? -1 : 1) * viewLength) / 3;

        //@ts-expect-error call private members
        return this._scrollTo(this.scrollDistance + scrollAmount);
    }

    override _updateTabScrollPosition() {

        if (this.orientation() === 'horizontal')
            return super._updateTabScrollPosition();

        if (this.disablePagination) {
            return;
        }

        const scrollDistance = this.scrollDistance;
        this._tabList.nativeElement.style.transform = `translateY(${Math.round(-scrollDistance)}px)`;

        // Setting the `transform` on IE will change the scroll offset of the parent, causing the
        // position to be thrown off in some cases. We have to reset it ourselves to ensure that
        // it doesn't get thrown off. Note that we scope it only to IE and Edge, because messing
        // with the scroll position throws off Chrome 71+ in RTL mode (see #14689).
        if (this.platform.TRIDENT || this.platform.EDGE) {
            this._tabListContainer.nativeElement.scrollTop = 0;
        }
    }

    override _scrollToLabel(labelIndex: number) {
        if (this.disablePagination) {
            return;
        }

        if (this.orientation() === 'horizontal')
            return super._scrollToLabel(labelIndex);

        const selectedLabel = this._items ? this._items.toArray()[labelIndex] : null;

        if (!selectedLabel) {
            return;
        }

        // The view length is the visible width of the tab labels.
        const viewLength = this._tabListContainer.nativeElement.offsetHeight;
        const { offsetTop, offsetHeight } = selectedLabel.elementRef.nativeElement;

        const labelBeforePos = offsetTop;
        const labelAfterPos = labelBeforePos + offsetHeight;

        const beforeVisiblePos = this.scrollDistance;
        const afterVisiblePos = this.scrollDistance + viewLength;

        if (labelBeforePos < beforeVisiblePos) {
            // Scroll header to move label to the before direction
            this.scrollDistance -= beforeVisiblePos - labelBeforePos;
        } else if (labelAfterPos > afterVisiblePos) {
            // Scroll header to move label to the after direction
            this.scrollDistance += Math.min(
                labelAfterPos - afterVisiblePos,
                labelBeforePos - beforeVisiblePos,
            );
        }
    }

    override _setTabFocus(tabIndex: number) {

        if (this.orientation() === 'horizontal')
            return super._setTabFocus(tabIndex);

        if (this._showPaginationControls) {
            this._scrollToLabel(tabIndex);
        }

        if (this._items && this._items.length) {
            this._items.toArray()[tabIndex].focus();

            // Do not let the browser manage scrolling to focus the element, this will be handled
            // by using translation. In LTR, the scroll left should be 0. In RTL, the scroll width
            // should be the full width minus the offset width.
            const containerEl = this._tabListContainer.nativeElement;
            containerEl.scrollTop = 0;
        }
    }
}