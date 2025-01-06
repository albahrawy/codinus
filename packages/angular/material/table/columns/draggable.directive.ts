import { CdkDrag } from '@angular/cdk/drag-drop';
import { CdkColumnDef } from '@angular/cdk/table';
import {
    Directive, Injector, OnDestroy, Renderer2, booleanAttribute, effect, inject,
    input, runInInjectionContext
} from '@angular/core';
import { addStyleSectionToDocument, findElementAttributeByPrefix } from '@codinus/dom';
import { NG_CONTENT_PREFIX, NG_HOST_PREFIX } from '../shared/internal';
import { CSTableReorderColumns } from './reorder.directive';

@Directive({
    selector: 'mat-header-cell[reordable], cdk-header-cell[reordable]',
    host: {
        'class': 'cdk-drag',
    },
})
export class CSColumnDraggable implements OnDestroy {

    private _injector = inject(Injector);
    private _columnDef = inject(CdkColumnDef);
    private _renderer = inject(Renderer2);
    private _dropContainer = inject(CSTableReorderColumns, { skipSelf: true, optional: true });

    private _cdkDragInfo?: { _cdkDrag: CdkDrag, _destroy: () => void };

    reordable = input(false, { transform: booleanAttribute });

    constructor() {
        effect(() => {
            const draggable = this.reordable() && this._dropContainer?.reorderColumns();
            if (draggable && !this._cdkDragInfo) {
                runInInjectionContext(this._injector, () => {
                    this._cdkDragInfo = this._createCdkDrag();
                });
            } else if (!draggable && this._cdkDragInfo) {
                this._destroyDrag();
            }
        });
    }

    ngOnDestroy(): void {
        this._destroyDrag();
    }

    private addCssToDocument(element: HTMLElement) {
        const headerRow = this._renderer.parentNode(element);
        const headerRowParent = this._renderer.parentNode(headerRow);
        const tableElement = (headerRow.tagName === 'TH') ? this._renderer.parentNode(headerRowParent) : headerRowParent;
        const columnClass = this._columnDef._columnCssClassName.find(c => c == `cdk-column-${this._columnDef.cssClassFriendlyName}`);
        const tableNgAttributes = findElementAttributeByPrefix(tableElement?.attributes, NG_HOST_PREFIX, NG_CONTENT_PREFIX);
        const _hostCssId = tableNgAttributes[NG_HOST_PREFIX] ?? tableNgAttributes[NG_CONTENT_PREFIX] ?? '';
        const variableName = `--cs-${this._columnDef.cssClassFriendlyName}-drag-transform`;
        const _isolationId = _hostCssId ? `[${_hostCssId}]` : '';
        const columnStyles = `
          ${_isolationId}.cs-table.dragging .${columnClass}{
            transform: var(${variableName});
          }
        `;
        return addStyleSectionToDocument(`${columnClass}-style`, columnStyles);
    }

    private _createCdkDrag = () => {
        if (!this._dropContainer)
            return;
        const _cdkDrag = new CdkDrag();
        _cdkDrag.previewClass = 'cs-column-drag-preview';
        _cdkDrag.data = this._columnDef.cssClassFriendlyName;
        _cdkDrag.boundaryElement = '.cs-table-reorder-columns .cdk-header-row';
        _cdkDrag.dragStartDelay = 50;
        _cdkDrag.ngAfterViewInit();
        const cssElement = this.addCssToDocument(_cdkDrag.element.nativeElement);
        const _destroy = () => {
            _cdkDrag.ngOnDestroy();
            cssElement?.remove();
        }
        return { _cdkDrag, _destroy };
    }

    private _destroyDrag() {
        this._cdkDragInfo?._destroy();
        this._cdkDragInfo = undefined;
    }
}