import { InjectionToken, WritableSignal } from "@angular/core";
import { Nullable } from "@codinus/types";
import { EventPoint } from "@ngx-codinus/core/events";
import { CSLinkedSignal } from "@ngx-codinus/core/shared";

export const CODINUS_SPLITTER = new InjectionToken<ICSSplitter>("codinus_splitter");
export const CODINUS_SPLITTER_HANDLER = new InjectionToken<ICSSplitterHandler>("codinus_splitter_handler");
export const CODINUS_SPLITTER_PANE = new InjectionToken<ICSSplitterPane>("codinus_splitter_pane");

export type CSSizeUnit = 'pixel' | 'percent';
export type CSOrientation = 'horizontal' | 'vertical';
export type CSSplitterSize = number | '*';
export type CSSplitterSizeInput = Nullable<CSSplitterSize | `${number}`>;


export interface ICSSplitter {
    gutterSize(): number;
    isHorizontal: () => boolean;
    isRtl: () => boolean;
    gutterAriaLabel: () => Nullable<string>;
    unit: () => CSSizeUnit;
    disabled: () => boolean;
    clickDeltaPixel: () => number;
}

export interface ICSSplitterPane {
    collapse(collapseDirection?: 'before' | 'after'): void;
    expand(): void;
    toggle(collapseDirection?: 'before' | 'after'): void;
    minSize: () => CSSplitterSize;
    maxSize: () => CSSplitterSize;
    size: () => CSSplitterSize;
    currentSize: () => CSSplitterSize;
    normalizedMinSize: () => number;
    normalizedMaxSize: () => number;
    visible: () => boolean;
    /**
    * @internal
    */
    _internalSize: CSLinkedSignal<CSSplitterSize>;
}

export interface ICSGutterMouseDownContext {
    event: MouseEvent | TouchEvent;
    paneBeforeIndex: number;
    paneAfterIndex: number;
}

export interface DragStartContext {
    startEvent: MouseEvent | TouchEvent | KeyboardEvent;
    pixelSizes: number[];
    availableSize: number;
    boundaries: Map<number, ICSPaneLimits>;
    index: number;
}

export interface DragStartContextArgs extends DragStartContext {
    endPoint: EventPoint | null;
}

export interface ICSSplitterHandler {
    getPane(index: number, onlyVisible?: boolean): ICSSplitterPane | undefined;
    getPaneIndex(pane: ICSSplitterPane, onlyVisible?: boolean): number;
    createDragStartContext(prevMouseEvent: MouseEvent | TouchEvent | KeyboardEvent, index: number): DragStartContext;
    isDragging: WritableSignal<boolean>;
    readonly gridTemplateColumnsStyle: () => string;
    getPaneSizes(): CSSplitterSize[];
}

export interface ICSPaneLimits {
    min: number;
    max: number;
}

export interface CSSplitEventArgs {
    gutterIndex: number;
    paneSizes: CSSplitterSize[];
}