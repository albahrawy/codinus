import { CdkTable } from '@angular/cdk/table';
import { Directive, OnInit, inject, output } from '@angular/core';
import { CSTableApi } from './cdk-api';
import { CSTableApiKey } from './internal';
import {
    CODINUS_TABLE_API_REGISTRAR, ICSTableApi, ICSTableApiDataSourceDirective,
    ICSTableApiEditable, ICSTableApiKeyboardNavigation, ICSTableApiMetaRowVisibility, ICSTableApiRegistrar,
    ICSTableApiReorderColumns, ICSTableApiResponsive, ICSTableApiResponsiveStrategy, ICSTableApiScrollable,
    ICSTableApiSelectModel, ICSTableApiSortable
} from './types';

@Directive({
    selector: 'mat-table,cdk-table',
    exportAs: 'csTableApi',
    providers: [{ provide: CODINUS_TABLE_API_REGISTRAR, useExisting: CSTableApiIRegistrar }]
})
export class CSTableApiIRegistrar<TRow> implements ICSTableApiRegistrar<TRow>, OnInit {

    private _api: ICSTableApi<TRow> = new CSTableApi<TRow>(inject(CdkTable), this);
    getApi() { return this._api; }

    initialized = output<ICSTableApi<TRow>>();

    ngOnInit(): void {
        this.initialized.emit(this.getApi());
    }

    readonly metaRowDirective?: ICSTableApiMetaRowVisibility;
    readonly reorderDirective?: ICSTableApiReorderColumns;
    readonly sortableDirective?: ICSTableApiSortable;
    readonly dataSourceDirective?: ICSTableApiDataSourceDirective<TRow>;
    readonly editableDirective?: ICSTableApiEditable;
    readonly keyboardNavigationDirective?: ICSTableApiKeyboardNavigation;
    readonly tableApiResponsive?: ICSTableApiResponsive;
    readonly tableApiSelectModel?: ICSTableApiSelectModel;
    readonly tableApiScrollable?: ICSTableApiScrollable;
    readonly tableApiResponsiveStrategy?: ICSTableApiResponsiveStrategy;

    register<K extends CSTableApiKey>(key: K, api: this[K]) {
        this[key] = api;
    }
}