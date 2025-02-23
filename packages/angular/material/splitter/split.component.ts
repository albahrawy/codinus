import {
  ChangeDetectionStrategy, Component,
  ElementRef, booleanAttribute,
  computed, contentChildren, forwardRef, inject, input, output
} from '@angular/core'
import { outputFromObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { getPositiveOrFallback } from '@codinus/js-extensions'
import { Nullable } from '@codinus/types'
import { signalDir } from '@ngx-codinus/cdk/localization'
import { EventPoint, getPointFromEvent } from '@ngx-codinus/core/events'
import { booleanTrueAttribute } from '@ngx-codinus/core/shared'
import { filter, fromEvent, map } from 'rxjs'
import { CSSplitterGutter } from './splitter-gutter.component'
import { CSSplitterHandler } from './splitter-handler'
import {
  CODINUS_SPLITTER, CODINUS_SPLITTER_HANDLER, CODINUS_SPLITTER_PANE, CSOrientation, CSSizeUnit,
  CSSplitEventArgs, DragStartContext, DragStartContextArgs, ICSSplitter,
} from './types'

@Component({
  selector: 'cs-splitter',
  imports: [CSSplitterGutter],
  exportAs: 'csSplitter',
  template: `
    <ng-content select="cs-splitter-pane"></ng-content>
    @for (pane of _panes(); track pane) {
      @if (!$last) {
        <cs-splitter-gutter #gutterElement [pane]="pane" [index]="$index" (dblclick)="gutterDoubleClicked($index)"
          (dragStart)="_onDragStarted($event)" (dragMove)="_onDragMove($event)" (dragEnd)="_onDragEnd($event)">
          <div class="cs-splitter-gutter-handle"></div>
        </cs-splitter-gutter>
      }
    }
  `,
  styleUrl: './split.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'cs-splitter',
    '[class.cs-splitter-horizontal]': 'isHorizontal()',
    '[class.cs-splitter-vertical]': '!isHorizontal()',
    '[class.cs-splitter-percent]': 'unit()==="percent"',
    '[class.cs-splitter-pixel]': 'unit()==="pixel"',
    '[class.cs-splitter-disabled]': 'disabled()',
    '[class.cs-splitter-dragging]': '_handler.isDragging()',
    '[class.cs-splitter-transition]': 'useTransition() && !_handler.isDragging()',
    '[style.grid-template]': '_handler.gridTemplateColumnsStyle()'
  },
  providers: [
    { provide: CODINUS_SPLITTER, useExisting: CSSplitter },
    {
      provide: CODINUS_SPLITTER_HANDLER,
      useFactory: (splitter: CSSplitter) => splitter._handler,
      deps: [forwardRef(() => CSSplitter)],
    }
  ]
})
export class CSSplitter implements ICSSplitter {
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly _panes = contentChildren(CODINUS_SPLITTER_PANE);
  protected readonly _handler = new CSSplitterHandler(this, this._panes);
  private dir = signalDir();

  private _transition$ = fromEvent<TransitionEvent>(this._elementRef.nativeElement, 'transitionend')
    .pipe(
      filter((e) => e.propertyName.startsWith('grid-template')),
      //outOfNgZone(),
      takeUntilDestroyed(),
      map(() => this._handler.getPaneSizes())
    );

  gutterSize = input(10, { transform: (v: Nullable<number | string>) => getPositiveOrFallback(v, 10) });
  gutterStep = input(1, { transform: (v: Nullable<number | string>) => getPositiveOrFallback(v, 1) });
  clickDeltaPixel = input(2, { transform: (v: Nullable<number | string>) => getPositiveOrFallback(v, 2) });
  disabled = input(false, { transform: booleanAttribute });
  orientation = input<CSOrientation>('horizontal');
  unit = input<CSSizeUnit>('percent');
  gutterAriaLabel = input<string>();
  restrictMove = input(false, { transform: booleanAttribute });
  useTransition = input(true, { transform: booleanTrueAttribute });
  collapseOnDblClick = input(true, { transform: booleanTrueAttribute });

  gutterDblClick = output<CSSplitEventArgs>();
  dragStart = output<CSSplitEventArgs>();
  dragEnd = output<CSSplitEventArgs>();
  dragProgress = output<CSSplitEventArgs>();
  transitionEnd = outputFromObservable(this._transition$);

  isHorizontal = computed(() => this.orientation() === 'horizontal');
  isRtl = computed(() => this.dir() === 'rtl');

  protected _onDragStarted(index: number) {
    this.dragStart.emit(this.createDragEvent(index));
  }

  protected _onDragEnd(index: number) {
    this.dragEnd.emit(this.createDragEvent(index));
  }

  protected gutterDoubleClicked(gutterIndex: number) {
    if (this.collapseOnDblClick())
      this._handler.getPane(gutterIndex, true)?.toggle();

    this.gutterDblClick.emit(this.createDragEvent(gutterIndex));
  }

  protected _onDragMove(dragStartContext: DragStartContextArgs) {
    if (dragStartContext.endPoint)
      this.dragMoveToPoint(dragStartContext.endPoint, dragStartContext);
  }

  private createDragEvent(gutterIndex: number): CSSplitEventArgs {
    return {
      gutterIndex,
      paneSizes: this._handler.getPaneSizes(),
    };
  }

  private dragMoveToPoint(endPoint: EventPoint, dragStartContext: DragStartContext) {
    const startPoint = getPointFromEvent(dragStartContext.startEvent) ?? { x: 0, y: 0 };
    const preDirOffset = this.isHorizontal() ? endPoint.x - startPoint.x : endPoint.y - startPoint.y
    const offset = this.isHorizontal() && this.dir() === 'rtl' ? -preDirOffset : preDirOffset
    const isDraggingForward = offset > 0
    // Align offset with gutter step and abs it as we need absolute pixels movement
    const absSteppedOffset = Math.abs(Math.round(offset / this.gutterStep()) * this.gutterStep())
    // Copy as we don't want to edit the original array
    const tempAreasPixelSizes = [...dragStartContext.pixelSizes]
    // As we are going to shuffle the areas order for easier iterations we should work with area indices array
    // instead of actual area sizes array.
    const areasIndices = tempAreasPixelSizes.map((_, index) => index)
    // The two variables below are ordered for iterations with real area indices inside.
    // We must also remove the invisible ones as we can't expand or shrink them.
    const areasIndicesBeforeGutter = this.restrictMove()
      ? [dragStartContext.index]
      : areasIndices
        .slice(0, dragStartContext.index + 1)
        .filter((index) => this._panes()[index].visible())
        .reverse()
    const areasIndicesAfterGutter = this.restrictMove()
      ? [dragStartContext.index + 1]
      : areasIndices.slice(dragStartContext.index + 1).filter((index) => this._panes()[index].visible())
    // Based on direction we need to decide which areas are expanding and which are shrinking
    const potentialAreasIndicesArrToShrink = isDraggingForward ? areasIndicesAfterGutter : areasIndicesBeforeGutter
    const potentialAreasIndicesArrToExpand = isDraggingForward ? areasIndicesBeforeGutter : areasIndicesAfterGutter

    let remainingPixels = absSteppedOffset
    let potentialShrinkArrIndex = 0
    let potentialExpandArrIndex = 0

    // We gradually run in both expand and shrink direction transferring pixels from the offset.
    // We stop once no pixels are left or we reached the end of either the expanding areas or the shrinking areas
    while (
      remainingPixels !== 0 &&
      potentialShrinkArrIndex < potentialAreasIndicesArrToShrink.length &&
      potentialExpandArrIndex < potentialAreasIndicesArrToExpand.length
    ) {
      const areaIndexToShrink = potentialAreasIndicesArrToShrink[potentialShrinkArrIndex]
      const areaIndexToExpand = potentialAreasIndicesArrToExpand[potentialExpandArrIndex]
      const areaToShrinkSize = tempAreasPixelSizes[areaIndexToShrink]
      const areaToExpandSize = tempAreasPixelSizes[areaIndexToExpand]
      const areaToShrinkMinSize = dragStartContext.boundaries.get(areaIndexToShrink)?.min ?? 0;
      const areaToExpandMaxSize = dragStartContext.boundaries.get(areaIndexToExpand)?.max ?? 0;
      // We can only transfer pixels based on the shrinking area min size and the expanding area max size
      // to avoid overflow. If any pixels left they will be handled by the next area in the next `while` iteration
      const maxPixelsToShrink = areaToShrinkSize - areaToShrinkMinSize
      const maxPixelsToExpand = areaToExpandMaxSize - areaToExpandSize
      const pixelsToTransfer = Math.min(maxPixelsToShrink, maxPixelsToExpand, remainingPixels)

      // Actual pixels transfer
      tempAreasPixelSizes[areaIndexToShrink] -= pixelsToTransfer
      tempAreasPixelSizes[areaIndexToExpand] += pixelsToTransfer
      remainingPixels -= pixelsToTransfer

      // Once min threshold reached we need to move to the next area in turn
      if (tempAreasPixelSizes[areaIndexToShrink] === areaToShrinkMinSize) {
        potentialShrinkArrIndex++
      }

      // Once max threshold reached we need to move to the next area in turn
      if (tempAreasPixelSizes[areaIndexToExpand] === areaToExpandMaxSize) {
        potentialExpandArrIndex++
      }
    }

    this._panes().forEach((area, index) => {
      // No need to update wildcard size
      if (area._internalSize() === '*') {
        return
      }

      if (this.unit() === 'pixel') {
        area._internalSize.set(tempAreasPixelSizes[index])
      } else {
        const percentSize = (tempAreasPixelSizes[index] / dragStartContext.availableSize) * 100
        // Fix javascript only working with float numbers which are inaccurate compared to decimals
        area._internalSize.set(parseFloat(percentSize.toFixed(10)))
      }
    })
    this.dragStart.emit(this.createDragEvent(dragStartContext.index));
  }
}
