/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/albahrawy/ngx-codinus/blob/main/LICENSE
 */
import { CdkVirtualScrollableElement, CdkVirtualScrollViewport, ViewportRuler } from '@angular/cdk/scrolling';
import { CdkTable, StickyStyler } from '@angular/cdk/table';
import { AfterViewInit, Directive, inject, Injector, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { HtmlElementRuler } from '@ngx-codinus/core/observer';
import { CODINUS_TABLE_API_REGISTRAR } from '../api';
import { CODINUS_VIRTUAL_TABLE_DATA_HANDLER } from './types';
import { CODINUS_OVERLAY_HOST } from '@ngx-codinus/cdk/overlays';

@Directive({
    selector: 'cdk-table:not([dataSource])[virtual-scroll], mat-table:not([dataSource])[virtual-scroll]',
    exportAs: 'csTableVirtualScroll',
    hostDirectives: [CdkVirtualScrollableElement, HtmlElementRuler],
})
export class CSTableVirtualScrollable implements AfterViewInit, OnInit {

    private _viewContainerRef = inject(ViewContainerRef);
    private _cdkTable = inject(CdkTable, { self: true });
    private _renderer = inject(Renderer2);
    private _injector = inject(Injector);
    private _overlay = inject(CODINUS_OVERLAY_HOST, { optional: true });

    private _repeater = inject(CODINUS_VIRTUAL_TABLE_DATA_HANDLER);
    private _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });
    protected _htmlElementRuler = inject(HtmlElementRuler, { self: true });
    private _vsViewport?: CdkVirtualScrollViewport;
    private _wrappedOnce = false;
    private _vsContainer?: HTMLElement;

    static {
        if (StickyStyler.prototype.updateStickyColumns.toString().indexOf("setTimeout") == -1) {
            const orig = StickyStyler.prototype.updateStickyColumns;
            StickyStyler.prototype.updateStickyColumns = function (rows, stickyStartStates, stickyEndStates, recalulcate) {
                setTimeout(() => orig.bind(this)(rows, stickyStartStates, stickyEndStates, recalulcate));
            }
        }
    }

    constructor() {
        this._apiRegistrar?.register('tableApiScrollable', this);
    }

    ngAfterViewInit(): void {
        this._wrapRowOutletInVSPort();
        this._overlay?.positioningSettled.subscribe(() => this._fixWrapper());
    }

    ngOnInit(): void {
        try {
            const injector = Injector.create({ providers: [{ provide: ViewportRuler, useValue: this._htmlElementRuler }], parent: this._injector });
            const viewportRef = this._viewContainerRef.createComponent(CdkVirtualScrollViewport, { injector });
            const viewport = viewportRef.instance;
            this._repeater.attach(viewport);
            this._renderer.addClass(viewport.elementRef.nativeElement, 'cs-table-scrollable-viewport');
            this._renderer.addClass(viewport._contentWrapper.nativeElement, 'cs-table-scrollable-content-wrapper');
            this._vsViewport = viewport;
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message.includes("itemSize"))
                    throw new Error('Error: cdk-table-virtual-scroll requires the "rowHeight" property to be set.');
                throw error;
            }
        }
    }

    get renderedRange() { return this._repeater?.viewChangeSignal(); }


    scrollToOffset(offset: number, behavior?: ScrollBehavior): void {
        this._vsViewport?.scrollToOffset(offset, behavior);
    }
    /**
     * Scrolls to the offset for the given index.
     * @param index The index of the element to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling. Default is behavior is `auto`.
     */
    scrollToIndex(index: number, behavior?: ScrollBehavior): void {
        this._vsViewport?.scrollToIndex(index, behavior);
    }

    scrollToStart(behavior?: ScrollBehavior): void {
        this._vsViewport?.scrollToIndex(0, behavior);
    }

    scrollToEnd(behavior?: ScrollBehavior): void {
        this._vsViewport?.scrollToIndex(this._vsViewport.getDataLength() - 1, behavior);
    }
    private _wrapRowOutletInVSPort() {

        if (!this._wrappedOnce && this._vsViewport && this._cdkTable._rowOutlet) {
            this._wrappedOnce = true;
            const _rowOutletNode = this._cdkTable._rowOutlet.elementRef.nativeElement;
            this._vsContainer = this._renderer.createComment('cs-virtual-scroll');
            this._renderer.insertBefore(_rowOutletNode.parentNode, this._vsContainer, _rowOutletNode);
            const _footerOutletNode = this._cdkTable._footerRowOutlet.elementRef.nativeElement;
            this._renderer.insertBefore(_rowOutletNode.parentNode, this._vsViewport.elementRef.nativeElement, _rowOutletNode);
            this._renderer.appendChild(this._vsViewport._contentWrapper.nativeElement, _rowOutletNode);
            const div = this._renderer.createElement('div');
            this._renderer.addClass(div, 'cs-table-sticky-footer-fixer');
            this._renderer.insertBefore(_footerOutletNode.parentNode, div, this._vsViewport.elementRef.nativeElement.nextSibling);
        }
    }

    private _fixWrapper() {
        if (!this._vsViewport || !this._wrappedOnce)
            return;
        if (this._vsContainer)
            this._renderer.insertBefore(this._vsContainer.parentElement, this._vsViewport.elementRef.nativeElement, this._vsContainer, true);
    }
}