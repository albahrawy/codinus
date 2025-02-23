import { Directionality } from "@angular/cdk/bidi";
import { CdkColumnDef } from "@angular/cdk/table";
import {
    AfterViewInit, Directive, effect, ElementRef,
    inject, input, NgZone, OnDestroy, OnInit, Renderer2, RendererStyleFlags2
} from "@angular/core";
import { addStyleSectionToDocument, findElementAttributeByPrefix, HTMLStyleElementScope } from "@codinus/dom";
import { Nullable } from "@codinus/types";

import { createEventManager } from "@ngx-codinus/core/events";
import { booleanTrueAttribute, SMOOTH_SCHEDULER } from "@ngx-codinus/core/shared";
import { auditTime } from "rxjs";
import { NG_CONTENT_PREFIX, NG_HOST_PREFIX } from "../shared/internal";

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
    private pressed = false;
    private startX = 0;
    private startWidth = 0;
    private _tableElement?: HTMLElement;

    private readonly renderer = inject(Renderer2);
    private readonly columnDef = inject(CdkColumnDef);
    private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef, { self: true });
    private readonly _dir = inject(Directionality, { optional: true });
    private readonly ngZone = inject(NgZone);
    private readonly eventManager = createEventManager();

    //#endregion

    /**
     *
     */
    constructor() {
        effect(() => this.setWidth(this.columnWidth()));
        effect(() => this.setupResizable(this.resizable()));
    }

    //#region inputs

    resizable = input(true, { transform: booleanTrueAttribute });
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
        this.eventManager.unRegisterAll();
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
          ${_isolationId}.cdk-table.cs-table-resizing .${columnClass}{
            border-right: var(${this._cssBorderVariable},var(--cs-table-inner-vertical-border));
            [dir='rtl'] & {
                border-right: unset;
                border-left: var(${this._cssBorderVariable},var(--cs-table-inner-vertical-border));
            }
          }
        `;
        this._cellWidthCssElement = addStyleSectionToDocument(`${columnClass}-style-size`, columnStyles);
    }

    private handleResizerEvents(event: Event) {
        if (event.type === 'mousemove') {
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
            const registered = this.eventManager.has('enable-resize');
            if (enabled && !registered) {
                const resizer = this.renderer.createElement("span");
                this.renderer.addClass(resizer, "resize-holder");
                this.renderer.appendChild(this.elementRef.nativeElement, resizer);
                this.eventManager.register('enable-resize', () => this.renderer.removeChild(this.elementRef.nativeElement, resizer));
                this.eventManager.listenAndRegister('enable-resize', resizer, ['mousemove', 'mouseout'], e => this.handleResizerEvents(e));
                this.eventManager.listenAndRegister<MouseEvent>('enable-resize', resizer, 'mousedown', e => this.onMouseDown(e));
            } else if (!enabled && registered) {
                this.eventManager.unRegisterAll();
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
        this.eventManager.listenAndRegisterFrom('resizing', document, 'mousemove', this.onMouseMove, auditTime(0, SMOOTH_SCHEDULER));
        this.eventManager.listenAndRegister('resizing', "document", "mouseup", this.onMouseUp);
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
        this.eventManager.unRegister('resizing');
        //this._resizingUnsubscriber?.();
        if (this.pressed) {
            this.pressed = false;
            this.renderer.removeClass(this._tableElement, "cs-table-resizing");
            this.renderer.removeStyle(this._tableElement, this._cssBorderVariable, RendererStyleFlags2.DashCase);
        }
    };

    //#endregion
}