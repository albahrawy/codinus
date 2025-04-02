import { CdkDrag } from '@angular/cdk/drag-drop';
import { CdkColumnDef, CdkTable } from '@angular/cdk/table';
import {
    Directive, Injector, OnDestroy, Renderer2, booleanAttribute, effect, inject,
    input, runInInjectionContext
} from '@angular/core';
import { addStyleSectionToDocument, findElementAttributeByPrefix, HTMLStyleElementScope } from '@codinus/dom';
import { NG_CONTENT_PREFIX, NG_HOST_PREFIX } from '../shared/internal';
import { CSCDKTableReorderColumns } from './reorder.directive';

@Directive({
    selector: 'mat-header-cell[reordable], cdk-header-cell[reordable]',
    hostDirectives: [CdkDrag],
    host: {
        'class': 'cdk-drag',
    },
})
export class CSColumnReordable implements OnDestroy {

    private _columnDef = inject(CdkColumnDef);
    private _dropContainer = inject(CSCDKTableReorderColumns, { skipSelf: true, optional: true });
    private _cdkDrag = inject(CdkDrag, { self: true });

    private _cssElement?: HTMLStyleElementScope;

    reordable = input(false, { transform: booleanAttribute });

    constructor() {
        this._cssElement = this.addCssToDocument();
        effect(() => {
            const draggable = this.reordable() && this._dropContainer?.reorderColumns();
            this._cdkDrag.previewClass = 'cs-column-drag-preview';
            this._cdkDrag.data = this._columnDef.cssClassFriendlyName;
            this._cdkDrag.boundaryElement = '.cs-table-reorder-columns .cdk-header-row';
            this._cdkDrag.dragStartDelay = 50;
            this._cdkDrag.disabled = !draggable;
        });
    }

    ngOnDestroy(): void {
        this._cssElement?.remove();
    }

    private addCssToDocument() {
        const tableElement = this._dropContainer?.elementRef.nativeElement;
        const columnClass = this._columnDef._columnCssClassName.find(c => c == `cdk-column-${this._columnDef.cssClassFriendlyName}`);
        const tableNgAttributes = findElementAttributeByPrefix(tableElement?.attributes, NG_HOST_PREFIX, NG_CONTENT_PREFIX);
        const _hostCssId = tableNgAttributes[NG_HOST_PREFIX] ?? tableNgAttributes[NG_CONTENT_PREFIX] ?? '';
        const variableName = `--cs-${this._columnDef.cssClassFriendlyName}-drag-transform`;
        const _isolationId = _hostCssId ? `[${_hostCssId}]` : '';
        const columnStyles = `
          ${_isolationId}.cdk-table.cdk-drop-list-dragging .${columnClass}{
            transform: var(${variableName});
          }
        `;
        return addStyleSectionToDocument(`${columnClass}-draggable`, columnStyles);
    }
}