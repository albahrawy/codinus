/* eslint-disable @angular-eslint/no-inputs-metadata-property */
import { CdkColumnDef, CdkHeaderCellDef, CdkHeaderRowDef } from "@angular/cdk/table";
import { Directive, Signal, TemplateRef, Type, computed, contentChild, effect, inject, input } from "@angular/core";
import { MAT_FORM_FIELD } from "@angular/material/form-field";
import { RUNTIME_MAT_FORM_FIELD } from "@ngx-codinus/core/shared";
import { CSTableColumnDataDef } from "../data/dataDef.directive";
import {
    CODINUS_TABLE_COMPONENT_FACTORY, CSTableFilterType,
    ICSCellFilterChangedArgs, ICSTableFilterElement
} from "../shared/types";
import { CSTableFilterEvents } from "./filter-events.directive";

declare module '@angular/cdk/table' {
    interface CdkColumnDef {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filterCell: CSCdkFilterCellDef<any, any>;
    }
}

@Directive()
export abstract class CSFilterCellDefBase<T extends CSTableFilterType = null, TOption = unknown> extends CdkHeaderCellDef {

    private _componentFactory = inject(CODINUS_TABLE_COMPONENT_FACTORY, { optional: true });
    private _columnDef = inject(CdkColumnDef);
    private _columnDataDef = inject(CSTableColumnDataDef, { optional: true });
    private _tableEvents = inject(CSTableFilterEvents, { optional: true });

    filterComponent = computed<Type<ICSTableFilterElement> | null>(() => {
        const filterType = this.filterType();
        if (!filterType)
            return null;
        return typeof filterType === 'string'
            ? this._componentFactory?.getFilterComponent(filterType) ?? null
            : (filterType instanceof Type)
                ? filterType
                : null;
    });

    abstract filterType: Signal<T | null>;

    abstract options: Signal<TOption | null>;

    abstract customKey: Signal<string | null>;

    filterkey = computed(() => this.customKey() ?? this._columnDataDef?.dataKey() ?? this._columnDef.name);

    changeFilter(args: ICSCellFilterChangedArgs) {
        this._tableEvents?.changeFilter(args);
    }

    clearFilter(key: string) {
        this._tableEvents?.clearFilter(key);
    }
}

@Directive({
    selector: '[cdkFilterCellDef]',
    providers: [
        { provide: MAT_FORM_FIELD, useValue: undefined },
        { provide: RUNTIME_MAT_FORM_FIELD, useValue: undefined },
    ]
})
export class CSCdkFilterCellDef<T extends CSTableFilterType = null, TOption = unknown> extends CSFilterCellDefBase<T, TOption> {

    filterType = input<T>(null as T, { alias: 'cdkFilterCellDef' });
    options = input<TOption | null>(null, { alias: 'cdkFilterCellDefOptions' });
    customKey = input<string | null>(null, { alias: 'cdkFilterCellDefKey' });
}

@Directive({
    selector: '[matFilterCellDef]',
    providers: [
        { provide: MAT_FORM_FIELD, useValue: undefined },
        { provide: RUNTIME_MAT_FORM_FIELD, useValue: undefined },
        { provide: CSCdkFilterCellDef, useExisting: CSMatFilterCellDef },
    ]
})
export class CSMatFilterCellDef<T extends CSTableFilterType = null, TOption = unknown> extends CSFilterCellDefBase<T, TOption> {
    filterType = input<T>(null as T, { alias: 'matFilterCellDef' });
    options = input<TOption | null>(null, { alias: 'matFilterCellDefOptions' });
    customKey = input<string | null>(null, { alias: 'matFilterCellDefKey' });

}


@Directive({
    selector: '[cdkColumnDef]',
})
export class CSCdkFilterColumnDef {
    private columnDef = inject(CdkColumnDef, { self: true });
    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        effect(() => this.columnDef.filterCell = this.filterCell()!);
    }
    filterCell = contentChild(CSCdkFilterCellDef);
}

@Directive({
    selector: '[matColumnDef]',
})
export class CSMatFilterColumnDef extends CSCdkFilterColumnDef {
}

@Directive({
    selector: '[cdkFilterRowDef], [matFilterRowDef]',
    providers: [{
        provide: CdkHeaderRowDef, useExisting: CSCdkFilterRowDef
    }],
    inputs: ['columns: cdkFilterRowDef', 'sticky: cdkFilterRowDefSticky'],
})
export class CSCdkFilterRowDef extends CdkHeaderRowDef {
    override extractCellTemplate(column: CdkColumnDef): TemplateRef<unknown> {
        return column.filterCell.template;
    }
}

@Directive({
    selector: '[matFilterRowDef]',
    providers: [{ provide: CdkHeaderRowDef, useExisting: CSMatFilterRowDef },
    { provide: CSCdkFilterRowDef, useExisting: CSMatFilterRowDef }
    ],
    inputs: ['columns: matFilterRowDef', 'sticky: matFilterRowDefSticky'],
})
export class CSMatFilterRowDef extends CSCdkFilterRowDef { }