import { computed, Directive, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Nullable } from '@codinus/types';
import { CSTableReactiveCellBase } from '../cells/reactive-cell-base';
import {
    CODINUS_TABLE_EDIT_REGISTRY, ICSEditorHandler, ICSTableEditorCell, ICSTableEditorContext, ICSTableEditRegistry
} from '../shared/types';

@Directive({
    host: {
        'class': 'cs-table-editable-cell',
        '[class.cs-table-editable-cell-editing]': 'isEditing()'
    }
})
export abstract class CSTableEditableCellBase<TData, TValue = unknown> extends CSTableReactiveCellBase<TData, TValue>
    implements ICSTableEditorCell, ICSEditorHandler<TData, TValue>, OnInit, OnDestroy {

    get key() { return this.columnDataDef.dataKey(); }

    protected readonly editableRegistry = inject<ICSTableEditRegistry<TData>>(CODINUS_TABLE_EDIT_REGISTRY
        , { optional: true });
    readonly element: HTMLElement = this._elementRef.nativeElement;

    private _isEditing = signal(false);
    private _editorContext = signal<ICSTableEditorContext<TData, TValue> | null>(null);

    protected abstract focusCell(): void;

    get editWithEnter() { return this.editableRegistry?.editWithEnter(); }
    get editWithF2() { return this.editableRegistry?.editWithF2(); }

    isEditing = computed(() => this._isEditing());
    context = computed(() => this._editorContext());

    getParentRow() {
        let parent = this._elementRef.nativeElement.parentElement;
        while (parent) {
            if (parent.tagName === 'MAT-ROW' || parent.tagName === 'CDK-ROW') {
                return parent;
            }
            parent = parent.parentElement
        }
        return null;
    }


    canEdit = computed(() => {
        let isEditable = this.editableRegistry?.canEdit() && !this.columnDataDef.readOnly();
        const editPredicate = this.editableRegistry?.editablePredicate();
        if (isEditable && editPredicate)
            isEditable = editPredicate(this.columnDataDef.dataKey(), this.rowData);
        return isEditable ?? false;
    });

    ngOnInit(): void {
        this._restoreEditoState();
    }

    protected requestEdit() {
        if (!this.isEditing() && this.canEdit()) {
            if (!this._editorContext()) {
                this._editorContext.set({
                    data: this.rowData,
                    columnKey: this.columnDataDef.dataKey(),
                    value: this.value(),
                    editor: this
                });
            }
            this._isEditing.set(true);
            this.editableRegistry?.register(this._editorContext());
        }
    }

    commitPending() {
        this._isEditing.set(false);
        const context = this._editorContext();
        if (context) {
            this.commitValue(context.value);
            this._editorContext.set(null);
        }
    }

    commit(keepFocus?: boolean) {
        this.editableRegistry?.unregister(true);
        if (keepFocus)
            this.focusCell();
    }

    //TODO: emit when cell value Edited
    commitValue(value: Nullable<TValue>) {
        const oldValue = this.value();
        const data = this.rowData;
        if (data && value != oldValue) {
            this.valueAccessor().setValue(data, value);
            this.editableRegistry?.notify(data);
        }
    }

    undo() {
        this._isEditing.set(false);
        this._editorContext.set(null);
        this.editableRegistry?.unregister(false);
        this.focusCell();
    }

    ngOnDestroy(): void {
        if (this.isEditing() && this.editableRegistry?.commitOnDestroy())
            this.commit();
        //setTimeout(() => this.commit());
    }

    protected isNotOwnEditor() {
        const editor = this.editableRegistry?.activeEditorContext?.editor;
        return !!editor && editor !== this
    }

    private _restoreEditoState(): void {
        if (this.canEdit()) {
            const editorContextToRestore =
                this.editableRegistry?.getEditorContext(this.columnDataDef.dataKey(), this.rowData);
            if (editorContextToRestore)
                editorContextToRestore.editor = this;
            //this._editorContext.set(editorContextToRestore);
            if (this._editorContext()) {
                this._isEditing.set(true);
            }
        }
    }
}
