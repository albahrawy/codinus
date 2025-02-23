/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdkPortalOutletAttachedRef, ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import {
    Component, ComponentRef, Type, computed, contentChild, effect, inject, input,
    linkedSignal, output, signal, viewChild
} from '@angular/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { arrayIntersection, getValue } from '@codinus/js-extensions';
import { Nullable } from '@codinus/types';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { isTableFilterElement } from '../../shared/function';
import {
    CODINUS_TABLE_FILTER_ELEMENT, CSTableFilterPredicates,
    ICSCellFilterChangedArgs, ValueConverterFactoryFn
} from '../../shared/types';
import { CSCdkFilterCellDef } from '../filter-def.directive';

@Component({
    selector: 'cs-filter, [cs-filter]',
    templateUrl: 'filter.component.html',
    styleUrls: [`./filter.component.scss`],
    host: {
        '[class.cs-table-filtered]': 'filtered()',
        '[class.cs-table-trigger-shown]': 'shouldShowTrigger'
    },
    imports: [MatMenuModule, CSTranslatePipe, PortalModule, NgTemplateOutlet]
})

export class CSTableFilterComponent {

    private filterCellDef = inject(CSCdkFilterCellDef);

    private _valueConverterFactory: Nullable<ValueConverterFactoryFn>;
    private _currentFilter = signal<unknown | null | undefined>(undefined);
    private componentDefaultOperation = signal<Nullable<string>>(null);
    private predicates = signal({} as CSTableFilterPredicates<unknown>);

    defaultOperation = input<Nullable<string>>(null);
    operations = input<Nullable<string[]>>(null);

    filterChanged = output<ICSCellFilterChangedArgs>();
    filterCleared = output<string>();

    protected menu = viewChild(MatMenuTrigger);
    protected customTemplate = contentChild(CODINUS_TABLE_FILTER_ELEMENT);

    protected _operations = computed(() => {
        const _allOperations = Object.keys(this.predicates());
        const _inputOperations = this.operations();
        if (!_inputOperations)
            return _allOperations;
        return arrayIntersection(_inputOperations, _allOperations);
    });

    protected _currentOperation = linkedSignal(() => {
        const _operations = this._operations();
        const _defaultOperation = this.componentDefaultOperation() ?? this.defaultOperation();

        if (_defaultOperation && _operations.includes(_defaultOperation))
            return _defaultOperation;
        return _operations.at(0) ?? null;
    });

    private _currentPredicate = computed(() => {
        const _operations = this.predicates();
        const _currentOperation = this._currentOperation();
        return _currentOperation ? _operations[_currentOperation] ?? null : null;
    });

    protected filterPortal = linkedSignal(() => {
        const component = this.filterCellDef.filterComponent();
        return component instanceof Type
            ? new ComponentPortal(component)
            : null;
    });

    constructor() {
        effect(() => {
            const key = this.filterCellDef.filterkey();
            if (!key)
                return;
            const currentFilter = this._currentFilter();
            if (currentFilter === undefined)
                return;
            if (currentFilter === null)
                return this.handleClearFilter(key);
            this._handleFilterChanged(key, currentFilter);
        });

        effect(() => {
            if (this.filterPortal())
                return;
            const customTemplate = this.customTemplate();
            if (customTemplate)
                this.attach(customTemplate);
        });
    }

    private _handleFilterChanged(key: string, currentFilter: unknown): void {
        const currentPredicate = this._currentPredicate();
        if (!currentPredicate || !key || currentFilter == null)
            return;

        const converter = this._valueConverterFactory?.();
        const value = converter ? converter(currentFilter) : currentFilter;
        const filter = `${key} ${this._currentOperation()} ${value}`;
        const predicate = converter
            ? (data: any) => currentPredicate(converter(getValue(data, key)), value)
            : (data: any) => currentPredicate(getValue(data, key), value);

        const args = { key, value, predicate, filter };
        this.filterChanged.emit(args);
        this.filterCellDef.changeFilter(args);
    }

    private handleClearFilter(key: string): void {
        this.filterCleared.emit(key);
        this.filterCellDef.clearFilter(key);
    }

    protected filtered = computed(() => !!this._currentFilter());

    protected get shouldShowTrigger(): boolean {
        return this.menu()?.menuOpen || this.filtered();
    }

    changefilter(value: unknown): void {
        this._currentFilter.set(value);
    }

    clearfilter() {
        this._currentFilter.set(null);
    }

    protected attach(ref: CdkPortalOutletAttachedRef | unknown) {
        const instance = ref instanceof ComponentRef ? ref.instance : ref;
        if (!isTableFilterElement(instance)) {
            this.filterPortal.set(null);
            throw new Error(`${instance?.constructor?.name} did not implement ITableFilterElement correctly`);
        }

        this.predicates.set(instance.predicates);
        this.componentDefaultOperation.set(instance.defaultOperation);
        this._valueConverterFactory = instance.valueConverterFactory;
        instance.registerChangeFilter?.(args => this.changefilter(args));
        instance.registerClearFilter?.(() => this.clearfilter());
    }
}