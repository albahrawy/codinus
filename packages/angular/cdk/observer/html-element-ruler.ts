import { Directive, ElementRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CODINUS_ELEMENT_RESIZE_OBSERVER } from "@ngx-codinus/core/layout";
import { CSElementResizeObserverService } from "./resize-observer.service";

@Directive()
export class HtmlElementRuler {

    private _elementRef = inject(ElementRef);
    private _resizeObserverService = inject(CODINUS_ELEMENT_RESIZE_OBSERVER, { optional: true }) ??
        inject(CSElementResizeObserverService);

    private readonly _resizeObserver = this._resizeObserverService
        .resizeObservable(this._elementRef.nativeElement)
        .pipe(takeUntilDestroyed());

    change() {
        return this._resizeObserver;
    }
}