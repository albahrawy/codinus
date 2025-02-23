import { CdkColumnDef } from '@angular/cdk/table';
import { Directive, booleanAttribute, computed, inject, input, signal } from '@angular/core';
import { getValue, setValue } from '@codinus/js-extensions';
import { Nullable } from '@codinus/types';
import { CSAggregation } from '@ngx-codinus/core/data';
import { CODINUS_VALUE_FORMATTER } from '@ngx-codinus/core/format';
import {
    CODINUS_DATA_SOURCE_DIRECTIVE, CSAggregationFn, CSFormatterFn, ICSColumnDataAccessor,
    ICSColumnDataDef, ICSTableDataSourceDirective
} from './types';

const DefaultFormatter = (value: unknown) => value != null ? String(value) : null;

@Directive()
export abstract class CSTableColumnDataDefBase<TRow = unknown, TValue = unknown> implements ICSColumnDataDef<TRow, TValue> {

    readonly columnDef = inject(CdkColumnDef, { self: true });

    abstract dataKey(): string;
    abstract readOnly(): boolean;
    abstract cellValueAccessor: () => ICSColumnDataAccessor<TRow, TValue>;
}

@Directive({
    selector: `[matColumnDef][csColumnDataDef], [cdkColumnDef][csColumnDataDef]`
})
export class CSTableColumnDataDef<TRow = unknown, TValue = unknown> extends CSTableColumnDataDefBase<TRow, TValue> {

    protected readonly dataSourceDirective = inject<ICSTableDataSourceDirective<TRow>>(CODINUS_DATA_SOURCE_DIRECTIVE, { optional: true });
    protected readonly formatProvider = inject(CODINUS_VALUE_FORMATTER, { optional: true });

    cellValueGetter = input<(data: TRow | null, key?: string) => Nullable<TValue>>();
    cellValueSetter = input<(data: TRow, value?: Nullable<TValue>, key?: string) => void>();
    cellDefaultValue = input<Nullable<TValue>>();
    cellFormatter = input<Nullable<string | CSFormatterFn<TValue>>>();
    footerAggregation = input<CSAggregation | CSAggregationFn<TRow>>();
    footerDefaultValue = input<Nullable<TValue>>();
    footerFormatter = input<Nullable<string | CSFormatterFn<TValue>>>();
    userDataKey = input<Nullable<string>>(undefined, { alias: 'dataKey' });

    // using for responsive label 
    label = input<string | null>();
    readOnly = input(false, { transform: booleanAttribute });
    dataKey = computed(() => this.userDataKey() || this.columnDef.name);
    cellValueAccessor = computed(() => ({
        getValue: this.getValueFN(),
        setValue: this.setValueFN(),
        getFooterValue: this.getFooterValueFN(),
        formatValue: this.formatValueFN(),
        formatFooter: this.formatFooterFN()
    }));

    private getValueFN = computed(() => {
        const fn = this.cellValueGetter();
        const key = this.dataKey();
        const defValue = this.cellDefaultValue();

        return (typeof fn === 'function') ?
            (data: TRow | null) => (fn(data, key) ?? defValue)
            : (data: TRow | null) => getValue<Nullable<TValue>>(data, key) ?? defValue;
    });

    private setValueFN = computed(() => {
        const fn = this.cellValueSetter();
        const key = this.dataKey();

        return (typeof fn === 'function') ?
            (data: TRow, value: Nullable<TValue>) => (fn(data, value, key))
            : (data: TRow, value: Nullable<TValue>) => setValue(data, key, value, true);
    });

    private getFooterValueFN = computed(() => {
        const fn = this.footerAggregation();
        const key = this.dataKey();
        const defValue = this.footerDefaultValue();
        const getData = this.dataSourceDirective?.getData() ?? [];
        const aggregator = (type: CSAggregation) => this.dataSourceDirective?.aggregate(key, type) ?? null;
        return (typeof fn === 'function')
            ? () => (fn(key, getData) ?? defValue)
            : typeof fn === 'string'
                ? () => aggregator(fn)
                : () => defValue;
    });

    private formatValueFN = computed(() => {
        const fn = this.cellFormatter();
        const provider = this.formatProvider;

        return (typeof fn === 'function')
            ? fn
            : typeof fn === 'string' && provider
                ? (value: Nullable<TValue>, lang?: string) => provider.format(value, fn, lang)
                : DefaultFormatter
    });

    private formatFooterFN = computed(() => {
        const fn = this.footerFormatter();
        const provider = this.formatProvider;

        return (typeof fn === 'function')
            ? fn
            : typeof fn === 'string' && provider
                ? (value: Nullable<TValue>, lang?: string) => provider.format(value, fn, lang)
                : this.formatValueFN()
    });
}

@Directive({
    selector: `[matColumnDef]:not([csColumnDataDef]),
               [cdkColumnDef]:not([csColumnDataDef])`,
    providers: [{ provide: CSTableColumnDataDef, useExisting: CSDefaultColumnDataDef }]
})
export class CSDefaultColumnDataDef<TRow, TValue> extends CSTableColumnDataDefBase<TRow, TValue> {
    constructor() {
        super();
        const key = this.columnDef.name;
        this.cellValueAccessor = () => ({
            getValue: (data: TRow | null) => getValue<Nullable<TValue>>(data, key),
            setValue: (data: TRow, value: Nullable<TValue>) => setValue(data, key, value, true),
            getFooterValue: () => null,
            formatValue: DefaultFormatter,
            formatFooter: DefaultFormatter
        });
    }
    label = signal(this.columnDef.name);
    dataKey() { return this.columnDef.name; }
    readOnly() { return false; }
    cellValueAccessor;
}