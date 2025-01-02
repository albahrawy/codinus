import { Directive, ElementRef, inject, output } from "@angular/core";

const allowedButtons = [0, 1, 5];

export interface PointerEventArgs {
    event: PointerEvent;
    type: 'up' | 'down' | 'move';
}

@Directive({
    selector: 'svg[pointerEvent]',
    host: {
        '(pointerdown)': 'onPointerDown($event)',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerup)': 'onPointerUp($event)'
    }
})
export class SvgEventsDirective {

    private _elementRef = inject(ElementRef);
    private lastPoint: { x: number, y: number } | null = null;

    pointerEvent = output<PointerEventArgs>();

    onPointerDown(event: PointerEvent) {
        if (!allowedButtons.includes(event.button))
            return;

        this._elementRef.nativeElement.setPointerCapture(event.pointerId);
        this.pointerEvent.emit({ event, type: 'down' });
    }

    onPointerMove(event: PointerEvent) {
        if (event.clientX === this.lastPoint?.x && event.clientY === this.lastPoint?.y)
            return;
        this.lastPoint = { x: event.clientX, y: event.clientY };
        this.pointerEvent.emit({ event, type: 'move' });
    }

    onPointerUp(event: PointerEvent) {
        if (!allowedButtons.includes(event.button))
            return;
        this.lastPoint = { x: event.clientX, y: event.clientY };

        if (this._elementRef.nativeElement.hasPointerCapture(event.pointerId))
            this._elementRef.nativeElement?.releasePointerCapture(event.pointerId);

        this.pointerEvent.emit({ event, type: 'up' });
    }
}