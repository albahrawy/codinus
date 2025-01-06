import { CdkColumnDef } from "@angular/cdk/table";
import {
    computed, contentChildren, Directive, effect, ElementRef, EventEmitter, inject, input, OnDestroy,
    Output, Renderer2, RendererStyleFlags2
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { addStyleSectionToDocument, findElementAttributeByPrefix, getCssSizeBreakpoint, HTMLStyleElementScope } from "@codinus/dom";
import { arrayFromMap, arrayToMap } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { CSElementResizeObserverService } from "@ngx-codinus/cdk/observer";
import { CODINUS_ELEMENT_RESIZE_OBSERVER, createMediaColumnProperty } from "@ngx-codinus/core/layout";
import { forceInputSet } from "@ngx-codinus/core/shared";
import { CODINUS_TABLE_API_REGISTRAR, CSTableResponsive, ICSTableApiResponsive } from "../api";
import { CSTableColumnDataDef } from "../data";
import { NG_CONTENT_PREFIX, NG_HOST_PREFIX } from "../shared/internal";
import { ICSTableResponsiveArgs } from "./types";

@Directive({
    selector: `mat-table:not([virtual-scroll])[responsive],
               cdk-table:not([virtual-scroll])[responsive]`,
})
export class CSTableResponsiveView implements OnDestroy, ICSTableApiResponsive {

    private _cellLabelCssElement?: HTMLStyleElementScope;

    protected _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });
    private _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
    private _renderer = inject(Renderer2);
    private _resizeObserverService = inject(CODINUS_ELEMENT_RESIZE_OBSERVER, { optional: true }) ??
        inject(CSElementResizeObserverService);

    private _containerWidth = toSignal(this._resizeObserverService.widthResizeObservable(this._elementRef.nativeElement));
    private _columnDataDefs = contentChildren(CSTableColumnDataDef);
    private _columnDefs = contentChildren(CdkColumnDef, { descendants: true });

    @Output() viewChanged = new EventEmitter<ICSTableResponsiveArgs>();

    responsiveHeaderColumn = input('', { transform: (v: Nullable<string>) => v ?? '' });
    displayedColumns = input<string[]>([]);
    responsive = input<CSTableResponsive>(false);

    protected _responseMedia = computed(() => {
        const responsive = this.responsive();
        if (!responsive)
            return null;
        return createMediaColumnProperty(responsive);
    });

    columnsInRow = computed(() => {
        const mediaInfo = this._responseMedia();
        if (!mediaInfo)
            return 0;
        const breakpoint = getCssSizeBreakpoint(this._containerWidth());
        return breakpoint
            ? mediaInfo[breakpoint]
            : mediaInfo['default'] ?? 0;
    });

    constructor() {
        this._apiRegistrar?.register('tableApiResponsive', this);
        effect(() => {
            const el = this._elementRef.nativeElement;
            const responsiveColumns = this.columnsInRow();
            if (responsiveColumns > 0) {
                this._renderer.addClass(el, 'cs-table-responsive');
                this._renderer.setStyle(el, '--cs-responsive-column-in-row', `${100 / responsiveColumns}%`, RendererStyleFlags2.DashCase);
            } else {
                this._renderer.removeClass(el, 'cs-table-responsive');
            }
            this.onViewChanged({ cells: this.displayedColumns().length, columns: responsiveColumns });
        });

        effect(() => {
            this.updateCssContentRules(!!this.responsive(), this.responsiveHeaderColumn());
        });
    }

    setResponsive(value: CSTableResponsive): void {
        forceInputSet(this.responsive, value);
    }

    getResponsive(): CSTableResponsive {
        return this.responsive();
    }

    ngOnDestroy(): void {
        this._cellLabelCssElement?.remove();
    }

    protected onViewChanged(arg: ICSTableResponsiveArgs) {
        this.viewChanged.emit(arg);
    }

    private updateCssContentRules(responsive: boolean, headerColumn?: string) {
        this._cellLabelCssElement?.remove();
        if (responsive) {
            const dataColDef = this._columnDataDefs();
            const columnsDef = this._columnDefs();
            const columnMaps = arrayToMap(dataColDef, d => d.columnDef, d => d.label() ?? d.columnDef.name);
            columnsDef.forEach(d => !columnMaps.has(d) && columnMaps.set(d, d.name))
            const tableNgAttributes = findElementAttributeByPrefix(this._elementRef.nativeElement.attributes, NG_HOST_PREFIX, NG_CONTENT_PREFIX);
            const _hostCssId = tableNgAttributes[NG_HOST_PREFIX] ?? tableNgAttributes[NG_CONTENT_PREFIX] ?? '';
            const _isolationId = _hostCssId ? `[${_hostCssId}]` : '';
            const cssRules = arrayFromMap(columnMaps, (k, v) => _generateCssContentRules(k, v, _isolationId, headerColumn));
            this._cellLabelCssElement = addStyleSectionToDocument(`${_isolationId}-cell-label`, cssRules.join(' '));
        }
    }
}

function _generateCssContentRules(columnDef: CdkColumnDef, label: string, hostCssId: string, headerColumn?: string) {
    const columnClass = columnDef._columnCssClassName.find(c => c == `cdk-column-${columnDef.cssClassFriendlyName}`);
    if (headerColumn && columnDef.name === headerColumn) {
        if (!columnDef._columnCssClassName.includes('cs-table-cell-resposive-header'))
            columnDef._columnCssClassName.push('cs-table-cell-resposive-header');
    }
    return `${hostCssId} .${columnClass} {--cs-table-cell-data-label:'${label}';}`;
}
