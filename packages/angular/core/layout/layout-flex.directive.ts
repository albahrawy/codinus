import { Directive, ElementRef, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { getCssSizeBreakpoint, getProperCssValue } from "@codinus/dom";
import { isNumber } from "@codinus/js-extensions";
import { EMPTY } from "rxjs";
import { createFlexMediaInfo } from "./functions";
import { LayoutFlexContainerBaseDirective } from "./layout-flex-base.directive";
import { CODINUS_ELEMENT_RESIZE_OBSERVER } from "./types";


@Directive({
    selector: ':not(cs-form-area-panel):not(cs-form-area)[layout-flex]',
    host: {
        'class': 'layout-flex-container',
        '[attr.layout-flex-container]': '_currentBreakpoint()',
        '[attr.layout-flex]': 'flexLayout()',
        '[attr.layout-flex-align]': 'flexAlign()',
        '[class.--flex-limit]': 'flexLimit()',
        '[class.--has-flex-gap]': 'hasGap()',
        '[style.--layout-flex-gap]': 'gaps().default',
        '[style.--layout-flex-gap-xs]': 'gaps().xs',
        '[style.--layout-flex-gap-sm]': 'gaps().sm',
        '[style.--layout-flex-gap-md]': 'gaps().md',
        '[style.--layout-flex-gap-lg]': 'gaps().lg',
        '[style.--layout-flex-gap-xl]': 'gaps().xl',
        '[style.--layout-flex-gap-sl]': 'gaps().sl',
    }
})
export class LayoutFlexDirective extends LayoutFlexContainerBaseDirective {

    private _resizeObserverService = inject(CODINUS_ELEMENT_RESIZE_OBSERVER, { optional: true });
    private elementRef = inject(ElementRef);

    private _widthSignal = toSignal(this._resizeObserverService?.widthResizeObservable(this.elementRef.nativeElement) ?? EMPTY);

    /**
     * gap size for container available width. 
     * available format: (default) or (default,sm) or (default,sm,lg) or (default,xs,sm,md,lg,xl,sl)
     */
    protected gaps = computed(() => createFlexMediaInfo(this.flexgap(), _getCssGap));
    protected hasGap = computed(() => Object.values(this.gaps()).some(k => k !== 'initial'));
    protected _currentBreakpoint = computed(() => getCssSizeBreakpoint(this._widthSignal()) ?? 'none');
}


function _getCssGap(gap?: string | null | undefined) {
    const cssGap = isNumber(gap) ?
        gap + '%' :
        typeof gap === 'string' ?
            gap.split(' ').slice(0, 2).map(g => g.trim()).map(g => getProperCssValue(g)).join(' ').trim()
            : 'initial';
    return cssGap;
}