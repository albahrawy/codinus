import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, NgZone, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { preventEvent } from '@codinus/dom';
import {
    EventPoint, fromKeyDownEvent, fromKeyUpEvent, fromMouseDownEvent,
    fromMouseMoveEvent, fromMouseUpEvent, getPointFromEvent
} from '@ngx-codinus/core/events';
import { filter, finalize, map, pairwise, skipWhile, startWith, switchMap, take, takeUntil, tap } from 'rxjs';
import { CODINUS_SPLITTER, CODINUS_SPLITTER_HANDLER, CSSplitterSize, DragStartContextArgs, ICSSplitterPane } from './types';

@Component({
    selector: 'cs-splitter-gutter',
    template: `<ng-content></ng-content>`,
    exportAs: 'csGutter',
    host: {
        'class': 'cs-splitter-gutter',
        'role': 'separator',
        '[attr.tabindex]': '0',
        '[attr.aria-label]': 'splitter.gutterAriaLabel()',
        '[attr.aria-orientation]': 'splitter.orientation()',
        '[attr.aria-valuemin]': 'valueMinSize()',
        '[attr.aria-valuemax]': 'valueMaxSize()',
        '[attr.aria-valuenow]': 'valueCurrentSize()',
        '[attr.aria-valuetext]': 'valueSizeText()',
        '[style.grid-column]': 'gridStyle().column',
        '[style.grid-row]': 'gridStyle().row',
        '[class.cs-dragging]': 'handler.isDragging()',
    }
})

export class CSSplitterGutter {

    protected readonly splitter = inject(CODINUS_SPLITTER);
    private readonly handler = inject(CODINUS_SPLITTER_HANDLER);
    private readonly elementRef = inject(ElementRef);
    private readonly _document = inject(DOCUMENT);
    private readonly _ngZone = inject(NgZone);

    private _initialDraggingState = true;

    pane = input.required<ICSSplitterPane>();
    index = input.required<number>();

    dragStart = output<number>();
    dragMove = output<DragStartContextArgs>();
    dragEnd = output<number>();

    protected valueMinSize = computed(() => getAriaSizeValue(this.pane().minSize()));
    protected valueMaxSize = computed(() => getAriaSizeValue(this.pane().maxSize()));
    protected valueCurrentSize = computed(() => getAriaSizeValue(this.pane().currentSize()));

    protected gridStyle = computed(() => {
        const gutterId = (this.index() + 1) * 2
        const style = `${gutterId} / ${gutterId}`
        const isHorizontal = this.splitter.isHorizontal();
        return {
            column: isHorizontal ? style : '1',
            row: isHorizontal ? '1' : style,
        }
    });

    protected valueSizeText = computed(() => {
        const size = this.valueCurrentSize();
        if (size === undefined)
            return undefined;

        return `${size.toFixed(0)} ${this.splitter.unit()}`
    });

    private readonly mouseEventStream = fromMouseDownEvent(this.elementRef.nativeElement)
        .pipe(
            filter(() => !this.splitter.disabled()),
            tap(e => preventEvent(e)),
            switchMap((mouseDownEvent) =>
                fromMouseMoveEvent(this._document).pipe(
                    startWith(mouseDownEvent),
                    pairwise(),
                    skipWhile(([, currMoveEvent]) => this._checkIfEventEqualToDelta(mouseDownEvent, currMoveEvent)),
                    take(1),
                    takeUntil(fromMouseUpEvent(this._document, true)),
                    tap(() => this.handler.isDragging.set(true)),
                    map(([prevMouseEvent]) =>
                        this.handler.createDragStartContext(prevMouseEvent, this.index()),
                    ),
                    switchMap((context) =>
                        fromMouseMoveEvent(this._document).pipe(
                            tap((moveEvent) => {
                                preventEvent(moveEvent);
                                this.dragMove.emit({ ...context, endPoint: getPointFromEvent(moveEvent) });
                            }),
                            takeUntil(fromMouseUpEvent(this._document, true)),
                            finalize(() => this.handler.isDragging.set(false))
                        ),
                    ),
                )
            ),
            takeUntilDestroyed()
        );

    private readonly keydownEventStream = fromKeyDownEvent(this.elementRef.nativeElement)
        .pipe(
            filter(e => !this.splitter.disabled() && isValidKey(e, this.splitter.isHorizontal())),
            tap(e => preventEvent(e)),
            map(keyboardEvent => ({ keyboardEvent, startPoint: getPointFromEvent(keyboardEvent) })),
            filter(startArgs => startArgs.startPoint != null),
            map(startArgs =>
            ({
                startArgs,
                context: this.handler.createDragStartContext(startArgs.keyboardEvent, this.index())
            }),
            ),
            tap(() => this.handler.isDragging.set(true)),
            tap(args => {
                const endPoint = this._getKeyboardEndpoint(args.startArgs.keyboardEvent, args.startArgs.startPoint);
                this.dragMove.emit({ endPoint, ...args.context });
            }),
            takeUntilDestroyed()
        );

    private readonly keyupEventStream = fromKeyUpEvent(this.elementRef.nativeElement)
        .pipe(
            filter(e => this.handler.isDragging() && !this.splitter.disabled() && isValidKey(e, this.splitter.isHorizontal())),
            tap(() => this.handler.isDragging.set(false)),
            takeUntilDestroyed()
        );

    /**
     *
     */
    constructor() {
        this._ngZone.runOutsideAngular(() => {
            this.mouseEventStream.subscribe();
            this.keydownEventStream.subscribe();
            this.keyupEventStream.subscribe();
        });

        effect(() => {
            const isDragging = this.handler.isDragging();
            if (this._initialDraggingState) {
                this._initialDraggingState = false;
                return;
            }
            this._ngZone.run(() => (isDragging ? this.dragStart : this.dragEnd).emit(this.index()));
        });
    }

    private _checkIfEventEqualToDelta(mouseDownEvent: MouseEvent | TouchEvent, currMoveEvent: MouseEvent | TouchEvent): boolean {
        return gutterEventsEqualWithDelta(
            mouseDownEvent,
            currMoveEvent,
            this.splitter.clickDeltaPixel(),
            this.elementRef.nativeElement,
        );
    }

    private _getKeyboardEndpoint(event: KeyboardEvent, startPoint: EventPoint | null): EventPoint {

        const pixelsToMove = 10;
        const pageMoveMultiplier = 10;

        let xPointOffset = startPoint?.x ?? 0;
        let yPointOffset = startPoint?.y ?? 0;

        if (this.splitter.isHorizontal()) {
            // Even though we are going in the x axis we support page up and down
            switch (event.key) {
                case 'ArrowLeft':
                    xPointOffset -= pixelsToMove
                    break
                case 'ArrowRight':
                    xPointOffset += pixelsToMove
                    break
                case 'PageUp':
                    if (this.splitter.isRtl()) {
                        xPointOffset -= pixelsToMove * pageMoveMultiplier
                    } else {
                        xPointOffset += pixelsToMove * pageMoveMultiplier
                    }
                    break
                case 'PageDown':
                    if (this.splitter.isRtl()) {
                        xPointOffset += pixelsToMove * pageMoveMultiplier
                    } else {
                        xPointOffset -= pixelsToMove * pageMoveMultiplier
                    }
                    break
                default:
                    break;
            }
        } else {
            switch (event.key) {
                case 'ArrowUp':
                    yPointOffset -= pixelsToMove
                    break
                case 'ArrowDown':
                    yPointOffset += pixelsToMove
                    break
                case 'PageUp':
                    yPointOffset -= pixelsToMove * pageMoveMultiplier
                    break
                case 'PageDown':
                    yPointOffset += pixelsToMove * pageMoveMultiplier
                    break
                default:
                    break
            }
        }

        return { x: xPointOffset, y: yPointOffset };
    }
}

function getAriaSizeValue(size: CSSplitterSize) {
    return size === '*' ? undefined : size;
}

function gutterEventsEqualWithDelta(
    startEvent: MouseEvent | TouchEvent,
    endEvent: MouseEvent | TouchEvent,
    deltaInPx: number,
    element: HTMLElement,
) {
    if (
        !element.contains(startEvent.target as HTMLElement) ||
        !element.contains(endEvent.target as HTMLElement)
    ) {
        return false
    }

    const startPoint = getPointFromEvent(startEvent);

    if (!startPoint)
        return false;

    const endPoint = getPointFromEvent(endEvent);

    if (!endPoint)
        return false;

    return Math.abs(endPoint.x - startPoint.x) <= deltaInPx && Math.abs(endPoint.y - startPoint.y) <= deltaInPx
}

function isValidKey(e: KeyboardEvent, isHorizontal: boolean): boolean {

    return isHorizontal
        ? ['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(e.key)
        : ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(e.key);
}

