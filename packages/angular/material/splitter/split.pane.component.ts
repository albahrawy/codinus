import { booleanAttribute, Component, computed, inject, input, isDevMode } from '@angular/core';
import { getPositiveOrFallback } from '@codinus/js-extensions';
import { IFunc, Nullable } from '@codinus/types';
import { booleanTrueAttribute, csLinkedSignal } from '@ngx-codinus/core/shared';
import {
    CODINUS_SPLITTER, CODINUS_SPLITTER_HANDLER, CODINUS_SPLITTER_PANE,
    CSSplitterSize, CSSplitterSizeInput, ICSSplitterPane
} from './types';

const transformSize: IFunc<CSSplitterSizeInput, CSSplitterSize>
    = (size: CSSplitterSizeInput) => (size ?? '*') === '*' ? '*' : getPositiveOrFallback(size, 0);

@Component({
    selector: 'cs-splitter-pane, [cs-splitter-pane]',
    template: `
            <ng-content></ng-content>
            @if (_handler.isDragging()) { <div class="cs-splitter-overlay-guard"></div> }
    `,
    styles: `
        :host {
            overflow-x: hidden;
            overflow-y: auto;

            .cs-splitter-horizontal>& {
                height: 100%;
            }

            .cs-splitter-vertical>& {
                width: 100%;
            }
        }

        .cs-splitter-overlay-guard {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    `,
    exportAs: 'csSplitterPane',
    host: {
        'class': 'cs-splitter-pane',
        '[class.cs-split-pane-min]': 'inMinState()',
        '[class.cs-split-pane-max]': 'inMaxState()',
        '[class.cs-split-pane-hidden]': '!visible()',
        '[style.grid-column]': 'gridColumn()',
        '[style.grid-row]': 'gridRow()',
        '[style.position]': 'panePosition()'
    },
    providers: [
        {
            provide: CODINUS_SPLITTER_PANE,
            useExisting: CSSplitPane,
        },
    ],
})
export class CSSplitPane implements ICSSplitterPane {

    protected readonly _handler = inject(CODINUS_SPLITTER_HANDLER);
    private readonly _splitter = inject(CODINUS_SPLITTER);
    private _isCollapsed = false;
    private _sizeBeforeCollapse: Nullable<CSSplitterSize> = null;
    private _sizeBeforeExpand: Nullable<CSSplitterSize> = null;
    private _expandedPane: Nullable<ICSSplitterPane> = null;

    /**
     * @internal
     */
    _internalSize = csLinkedSignal(() => this.visible() ? this.size() : 0);

    readonly size = input('*', { transform: transformSize });
    readonly minSize = input('*', { transform: transformSize });
    readonly maxSize = input('*', { transform: transformSize });
    readonly lockSize = input(false, { transform: booleanAttribute });
    readonly visible = input(true, { transform: booleanTrueAttribute });

    currentSize = this._internalSize.asReadonly();

    private readonly gridPanePos = computed(() => this._handler.getPaneIndex(this) * 2 + 1);

    protected inMinState = computed(() => this.visible() && this._internalSize() === this.normalizedMinSize());
    protected inMaxState = computed(() => this.visible() && this._internalSize() === this.normalizedMaxSize());
    protected gridColumn = computed(() => this._splitter.isHorizontal() ? `${this.gridPanePos()} / ${this.gridPanePos()}` : null);
    protected gridRow = computed(() => this._splitter.isHorizontal() ? null : `${this.gridPanePos()} / ${this.gridPanePos()}`);
    protected panePosition = computed(() => this._handler.isDragging() ? 'relative' : null);

    /**
    * @internal
    */
    normalizedMinSize = computed(() => this._normalizeSizeBoundary(this.minSize(), 0,
        (s, reqSize) => (s !== '*' && s < reqSize), 'cs-splitter: size cannot be smaller than minSize'));

    /**
    * @internal
    */
    normalizedMaxSize = computed(() => this._normalizeSizeBoundary(this.maxSize(), Infinity,
        (s, reqSize) => (s !== '*' && s > reqSize), 'cs-splitter: size cannot be larger than maxSize'));

    collapse(collapseDirection: 'before' | 'after' = 'before'): void {
        if (this._isCollapsed)
            return;
        const index = this._handler.getPaneIndex(this, true);
        const paneTochangeIndex = index === 0 || collapseDirection === 'before' ? index + 1 : index - 1;
        const paneTochange = this._handler.getPane(paneTochangeIndex, true);
        if (!paneTochange)
            return;
        const changedPaneSize = paneTochange.currentSize();
        const sizeBeforeCollapse = this._internalSize();

        this._isCollapsed = true;
        this._sizeBeforeCollapse = sizeBeforeCollapse;
        this._expandedPane = paneTochange;
        this._internalSize.set(0);
        if (typeof sizeBeforeCollapse != 'number' || typeof changedPaneSize != 'number')
            (paneTochange as typeof this)._expandToWildCard();
        else
            paneTochange._internalSize.set(changedPaneSize + sizeBeforeCollapse);
    }

    expand(): void {
        if (!this._isCollapsed || !this._expandedPane || !this._sizeBeforeCollapse)
            return;

        const changedPaneSize = this._expandedPane.currentSize();
        this._internalSize.set(this._sizeBeforeCollapse);
        if (typeof changedPaneSize != 'number' || typeof this._sizeBeforeCollapse != 'number')
            (this._expandedPane as typeof this)._restoreFromWildCard();
        else
            this._expandedPane._internalSize.set(changedPaneSize - this._sizeBeforeCollapse);
        this._isCollapsed = false;
        this._sizeBeforeCollapse = null;
        this._expandedPane = null;
    }

    toggle(collapseDirection: 'before' | 'after' = 'before') {
        if (this._isCollapsed)
            this.expand();
        else
            this.collapse(collapseDirection);
    }

    private _normalizeSizeBoundary(boundrySize: CSSplitterSize, defaultBoundarySize: number,
        assertFn: (size: CSSplitterSize, boundarySize: number) => boolean, message: string
    ): number {

        if (!this.visible())
            return defaultBoundarySize;

        const size = this.size();
        const validate = () => {

            if (this.lockSize()) {
                assertSize(boundrySize !== '*', `lockSize overwrites maxSize/minSize`);
                if (assertSize(size === '*', `lockSize isn't supported on area with * size or without size`))
                    return size as number;

                return defaultBoundarySize;
            }

            if (boundrySize === '*')
                return defaultBoundarySize;

            if (assertSize(size === '*', `maxSize/minSize not allowed on * or without size`))
                return boundrySize;

            return defaultBoundarySize;
        }

        const reqSize = validate();
        if (assertSize(assertFn(size, reqSize), message))
            return reqSize;

        return defaultBoundarySize
    }

    private _expandToWildCard() {
        this._sizeBeforeExpand = this._internalSize();
        this._internalSize.set('*');
    }

    private _restoreFromWildCard() {
        if (this._sizeBeforeExpand) {
            this._internalSize.set(this._sizeBeforeExpand);
            this._sizeBeforeExpand = null;
        }
    }
}

function assertSize(condition: boolean, message: string): boolean {
    if (condition && isDevMode())
        console.warn(`cs-splitter: ${message}`);
    return !condition;
}