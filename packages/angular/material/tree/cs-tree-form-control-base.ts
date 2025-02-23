import { booleanAttribute, Directive, inject, Input, input } from "@angular/core";
import { isEmpty } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { CSMatFormFieldControl, IMatFormFieldSupport } from "@ngx-codinus/material/inputs";
import { CSTreeActionAreaContext } from "./cs-tree-actions/cs-tree-action-area";
import { CODINUS_TREE_FEATURES, ICSTreeActions, ICSTreeFeatures } from "./cs-types";

@Directive({
    host: {
        '[class.cs-tree-form-input-disabled]': 'disabled'
    },
})
export abstract class CSTreeFormInputBase<TRecord = unknown> implements IMatFormFieldSupport<TRecord[] | null>, ICSTreeActions<TRecord> {

    private readonly _mfc = inject(CSMatFormFieldControl, { self: true }).setComponent(this);
    private readonly _csTree = inject<ICSTreeFeatures<TRecord>>(CODINUS_TREE_FEATURES, { self: true });

    //changed = output<ICSTreeInputChangedArgs<TRecord>>();

    readOnly = input(false, { transform: booleanAttribute });

    /**
     *
     */
    constructor() {
        this._csTree._context = new CSTreeActionAreaContext(this);
    }

    add(row?: TRecord | TRecord[] | undefined, parent?: TRecord | undefined): TRecord[] {
        const data = this._csTree.add(row, parent);
        this._mfc.notifyChange(this.value);
        return data;
    }

    addToCurrent(row?: TRecord | TRecord[] | undefined): TRecord[] {
        const data = this._csTree.addToCurrent(row);
        this._mfc.notifyChange(this.value);
        return data;
    }

    remove(row?: TRecord | TRecord[] | null | undefined): void {
        this._csTree.remove(row);
        this._mfc.notifyChange(this.value);
    }

    setFilter(value: Nullable<string>): void {
        this._csTree.setFilter(value);
    }

    @Input()
    get value(): TRecord[] | null {
        const data = this._csTree.getData();
        return isEmpty(data) ? null : data;
    }
    set value(value: TRecord[] | null) {
        this._csTree._setDataSource(value ?? []);
        this._mfc.notifyChange(this.value);
    }

    @Input({ transform: booleanAttribute })
    get disabled() { return this._csTree.disabled; }
    set disabled(value: boolean) { this._csTree.disabled = value; }

    get shouldLabelFloat(): boolean { return true; }
    get empty(): boolean { return isEmpty(this.value); }

    focus(): void {
        this._mfc.focusElement();
    }

    writeValue(value: TRecord[] | null): void {
        this._csTree._setDataSource(value);
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}