import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';
import { MAT_FORM_FIELD } from '@angular/material/form-field';
import { Nullable } from '@codinus/types';
import { RUNTIME_MAT_FORM_FIELD } from '@ngx-codinus/core/shared';
import { CODINUS_TABLE_API_REGISTRAR, EditablePredicate } from '../api/types';
import { CODINUS_TABLE_EDIT_REGISTRY, ICSTableEditorContext, ICSTableEditRegistry } from '../shared/types';
import { CSTableApiEditModel } from './table-api-editable-model';
import { CSTableEditRegistryHandler } from './table-edit-registry';

@Directive({
    selector: 'mat-table:not(csTableFormInput)[editable],cdk-table:not(csTableFormInput)[editable]',
    providers: [
        { provide: MAT_FORM_FIELD, useValue: null },
        { provide: RUNTIME_MAT_FORM_FIELD, useValue: null },
        { provide: CODINUS_TABLE_EDIT_REGISTRY, useExisting: CSTableEditableRegistry },
    ],
    host: {
        '[attr.editing-mode]': 'inEditMode()',
    }
})
export class CSTableEditableRegistry<TData> implements ICSTableEditRegistry<TData> {
    private _apiRegistrar = inject(CODINUS_TABLE_API_REGISTRAR, { self: true, optional: true });

    private _registry = new CSTableEditRegistryHandler<TData>();
    get activeEditorContext() { return this._registry.activeEditorContext; }

    protected inEditMode = this._registry.inEditMode;

    readOnly = input(false, { transform: booleanAttribute });
    commitOnDestroy = input(false, { transform: booleanAttribute });
    editWithF2 = input(false, { transform: booleanAttribute });
    editWithEnter = input(false, { transform: booleanAttribute });
    editablePredicate = input<EditablePredicate>();

    editable = input(false, { transform: booleanAttribute });
    canEdit = computed(() => this.editable() && !this.readOnly());

    constructor() {
        this._apiRegistrar?.register('editableDirective', new CSTableApiEditModel(this));
    }


    register(editor: ICSTableEditorContext<TData> | null): void {
        this._registry.register(editor);
    }

    unregister(commit: boolean): void {
        this._registry.unregister(commit);
    }

    getEditorContext(key?: string, rowData?: Nullable<TData>): ICSTableEditorContext<TData> | null {
        return this._registry.getEditorContext(key, rowData);
    }
    notify(affected: TData): void {
        this._registry.notify(affected);
    }
}