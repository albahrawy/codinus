import { CdkColumnDef } from '@angular/cdk/table';
import { Directive, booleanAttribute, computed, inject, input } from '@angular/core';
import { getValue, setValue } from '@codinus/js-extensions';
import { Nullable } from '@codinus/types';
import { CSAggregation } from '@ngx-codinus/core/data';
import { CODINUS_VALUE_FORMATTER } from '@ngx-codinus/core/format';
import { CSTableDataSourceDirective } from './datasource.directive';
import { CSAggregationFn, CSFormatterFn, ICSColumnDataDef } from './types';

const DefaultFormatter = (value: unknown) => value != null ? String(value) : null;


export class CSDefaultColumnDataDef<TRow, TValue> implements ICSColumnDataDef<TRow, TValue> {

    constructor(public columnDef: CdkColumnDef) {
        const key = this.columnDef.name;
        this.cellValueAccessor = () => ({
            getValue: (data: TRow | null) => getValue<Nullable<TValue>>(data, key),
            setValue: (data: TRow, value: Nullable<TValue>) => setValue(data, key, value, true),
            getFooterValue: () => null,
            formatValue: DefaultFormatter,
            formatFooter: DefaultFormatter
        });
    }

    dataKey() { return this.columnDef.name; }
    readOnly() { return false; }
    cellValueAccessor;
}

@Directive({
    selector: `[matColumnDef][cellFormatter],
               [matColumnDef][footerFormatter],
               [matColumnDef][cellValueGetter],
               [matColumnDef][cellValueSetter],
               [matColumnDef][footerAggregation],
               [matColumnDef][cellDefaultValue],
               [matColumnDef][footerDefaultValue],
               [matColumnDef][dataKey],
               [matColumnDef][readOnly],
               [matColumnDef][label],
               [cdkColumnDef][cellFormatter],
               [cdkColumnDef][footerFormatter],
               [cdkColumnDef][cellValueGetter],
               [cdkColumnDef][cellValueSetter],
               [cdkColumnDef][footerAggregation],
               [cdkColumnDef][cellDefaultValue],
               [cdkColumnDef][footerDefaultValue],
               [cdkColumnDef][dataKey],
               [cdkColumnDef][readOnly],
               [cdkColumnDef][label]
               `
})
export class CSTableColumnDataDef<TRow = unknown, TValue = unknown> implements ICSColumnDataDef<TRow, TValue> {

    private _dateKey: Nullable<string>;
    protected readonly dataSourceDirective = inject(CSTableDataSourceDirective, { optional: true });
    protected readonly formatProvider = inject(CODINUS_VALUE_FORMATTER, { optional: true });
    readonly columnDef = inject(CdkColumnDef, { self: true });


    cellValueGetter = input<(data: TRow | null, key?: string) => Nullable<TValue>>();
    cellValueSetter = input<(data: TRow, value?: Nullable<TValue>, key?: string) => void>();
    cellDefaultValue = input<Nullable<TValue>>();
    cellFormatter = input<Nullable<string | CSFormatterFn<TValue>>>();
    footerAggregation = input<CSAggregation | CSAggregationFn<TRow>>();
    footerDefaultValue = input<Nullable<TValue>>();
    footerFormatter = input<Nullable<string | CSFormatterFn<TValue>>>();
    // using for responsive label 
    label = input<string | null>();


    userDataKey = input<Nullable<string>>(undefined, { alias: 'dataKey' });
    readOnly = input(false, { transform: booleanAttribute });


    dataKey = computed(() => this.userDataKey() || this.columnDef.name);

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

    cellValueAccessor = computed(() => ({
        getValue: this.getValueFN(),
        setValue: this.setValueFN(),
        getFooterValue: this.getFooterValueFN(),
        formatValue: this.formatValueFN(),
        formatFooter: this.formatFooterFN()
    }));
}
