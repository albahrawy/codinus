import { computed, effect, ElementRef, inject, isDevMode, signal, Signal, untracked } from "@angular/core";
import { arraySum, arrayToMap } from "@codinus/js-extensions";
import { CSSizeUnit, CSSplitterSize, DragStartContext, ICSSplitter, ICSSplitterHandler, ICSSplitterPane } from "./types";

export class CSSplitterHandler implements ICSSplitterHandler {
    private _elementRef = inject(ElementRef);

    readonly isDragging = signal(false);

    private readonly visiblePanes = computed(() => this._panes().filter(p => p.visible()));

    readonly gridTemplateColumnsStyle = computed(() => {
        const columns: string[] = []
        const visiblePanes = this.visiblePanes();
        const sumNonWildcardSizes = arraySum(visiblePanes, p => {
            const size = p._internalSize()
            return size === '*' ? 0 : size;
        });
        const visibleAreasCount = visiblePanes.length;

        let visitedVisibleAreas = 0
        const unit = this.splitter.unit();
        this._panes().forEach((pane, index, panes) => {
            const paneSize = pane._internalSize();

            // Add area size column
            if (!pane.visible()) {
                columns.push(unit === 'percent' || paneSize === '*' ? '0fr' : '0px')
            } else {
                if (unit === 'pixel') {
                    const columnValue = paneSize === '*' ? '1fr' : `${paneSize}px`
                    columns.push(columnValue)
                } else {
                    const percentSize = paneSize === '*' ? 100 - sumNonWildcardSizes : paneSize
                    const columnValue = `${percentSize}fr`
                    columns.push(columnValue)
                }

                visitedVisibleAreas++
            }

            const isLastArea = index === panes.length - 1

            if (isLastArea) {
                return
            }

            const remainingVisibleAreas = visibleAreasCount - visitedVisibleAreas

            // Only add gutter with size if this area is visible and there are more visible areas after this one
            // to avoid ghost gutters
            if (pane.visible() && remainingVisibleAreas > 0) {
                columns.push(`${this.splitter.gutterSize()}px`)
            } else {
                columns.push('0px')
            }
        })

        return this.splitter.isHorizontal() ? `1fr / ${columns.join(' ')}` : `${columns.join(' ')} / 1fr`
    });

    constructor(private splitter: ICSSplitter, private _panes: Signal<readonly ICSSplitterPane[]>) {

        effect(
            () => {
                const visiblePanes = this.visiblePanes();
                const unit = this.splitter.unit();
                const isInAutoMode = visiblePanes.every((area) => area.size() === '*');

                untracked(() => {
                    if (unit === 'percent' && visiblePanes.length > 1 && isInAutoMode)
                        return visiblePanes.forEach((area) => area._internalSize.set(100 / visiblePanes.length));

                    visiblePanes.forEach((area) => area._internalSize.reset());
                    const isValid = areValid(visiblePanes, unit)

                    if (isValid)
                        return;

                    if (unit === 'percent') {
                        const defaultSize = 100 / visiblePanes.length;
                        visiblePanes.forEach((area) => area._internalSize.set(defaultSize));
                    } else if (unit === 'pixel') {
                        const wildcardAreas = visiblePanes.filter((area) => area._internalSize() === '*');
                        if (wildcardAreas.length === 0)
                            visiblePanes[0]._internalSize.set('*');
                        else if (wildcardAreas.length > 1)
                            wildcardAreas.filter((_, i) => i !== 0).forEach((area) => area._internalSize.set(100));
                    }
                })
            }
        )
    }

    getPaneSizes(): CSSplitterSize[] {
        return this.visiblePanes().map(p => p._internalSize());
    }

    createDragStartContext(startEvent: MouseEvent | TouchEvent | KeyboardEvent, index: number): DragStartContext {
        const splitBoundingRect = this._elementRef.nativeElement.getBoundingClientRect()
        const splitSize = this.splitter.isHorizontal() ? splitBoundingRect.width : splitBoundingRect.height
        const availableSize = splitSize - (this.visiblePanes().length - 1) * this.splitter.gutterSize()
        // Use the internal size and split size to calculate the pixel size from wildcard and percent areas
        const sizesWithWildcard = this._panes().map(pane => {
            const size = pane.currentSize();
            return this.splitter.unit() === 'pixel' || size === '*'
                ? size
                : (size / 100) * availableSize;
        })
        const remainingSize = Math.max(0, availableSize - arraySum(sizesWithWildcard, (size) => (size === '*' ? 0 : size)));
        const pixelSizes = sizesWithWildcard.map((size) => (size === '*' ? remainingSize : size));
        const boundaries = arrayToMap(this._panes(), (_, index) => index, pane => {
            const value = {
                min: pane.normalizedMinSize(),
                max: pane.normalizedMaxSize()
            };

            if (this.splitter.unit() === 'percent') {
                value.min /= 100 * availableSize;
                value.max /= 100 * availableSize;
            }
            return value;
        });

        return { startEvent, index, pixelSizes, availableSize, boundaries };
    }

    getPaneIndex(pane: ICSSplitterPane, onlyVisible?: boolean) {
        const panesToCheck = onlyVisible ? this.visiblePanes() : this._panes();
        return panesToCheck.findIndex(p => p === pane);
    }

    getPane(index: number, onlyVisible?: boolean): ICSSplitterPane | undefined {
        const panesToCheck = onlyVisible ? this.visiblePanes() : this._panes();
        return panesToCheck.at(index);
    }
}

function areValid(panes: ICSSplitterPane[], unit: CSSizeUnit): boolean {
    if (panes.length === 0)
        return true;

    const wildcardAreas = panes.filter(p => p._internalSize() === '*');

    if (wildcardAreas.length > 1) {
        if (isDevMode())
            console.warn('cs-split: Maximum one * area is allowed')
        return false
    }

    if (unit === 'pixel') {
        if (wildcardAreas.length === 1)
            return true;

        if (isDevMode())
            console.warn('cs-split: Pixel mode must have exactly one * area');

        return false;
    }

    const sumPercent = arraySum(panes, p => {
        const size = p._internalSize();
        return size === '*' ? 0 : size;
    })

    // As percent calculation isn't perfect we allow for a small margin of error
    if (wildcardAreas.length === 1) {
        if (sumPercent <= 100.1)
            return true;

        if (isDevMode())
            console.warn(`cs-split: Percent areas must total 100%`);
        return false
    }

    if (sumPercent < 99.9 || sumPercent > 100.1) {
        if (isDevMode())
            console.warn('cs-split: Percent areas must total 100%');

        return false;
    }
    return true;
}