import { Component, computed } from "@angular/core";
import { getProperCssValue } from "@codinus/dom";
import { isNumber } from "@codinus/js-extensions";
import { createFlexMediaInfo, createMediaColumnProperty } from "./functions";
import { GridFlexContainerBase } from "./flex-grid.container-base";

@Component({
    selector: 'cs-flex-grid-container',
    template: '<div class="cs-flex-grid-container"><ng-content></ng-content></div>',
    host: {
        'class': 'cs-flex-grid-host',
        '[style.align-content]': 'flexAlign()',
        '[style.--cs-flex-grid-gap]': '_gaps().default',
        '[style.--cs-flex-grid-gap-xs]': '_gaps().xs',
        '[style.--cs-flex-grid-gap-sm]': '_gaps().sm',
        '[style.--cs-flex-grid-gap-md]': '_gaps().md',
        '[style.--cs-flex-grid-gap-lg]': '_gaps().lg',
        '[style.--cs-flex-grid-gap-xl]': '_gaps().xl',
        '[style.--cs-flex-grid-gap-sl]': '_gaps().sl',
        '[style.--cs-flex-grid-columns]': '_columns().default',
        '[style.--cs-flex-grid-columns-xs]': '_columns().xs',
        '[style.--cs-flex-grid-columns-sm]': '_columns().sm',
        '[style.--cs-flex-grid-columns-md]': '_columns().md',
        '[style.--cs-flex-grid-columns-lg]': '_columns().lg',
        '[style.--cs-flex-grid-columns-xl]': '_columns().xl',
        '[style.--cs-flex-grid-columns-sl]': '_columns().sl',
    }
})
export class CSGridFlexContainer extends GridFlexContainerBase {


    /**
     * gap size for container available width. 
     * available format: (default) or (default,sm) or (default,sm,lg) or (default,xs,sm,md,lg,xl,sl)
     */
    protected _gaps = computed(() => createFlexMediaInfo(this.flexGap(), _getCssGap));

    /**
     * columns count for container available width. 
     * available format: (default) or (default,sm) or (default,sm,lg) or (default,xs,sm,md,lg,xl,sl)
     */
    protected _columns = computed(() => createMediaColumnProperty(this.flexColumns()));
}

function _getCssGap(gap?: string | null | undefined) {
    const cssGap = isNumber(gap) ?
        gap + '%' :
        typeof gap === 'string' ?
            gap.split(' ').slice(0, 2).map(g => g.trim()).map(g => getProperCssValue(g)).join(' ').trim()
            : 'unset';
    return cssGap;
}