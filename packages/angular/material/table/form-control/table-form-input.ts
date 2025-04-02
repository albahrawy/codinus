import { booleanAttribute, computed, Directive, inject, Input, input, output } from "@angular/core";
import { MAT_FORM_FIELD } from "@angular/material/form-field";
import { isEmpty } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { RUNTIME_MAT_FORM_FIELD } from "@ngx-codinus/core/shared";
import { CSMatFormFieldControl, IMatFormFieldSupport } from "@ngx-codinus/material/inputs";
import { EditablePredicate } from "../api/types";
import { CSTableDirective } from "../cs-table/cs-table.directive";
import { CSTableDataSource } from "../data/datasource";
import { ICSDataModifedArgs } from "../data/types";
import { CSTableEditRegistryHandler } from "../editors/table-edit-registry";
import { CODINUS_TABLE_EDIT_REGISTRY, ICSTableEditorContext, ICSTableEditRegistry } from "../shared";
import { CSTableInternalDataSourceDirective } from "../data/internal-datasource.directive";
import { CSCDKTableReorderColumns } from "../columns";
import { CSTableApiEditModel } from "./table-edit-model";


@Directive({
    selector: 'mat-table:not([dataSource]):not([virtual-scroll])[csTableFormInput]',
    exportAs: 'csTableFormInput',
    host: {
        'class': 'cs-table',
        '[class.cs-table-form-input-disabled]': 'disabled',
        '[attr.editing-mode]': 'inEditMode()',

    },
    hostDirectives: [CSMatFormFieldControl, CSTableInternalDataSourceDirective],
    providers: [
        { provide: CODINUS_TABLE_EDIT_REGISTRY, useExisting: CSTableFormInput },
        { provide: MAT_FORM_FIELD, useValue: null },
        { provide: RUNTIME_MAT_FORM_FIELD, useValue: null },
        { provide: CSTableDirective, useExisting: CSTableFormInput },
        { provide: CSCDKTableReorderColumns, useExisting: CSTableDirective },
    ]
})
export class CSTableFormInput<TRecord = unknown> extends CSTableDirective<TRecord>
    implements IMatFormFieldSupport<TRecord[] | null>, ICSTableEditRegistry<TRecord> {

    private readonly _mfc = inject(CSMatFormFieldControl, { self: true }).setComponent(this);
    private _dataSource = new CSTableDataSource<TRecord>();
    private _dataSourceDirective = inject(CSTableInternalDataSourceDirective<TRecord>, { self: true });

    constructor() {
        super();
        this._dataSourceDirective.dataSource.set(this._dataSource);
        this._cdkTable.dataSource = this._dataSource;
        this._apiRegistrar?.register('editableDirective', new CSTableApiEditModel(this));
        this._dataSourceDirective.dataModified.subscribe(args => {
            this.edited.emit(args)
            this._mfc.notifyChange(this.value);
        });
    }

    private _registry = new CSTableEditRegistryHandler<TRecord>();
    get activeEditorContext() { return this._registry.activeEditorContext; }

    protected inEditMode = this._registry.inEditMode;

    edited = output<ICSDataModifedArgs<TRecord>>();

    readOnly = input(false, { transform: booleanAttribute });
    commitOnDestroy = input(false, { transform: booleanAttribute });
    editWithF2 = input(false, { transform: booleanAttribute });
    editWithEnter = input(false, { transform: booleanAttribute });
    editablePredicate = input<EditablePredicate>();

    canEdit = computed(() => !this.disabled && !this.readOnly());

    register(editor: ICSTableEditorContext<TRecord> | null): void {
        this._registry.register(editor);
    }

    unregister(commit: boolean): void {
        this._registry.unregister(commit);
    }

    getEditorContext(key?: string, rowData?: Nullable<TRecord>): ICSTableEditorContext<TRecord> | null {
        return this._registry.getEditorContext(key, rowData);
    }

    notify(affected: TRecord): void {
        this._registry.notify(affected);
    }

    addNew() {
        this._apiRegistrar?.getApi().addRecord();
    }

    removeSelected() {
        this._apiRegistrar?.getApi().removeSelected(true);
    }

    @Input()
    get value(): TRecord[] | null {
        const data = this._dataSource.data;
        return isEmpty(data) ? null : data;
    }
    set value(value: TRecord[] | null) {
        this._dataSource.data = value ?? [];
        this._mfc.notifyChange(this.value);
    }

    @Input({ transform: booleanAttribute }) disabled = false;

    get shouldLabelFloat(): boolean { return true; }
    get empty(): boolean { return isEmpty(this.value); }

    focus(): void {
        this._elementRef.nativeElement.focus();
    }

    writeValue(value: TRecord[] | null): void {
        this._dataSource.data = value ?? [];
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}