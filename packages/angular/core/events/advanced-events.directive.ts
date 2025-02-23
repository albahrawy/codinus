import { DOCUMENT } from "@angular/common";
import { Directive, ElementRef, inject, input } from "@angular/core";
import { outputFromObservable, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { fromEvent } from "rxjs";
import { DragFilterFn, fromDragEvent, outOfNgZone } from "./functions";

@Directive({
    selector: '[csDraging],[csKeydown],[csLazyClick],[csClick]'
})
export class CSAdvancedEvents {

    private _elementRef = inject(ElementRef);
    private _document = inject(DOCUMENT);

    dragFilter = input<DragFilterFn>();
    captureOnlyDragStart = input(true);

    //csClick = outputFromObservable(fromEvent(this._elementRef.nativeElement, 'click').pipe(delay(0)));
    csClick = outputFromObservable(fromEvent<MouseEvent>(this._elementRef.nativeElement, 'click')
        .pipe(outOfNgZone(), takeUntilDestroyed()));
    csKeydown = outputFromObservable(fromEvent<KeyboardEvent>(this._elementRef.nativeElement, 'keydown')
        .pipe(outOfNgZone(), takeUntilDestroyed()));
    csDraging = outputFromObservable(fromDragEvent(this._elementRef.nativeElement, this._document, this.captureOnlyDragStart(), this.dragFilter()));
}