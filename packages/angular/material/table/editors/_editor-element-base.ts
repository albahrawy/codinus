import { computed, Directive, ElementRef, inject, signal, ɵWritable } from '@angular/core';
import { noopFn, Nullable } from '@codinus/types';
import {
    FunctionReturn, signalActionFromFunctionOrConfig, signalFunctionOf, signalFunctionValueOf, signalItemGetter
} from '@ngx-codinus/core/shared';
import { ICSEditorHandler, ICSTableEditorElement } from '../shared/types';
import { CSColumnEditorDef } from './column-editor-def.directive';
import { CSTableColumnDataDef } from '../data/dataDef.directive';
import { CODINUS_TABLE_API_REGISTRAR } from '../api/types';

const EmptyEditHandler = {
    rowData: null,
    value: () => null,
    context: () => null,
    canEdit: () => false,
    isEditing: () => false,
    commit: noopFn,
    commitValue: noopFn,
    undo: noopFn,
};

type TConfig<T> = T & { name: string };

@Directive({
    host: {
        'class': 'cs-table-cell-editor-element',
        '[class]': 'cssClass()'
    },
})
export abstract class CSTableEditorElementBase<TValue = unknown, TOptions = unknown, TData = unknown>
    implements ICSTableEditorElement<TData, TValue> {

    private _dataDef = inject(CSTableColumnDataDef);
    protected cellEditorDef = inject(CSColumnEditorDef, { optional: true });
    protected _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { optional: true });
    protected elementRef: ElementRef<HTMLElement> = inject(ElementRef);

    private _editHandler = signal<ICSEditorHandler<TData, TValue>>(EmptyEditHandler);

    protected options = computed<TConfig<TOptions>>(() => {
        return { ...this.cellEditorDef?.editorOptions(), name: this._dataDef.dataKey() }
    });

    protected readonly cssClass = computed(() => this.elementRef.nativeElement.tagName.toLowerCase());

    protected editHandler = computed(() => this._editHandler());
    protected context = computed(() => this._editHandler()?.context());
    protected canEdit = computed(() => this.editHandler().canEdit());
    protected events = computed(() => this._apiRegistrar?.events());
    protected prefix = computed(() => this._apiRegistrar?.prefix());

    protected get bindingValue() {
        return this.context()?.value;
    }
    protected set bindingValue(value: Nullable<TValue>) {
        const context = this.context();
        if (context)
            (context as ɵWritable<typeof context>).value = value;
    }

    initialize(): void { /** */ }

    registerHandler(handler: ICSEditorHandler<TData, TValue>): void {
        this._editHandler.set(handler);
    }

    commit(keepFocus = true) {
        this.editHandler().commit(keepFocus);
    }

    commitValue(value: TValue) {
        this.editHandler().commitValue(value);
    }

    undo() {
        this.editHandler().undo();
    }

    protected signalFunctionOf<T extends FunctionReturn>(key: string) {
        return signalFunctionOf<T>(this.events, this.options, key, this.prefix);
    }

    protected signalActionFromFunctionOrConfig<K extends keyof TConfig<TOptions> & string>(key: K) {
        return signalActionFromFunctionOrConfig(this.events, this.options, key, this.prefix);
    }

    protected signalItemGetter<R>(key: keyof TOptions & string) {
        return signalItemGetter<R, TConfig<TOptions>>(this.events, this.options, key, this.prefix);
    }

    protected signalFunctionValueOf<R>(key: string) {
        return signalFunctionValueOf<R | null>(this.events, this.options, key, this.prefix);
    }
}