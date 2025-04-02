import { computed, Directive, ElementRef, inject, input, signal } from "@angular/core";
import { Nullable } from "@codinus/types";

import { booleanTrueAttribute, signalVersion } from "@ngx-codinus/core/shared";
import { CSTableDirective } from "../cs-table/cs-table.directive";
import { CODINUS_TABLE_RESIZABLE, ICSTableResizable } from "./types";
import { findElementAttributeByPrefix } from "@codinus/dom";
import { NG_CONTENT_PREFIX, NG_HOST_PREFIX } from "../shared/internal";

@Directive({
    host: {
        '[style.--cs-table-grid-column-resizable-sizes]': '_sizes()',
        'class': 'cs-table-grid'
    }
})
export abstract class CSTableResizableBase implements ICSTableResizable {

    readonly elementRef = inject(ElementRef);
    private _sizesMap = new Map<string, Nullable<string>>();
    private _renderVersion = signalVersion();
    private _isDisabled = signal(false);

    setDisabledState(isDisabled: boolean) {
        this._isDisabled.set(isDisabled);
    }

    userResizable = input(true, { alias: 'resizable', transform: booleanTrueAttribute });

    resizable = computed(() => this.userResizable() && !this._isDisabled());

    abstract displayedColumns: () => string[];

    readonly highlightCssTemplate = this.buildHighlightCssTemplate();

    protected _sizes = computed(() => {
        this._renderVersion();
        const columns = this.displayedColumns();
        return columns.map(c => this._sizesMap.get(c) ?? '1fr').join(' ');
    });


    setColumnSize(key: string, value: Nullable<string>) {
        this._sizesMap.set(key, value);
        this._renderVersion.refresh();
    }

    getSize(key: string) {
        return this._sizesMap.get(key);
    }

    buildHighlightCssTemplate(): (columnClass: string) => string {
        const tableNgAttributes = findElementAttributeByPrefix(this.elementRef.nativeElement?.attributes, NG_HOST_PREFIX, NG_CONTENT_PREFIX);
        const _hostCssId = tableNgAttributes[NG_HOST_PREFIX] ?? tableNgAttributes[NG_CONTENT_PREFIX] ?? '';
        const _isolationId = _hostCssId ? `[${_hostCssId}]` : '';
        return (columnClass: string) => `
          ${_isolationId}.cdk-table.cs-table-resizing .${columnClass}{
            --cs-table-current-cell-resizing-cell-border: var(--cs-table-active-resizing-cell-border);
          }
        `;
    }
}

@Directive({
    selector: `mat-table:not([cs-table]):not([csTableFormInput])[resizable], 
               cdk-table:not([cs-table]):not([csTableFormInput])[resizable]`,
    providers: [{ provide: CODINUS_TABLE_RESIZABLE, useExisting: CSCdkTableResizable }]
})
export class CSCdkTableResizable extends CSTableResizableBase {
    displayedColumns = input<string[]>([]);
}

@Directive({
    selector: `mat-table[cs-table][resizable], cdk-table[cs-table][resizable],
               mat-table[csTableFormInput][resizable], cdk-table[csTableFormInput][resizable]`,
    providers: [{ provide: CODINUS_TABLE_RESIZABLE, useExisting: CSTableResizable }]

})
export class CSTableResizable extends CSTableResizableBase {

    private csTableDirective = inject(CSTableDirective, { self: true });

    displayedColumns = computed(() => this.csTableDirective._displayedColumns())
}