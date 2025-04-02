import { CdkColumnDef } from "@angular/cdk/table";
import {
    computed, contentChildren, Directive, effect, ElementRef,
    EventEmitter, inject, input, OnDestroy, Output
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
    addStyleSectionToDocument, findElementAttributeByPrefix,
    getCssSizeBreakpoint, HTMLStyleElementScope
} from "@codinus/dom";
import { arrayFromMap, arrayToMap } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { createMediaColumnProperty } from "@ngx-codinus/core/layout";
import { CODINUS_ELEMENT_RESIZE_OBSERVER, CSElementResizeObserverService } from "@ngx-codinus/core/observer";
import { forceInputSet } from "@ngx-codinus/core/shared";
import { CODINUS_TABLE_API_REGISTRAR, CSTableResponsive, ICSTableApiResponsive } from "../api";
import { CODINUS_TABLE_RESIZABLE } from "../columns/types";
import { CSTableDirective } from "../cs-table";
import { CSTableColumnDataDef } from "../data";
import { NG_CONTENT_PREFIX, NG_HOST_PREFIX } from "../shared/internal";
import { CODINUS_TABLE_RESPONSIVE_VIEW, ICSTableResponsiveArgs } from "./types";

@Directive({
    host: {
        'class': 'cs-table-grid',
        '[style.--cs-table-grid-column-responsive-sizes]': '_sizes()',
        '[style.--cs-responsive-cell-count]': 'displayedColumns().length',
        '[style.--cs-responsive-row-gap]': 'responsiveGap()',
        '[class.cs-table-responsive]': 'columnsInRow() > 0'
    }
})
export abstract class CSTableResponsiveViewBase implements OnDestroy, ICSTableApiResponsive {

    private _cellLabelCssElement?: HTMLStyleElementScope;

    protected _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });
    private _resizableDirective = inject(CODINUS_TABLE_RESIZABLE, { optional: true });
    private _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
    private _resizeObserverService = inject(CODINUS_ELEMENT_RESIZE_OBSERVER, { optional: true }) ??
        inject(CSElementResizeObserverService);

    private _containerWidth = toSignal(this._resizeObserverService.widthResizeObservable(this._elementRef.nativeElement));
    private _columnDataDefs = contentChildren(CSTableColumnDataDef);
    private _columnDefs = contentChildren(CdkColumnDef, { descendants: true });

    abstract displayedColumns: () => string[];

    @Output() viewChanged = new EventEmitter<ICSTableResponsiveArgs>();

    responsiveHeaderColumn = input('', { transform: (v: Nullable<string>) => v ?? '' });
    responsive = input<CSTableResponsive>(false);
    responsiveGap = input<string | null>('3px');

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
        const containerWidth = this._containerWidth() ?? this._elementRef.nativeElement.clientWidth;
        if (!containerWidth)
            return 0;

        const breakpoint = getCssSizeBreakpoint(containerWidth);
        return (breakpoint ? mediaInfo[breakpoint] : null) ?? mediaInfo['default'] ?? 0;

    });

    protected _sizes = computed(() => {
        const responsiveColumns = this.columnsInRow();
        if (responsiveColumns == 0 && this._resizableDirective)
            return null;

        const gridColumns = responsiveColumns > 0 ? responsiveColumns : this.displayedColumns().length;
        return `repeat(${gridColumns} , 1fr)`
    });

    constructor() {
        this._apiRegistrar?.register('tableApiResponsive', this);
        effect(() => {
            this.onViewChanged({ cells: this.displayedColumns().length, columns: this.columnsInRow() });
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

@Directive({
    selector: `mat-table:not([cs-table]):not([cs-table-tree])[responsive],
               cdk-table:not([cs-table]):not([cs-table-tree])[responsive]`,
    providers: [{ provide: CODINUS_TABLE_RESPONSIVE_VIEW, useExisting: CSCdkTableResponsiveView }]
})
export class CSCdkTableResponsiveView extends CSTableResponsiveViewBase {
    displayedColumns = input<string[]>([]);
}

@Directive({
    selector: `mat-table:not([cs-table-tree])[cs-table][responsive], 
               cdk-table:not([cs-table-tree])[cs-table][responsive],
               mat-table:not([cs-table-tree])[csTableFormInput][responsive], 
               cdk-table:not([cs-table-tree])[csTableFormInput][responsive]`,
    providers: [{ provide: CODINUS_TABLE_RESPONSIVE_VIEW, useExisting: CSTableResponsiveView }]

})
export class CSTableResponsiveView extends CSTableResponsiveViewBase {

    private csTableDirective = inject(CSTableDirective, { self: true });

    displayedColumns = computed(() => this.csTableDirective._displayedColumns())
}

function _generateCssContentRules(columnDef: CdkColumnDef, label: string, hostCssId: string, headerColumn?: string) {
    const columnClass = columnDef._columnCssClassName.find(c => c.startsWith(`cdk-column-`));
    if (headerColumn && columnDef.name === headerColumn) {
        if (!columnDef._columnCssClassName.includes('cs-table-cell-resposive-header'))
            columnDef._columnCssClassName.push('cs-table-cell-resposive-header');
    }
    return `${hostCssId} .${columnClass} {--cs-table-cell-data-label:'${label}';}`;
}
