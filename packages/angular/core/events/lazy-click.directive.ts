import { Directive, ElementRef, inject } from "@angular/core";
import { outputFromObservable } from "@angular/core/rxjs-interop";
import { delay, fromEvent } from "rxjs";

@Directive({
    selector: '[lazyClick]'
})
export class CSLazyClick {

    private _elementRef = inject(ElementRef);
    lazyClick = outputFromObservable(fromEvent(this._elementRef.nativeElement, 'click').pipe(delay(0)));
}