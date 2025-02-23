import { computed, Directive, inject, input } from "@angular/core";
import { Nullable } from "@codinus/types";

import { booleanTrueAttribute, signalVersion } from "@ngx-codinus/core/shared";
import { CSTableDirective } from "../cs-table/cs-table.directive";
import { CODINUS_TABLE_RESIZABLE } from "./types";

@Directive({
    host: {
        '[style.--cs-table-grid-column-sizes]': '_sizes()'
    }
})
export abstract class CSTableResizableBase {

    private _sizesMap = new Map<string, Nullable<string>>();
    private _renderVersion = signalVersion();

    resizable = input(true, { transform: booleanTrueAttribute });
    abstract displayedColumns: () => string[];

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
}

@Directive({
    selector: 'mat-table:not([cs-table])[resizable], cdk-table:not([cs-table])[resizable]',
    providers: [{ provide: CODINUS_TABLE_RESIZABLE, useExisting: CSCdkTableResizable }]
})
export class CSCdkTableResizable extends CSTableResizableBase {
    displayedColumns = input<string[]>([]);
}

@Directive({
    selector: 'mat-table[cs-table][resizable], cdk-table[cs-table][resizable]',
    providers: [{ provide: CODINUS_TABLE_RESIZABLE, useExisting: CSTableResizable }]

})
export class CSTableResizable extends CSTableResizableBase {

    private csTableDirective = inject(CSTableDirective, { self: true });

    displayedColumns = computed(() => this.csTableDirective._displayedColumns())
}