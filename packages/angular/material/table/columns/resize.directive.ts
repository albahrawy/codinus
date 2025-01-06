import { Directionality } from "@angular/cdk/bidi";
import { CdkColumnDef } from "@angular/cdk/table";
import {
    AfterViewInit, booleanAttribute, Directive, effect, ElementRef,
    inject, input, NgZone, OnDestroy, OnInit, Renderer2, RendererStyleFlags2
} from "@angular/core";
import { addStyleSectionToDocument, findElementAttributeByPrefix, HTMLStyleElementScope } from "@codinus/dom";
import { Nullable } from "@codinus/types";

import { animationFrameScheduler, asapScheduler, auditTime, fromEvent } from "rxjs";
import { NG_CONTENT_PREFIX, NG_HOST_PREFIX } from "../shared/internal";

const RESIZE_SCHEDULER = typeof requestAnimationFrame !== 'undefined' ? animationFrameScheduler : asapScheduler;

@Directive({
    selector: `mat-header-cell[resizable],
               mat-header-cell[columnWidth],
               cdk-header-cell[resizable],
               cdk-header-cell[columnWidth]`,
    host: { '[class.cs-table-column-resizable]': 'resizable()' }
})
export class CSTableColumnResize implements OnDestroy, OnInit, AfterViewInit {

    //#region fields

    private _cssWidthVariable!: string;
    private _cssBorderVariable!: string;
    private _cellWidthCssElement?: HTMLStyleElementScope;
    private _resizerUnsubscriber?: () => void;
    private _resizingUnsubscriber?: () => void;
    private pressed = false;
    private startX = 0;
    private startWidth = 0;
    private _tableElement?: HTMLElement;

    private readonly renderer = inject(Renderer2);
    private readonly columnDef = inject(CdkColumnDef);
    private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef, { self: true });
    private readonly _dir = inject(Directionality, { optional: true });
    private readonly ngZone = inject(NgZone);

    //#endregion

    /**
     *
     */
    constructor() {
        effect(() => this.setWidth(this.columnWidth()));
        effect(() => this.setupResizable(this.resizable()));
    }

    //#region inputs

    resizable = input(true, { transform: booleanAttribute });
    columnWidth = input<Nullable<string | number>>();
    resizbleBorderStyle = input('1px dashed blue');

    //#endregion

    //#region ng-hooks

    ngOnInit(): void {
        const headerRow = this.renderer.parentNode(this.elementRef.nativeElement);
        const headerRowParent = this.renderer.parentNode(headerRow);
        if (headerRow.tagName === 'TH')
            this._tableElement = this.renderer.parentNode(headerRowParent);
        else
            this._tableElement = headerRowParent;
        this.addCssToDocument();
    }

    ngAfterViewInit(): void {
        const cashedWidth = this._tableElement?.style.getPropertyValue(this._cssWidthVariable) ?? '';
        this.setWidth(cashedWidth.length > 0 ? cashedWidth : this.columnWidth());
    }

    ngOnDestroy(): void {
        this._cellWidthCssElement?.remove?.();
        this._resizerUnsubscriber?.();
        this._resizingUnsubscriber?.();
    }

    //#endregion

    //#region private methods

    private addCssToDocument() {

        const columnClass = this.columnDef._columnCssClassName.find(c => c == `cdk-column-${this.columnDef.cssClassFriendlyName}`);

        const tableNgAttributes = findElementAttributeByPrefix(this._tableElement?.attributes, NG_HOST_PREFIX, NG_CONTENT_PREFIX);
        const _hostCssId = tableNgAttributes[NG_HOST_PREFIX] ?? tableNgAttributes[NG_CONTENT_PREFIX] ?? '';
        const _isolationId = _hostCssId ? `[${_hostCssId}]` : '';
        this._cssWidthVariable = `--cs-${columnClass}-width`;
        this._cssBorderVariable = `--cs-${columnClass}-border`;

        const columnStyles = `
        ${_isolationId} .${columnClass} {
            min-width: var(${this._cssWidthVariable},unset); 
            width: var(${this._cssWidthVariable},unset); 
            max-width: var(${this._cssWidthVariable},unset);
            transition: width 0.3s;
          }
          ${_isolationId}.cs-table.resizing .${columnClass}{
            border-right: var(${this._cssBorderVariable},var(--cs-table-inner-vertical-border));
            [dir='rtl'] & {
                border-right: unset;
                border-left: var(${this._cssBorderVariable},var(--cs-table-inner-vertical-border));
            }
          }
        `;
        this._cellWidthCssElement = addStyleSectionToDocument(`${columnClass}-style-size`, columnStyles);
    }

    private handleResizerEvents(enter: boolean) {
        if (enter) {
            if (this.resizbleBorderStyle())
                this.renderer.setStyle(this._tableElement, this._cssBorderVariable, this.resizbleBorderStyle(), RendererStyleFlags2.DashCase);
            this.renderer.addClass(this._tableElement, "cs-table-resizing");
        } else if (!this.pressed) {
            this.renderer.removeClass(this._tableElement, "cs-table-resizing");
            this.renderer.removeStyle(this._tableElement, this._cssBorderVariable, RendererStyleFlags2.DashCase);
        }
    }

    private setupResizable(enabled: boolean) {
        this.ngZone.runOutsideAngular(() => {
            if (enabled && !this._resizerUnsubscriber) {
                const resizer = this.renderer.createElement("span");
                this.renderer.addClass(resizer, "resize-holder");
                this.renderer.appendChild(this.elementRef.nativeElement, resizer);
                const mouseDown = this.renderer.listen(resizer, "mousedown", this.onMouseDown);
                const resizerMove = this.renderer.listen(resizer, "mousemove", () => this.handleResizerEvents(true));
                const resizerout = this.renderer.listen(resizer, "mouseout", () => this.handleResizerEvents(false));
                this._resizerUnsubscriber = () => {
                    mouseDown();
                    resizerMove();
                    resizerout();
                    this.renderer.removeChild(this.elementRef.nativeElement, resizer);
                };
            } else if (!enabled && this._resizerUnsubscriber) {
                this._resizerUnsubscriber?.();
                this._resizingUnsubscriber?.();
                this._resizerUnsubscriber = undefined;
                this._resizingUnsubscriber = undefined;
            }
        });
    }
    //TODO: check for minimumWidth and maximumWidth 33 at least for padding
    private _constraintWidth(width: number) {
        return Math.max(33, width);
    }

    private setWidth(value: Nullable<string | number>) {
        if (typeof value === 'number') {
            value = this._constraintWidth(value);
            value = `${value}px`;
        }
        if (value)
            this.renderer.setStyle(this._tableElement, this._cssWidthVariable, value, RendererStyleFlags2.DashCase);
        else
            this.renderer.removeStyle(this._tableElement, this._cssWidthVariable, RendererStyleFlags2.DashCase);
    }

    private onMouseDown = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        const tableMove = fromEvent<MouseEvent>(document, 'mousemove').pipe(auditTime(0, RESIZE_SCHEDULER)).subscribe(this.onMouseMove)
        const mouseUp = this.renderer.listen("document", "mouseup", this.onMouseUp);
        this._resizingUnsubscriber = () => {
            tableMove.unsubscribe();
            mouseUp();
            this._resizingUnsubscriber = undefined;
        };
        this.pressed = true;
        this.startX = event.pageX;
        this.startWidth = this.elementRef.nativeElement.offsetWidth;
    };

    private onMouseMove = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        if (this.pressed && event.buttons) {
            // Calculate width of column
            let deltaX = event.pageX - this.startX;
            if (this._dir?.value == 'rtl')
                deltaX *= -1;
            const width = this.startWidth + deltaX;
            this.setWidth(width);
        }
    };

    private onMouseUp = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        this._resizingUnsubscriber?.();
        if (this.pressed) {
            this.pressed = false;
            this.renderer.removeClass(this._tableElement, "resizing");
            this.renderer.removeStyle(this._tableElement, this._cssBorderVariable, RendererStyleFlags2.DashCase);
        }
    };

    //#endregion
}