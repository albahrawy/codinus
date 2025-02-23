import { inject, NgZone } from "@angular/core";
import { filter, fromEvent, merge, Observable, OperatorFunction, pipe, switchMap, take, takeUntil } from "rxjs";

export type EventPoint = { y: number, x: number };

export type DragFilterFn = (startEvent: MouseEvent | TouchEvent, moveEvent: MouseEvent | TouchEvent, target: HTMLElement) => boolean;

export function fromMouseDownEvent(target: HTMLElement | Document) {
    return merge(
        fromEvent<MouseEvent>(target, 'mousedown').pipe(filter((e) => e.button === 0)),
        fromEvent<TouchEvent>(target, 'touchstart', { passive: false }),
    );
}

export function fromMouseMoveEvent(target: HTMLElement | Document) {
    return merge(fromEvent<MouseEvent>(target, 'mousemove'), fromEvent<TouchEvent>(target, 'touchmove'));
}

export function fromKeyDownEvent(target: HTMLElement | Document) {
    return fromEvent<KeyboardEvent>(target, 'keydown');
}

export function fromKeyUpEvent(target: HTMLElement | Document) {
    return fromEvent<KeyboardEvent>(target, 'keyup');
}

export function fromMouseUpEvent(target: HTMLElement | Document, ignoreTouchCancel = true) {
    const upAndEnd = merge(fromEvent<MouseEvent>(target, 'mouseup'), fromEvent<TouchEvent>(target, 'touchend'));
    if (!ignoreTouchCancel)
        return upAndEnd;

    return merge(upAndEnd, fromEvent<TouchEvent>(target, 'touchcancel'));
}

export function fromDragEvent(target: HTMLElement, document: Document, onlyStart = false, filterFn?: DragFilterFn)
    : Observable<MouseEvent | TouchEvent> {
    if (!filterFn)
        filterFn = () => true;

    return fromMouseDownEvent(target).pipe(
        switchMap((downEvent) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let operations: OperatorFunction<any, any> = (source) => source; // Default to identity operator

            // Dynamically compose operations into a single pipeable operator
            if (filterFn)
                operations = pipe(
                    operations,
                    filter((moveEvent) => filterFn(downEvent, moveEvent, target))
                );

            if (onlyStart)
                operations = pipe(operations, take(1));

            operations = pipe(
                operations,
                takeUntil(fromMouseUpEvent(document))
            );

            return fromMouseMoveEvent(document).pipe(operations);
        }
        ));
}

export function getPointFromEvent(event: MouseEvent | TouchEvent | KeyboardEvent): EventPoint | null {
    // NOTE: In firefox TouchEvent is only defined for touch capable devices

    if (isTouchEvent(event)) {
        if (event.changedTouches.length === 0)
            return null;

        const { clientX: x, clientY: y } = event.changedTouches[0];
        return { x, y };
    }

    if (event instanceof KeyboardEvent) {
        const target = event.target as HTMLElement;

        // Calculate element midpoint
        return {
            x: target.offsetLeft + target.offsetWidth / 2,
            y: target.offsetTop + target.offsetHeight / 2,
        };
    }

    return {
        x: event.clientX,
        y: event.clientY,
    }
}


export function outOfNgZone<T>() {
    const _ngZone = inject(NgZone);
    return (source: Observable<T>) =>
        new Observable<T>((observer) => _ngZone.runOutsideAngular(() => source.subscribe(observer)))
}

const isTouchEvent = (e: Event): e is TouchEvent => window.TouchEvent && e instanceof TouchEvent;
