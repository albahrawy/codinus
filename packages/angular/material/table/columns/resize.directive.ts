import { Directionality } from "@angular/cdk/bidi";
import { CdkColumnDef } from "@angular/cdk/table";
import { Directive, effect, ElementRef, inject, input, NgZone, OnDestroy, Renderer2 } from "@angular/core";
import { addStyleSectionToDocument } from "@codinus/dom";
import { Nullable } from "@codinus/types";

import { createEventManager } from "@ngx-codinus/core/events";
import { booleanTrueAttribute, SMOOTH_SCHEDULER } from "@ngx-codinus/core/shared";
import { auditTime } from "rxjs";
import { CODINUS_TABLE_RESIZABLE } from "./types";

@Directive({
    selector: `mat-header-cell[resizable],
               mat-header-cell[columnWidth],
               cdk-header-cell[resizable],
               cdk-header-cell[columnWidth]`,
    host: { '[class.cs-table-column-resizable]': 'resizable()' }
})
export class CSTableColumnResize implements OnDestroy {

    //#region fields

    private _csTableResizable = inject(CODINUS_TABLE_RESIZABLE, { optional: true });
    private readonly renderer = inject(Renderer2);
    private readonly columnDef = inject(CdkColumnDef);
    private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef, { self: true });
    private readonly _dir = inject(Directionality, { optional: true });
    private readonly ngZone = inject(NgZone);

    private _tableElement?: HTMLElement = this._csTableResizable?.elementRef.nativeElement;
    private readonly eventManager = createEventManager();

    private _removeHighlightBorderStyle?: () => void;
    private _highlightBorderStyles?: string;

    private pressed = false;
    private startX = 0;
    private startWidth = 0;

    //#endregion

    /**
     *
     */
    constructor() {
        effect(() => this.setWidth(this.columnWidth() ?? this._csTableResizable?.getSize(this.columnDef.name)));
        effect(() => this.setupResizable(this.resizable() && !!this._csTableResizable?.resizable()));
    }

    //#region inputs

    resizable = input(true, { transform: booleanTrueAttribute });
    columnWidth = input<Nullable<string | number>>();

    //#endregion

    //#region ng-hooks

    ngOnDestroy(): void {
        this.eventManager.unRegisterAll();
        this._removeHighlightBorderStyle?.();
    }

    //#endregion

    //#region private methods

    private handleResizerEvents(event: Event) {
        if (event.type === 'mousemove') {
            this.renderer.addClass(this._tableElement, "cs-table-resizing");
            if (this._highlightBorderStyles && !this._removeHighlightBorderStyle) {
                const borderStyleElement = addStyleSectionToDocument(`cdk-column-${this.columnDef.cssClassFriendlyName}-resize-border`, this._highlightBorderStyles);
                this._removeHighlightBorderStyle = () => {
                    this._removeHighlightBorderStyle = undefined;
                    borderStyleElement?.remove();
                };
            }
        } else if (!this.pressed) {
            this.renderer.removeClass(this._tableElement, "cs-table-resizing");
            this._removeHighlightBorderStyle?.();
        }
    }

    private setupResizable(enabled: boolean) {
        this.ngZone.runOutsideAngular(() => {
            const registered = this.eventManager.has('enable-resize');
            if (enabled && !registered) {
                if (!this._highlightBorderStyles) {
                    const columnClass = this.columnDef._columnCssClassName.find(c => c.startsWith(`cdk-column-`));
                    if (columnClass)
                        this._highlightBorderStyles = this._csTableResizable?.highlightCssTemplate(columnClass);
                }

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
        this._csTableResizable?.setColumnSize(this.columnDef.name, value);
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
        if (this.pressed) {
            this.pressed = false;
            this.renderer.removeClass(this._tableElement, "cs-table-resizing");
            this._removeHighlightBorderStyle?.();
        }
    };
    //#endregion
}