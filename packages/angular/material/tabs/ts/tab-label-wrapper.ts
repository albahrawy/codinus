/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Directive, input } from '@angular/core';
import { MatTabLabelWrapper } from '@angular/material/tabs';
import { Nullable } from '@codinus/types';
import { CSTabOrientation } from './types';


declare module '@angular/material/tabs' {
    //@ts-expect-error call private
    interface MatTabLabelWrapper {
        _inkBarContentElement: HTMLElement | null;
    }
}

const ACTIVE_CLASS = 'mdc-tab-indicator--active';

/** Class that is applied when the tab indicator should not transition. */
const NO_TRANSITION_CLASS = 'mdc-tab-indicator--no-transition';

/**
 * Used in the `mat-tab-group` view to display tab labels.
 * @docs-private
 */
@Directive({
    selector: '[csTabLabelWrapper]',
    host: {
        '[class.mat-mdc-tab-disabled]': 'disabled',
        '[attr.aria-disabled]': '!!disabled',
    },
    providers: [{ provide: MatTabLabelWrapper, useExisting: CSTabLabelWrapper }]
})
export class CSTabLabelWrapper extends MatTabLabelWrapper {

    orientation = input('horizontal', { transform: (v: Nullable<CSTabOrientation>) => v || 'horizontal' });

    override activateInkBar(previousIndicatorClientRect?: DOMRect) {

        if (this.orientation() === 'horizontal')
            return super.activateInkBar(previousIndicatorClientRect);

        const element = this.elementRef.nativeElement;

        // Early exit if no indicator is present to handle cases where an indicator
        // may be activated without a prior indicator state
        if (
            !previousIndicatorClientRect ||
            !element.getBoundingClientRect ||
            !this._inkBarContentElement
        ) {
            element.classList.add(ACTIVE_CLASS);
            return;
        }

        // This animation uses the FLIP approach. You can read more about it at the link below:
        // https://aerotwist.com/blog/flip-your-animations/

        // Calculate the dimensions based on the dimensions of the previous indicator
        const currentClientRect = element.getBoundingClientRect();
        const heightDelta = previousIndicatorClientRect.height / currentClientRect.height;
        const yPosition = previousIndicatorClientRect.top - currentClientRect.top;
        element.classList.add(NO_TRANSITION_CLASS);
        this._inkBarContentElement.style.setProperty(
            'transform',
            `translateY(${yPosition}px) scaleY(${heightDelta})`,
        );

        // Force repaint before updating classes and transform to ensure the transform properly takes effect
        element.getBoundingClientRect();

        element.classList.remove(NO_TRANSITION_CLASS);
        element.classList.add(ACTIVE_CLASS);
        this._inkBarContentElement.style.setProperty('transform', '');
    }
}