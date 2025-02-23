import { ValueGetter, Nullable } from "@codinus/types";
import { ICSTableApiSelectModel, KeyboardNavigationType, SelectionType, SelectPredicate } from "../api";
import { CSInteractiveTableDirective } from "./table-interactive.directive";
import { forceInputSet } from "@ngx-codinus/core/shared";

export class CSTableApiSelectModel<TRecord, TSelectValue> implements ICSTableApiSelectModel<TRecord, TSelectValue> {
    /**
     *
     */
    constructor(private directive: CSInteractiveTableDirective<TRecord, TSelectValue>) {
    }
    get selectable() { return this.directive.selectable(); }
    set selectable(value: SelectionType) { forceInputSet(this.directive.selectable, value); }

    get selectableKey() { return this.directive.selectableKey(); }
    set selectableKey(value: ValueGetter<TRecord, TSelectValue>) {
        forceInputSet(this.directive.selectableKey, value);
    }
                        
    get selectionPredicate() { return this.directive.selectionPredicate(); }
    set selectionPredicate(value: Nullable<SelectPredicate<TRecord, TSelectValue>>) {
        forceInputSet(this.directive.selectionPredicate, value);
    }

    get navigationMode() { return this.directive.navigationMode(); }
    set navigationMode(value: KeyboardNavigationType) {
        forceInputSet(this.directive.navigationMode, value);
    }

    get stickyTopHeight() { return this.directive.stickyTopHeight(); }
    get stickyBottomHeight() { return this.directive.stickyBottomHeight(); }

    get hasSelection() { return this.directive.hasSelection() };

    select(row: TRecord, setFocus: boolean): boolean { return this.directive.select(row, undefined, setFocus); }

    selectByValue(value: TSelectValue, raiseEvent?: boolean, setFocus?: boolean): boolean {
        return this.directive.selectByValue(value, raiseEvent, setFocus);
    }

    deselect(row: TRecord): boolean { return this.directive.deselect(row); }

    deselectByValue(value: TSelectValue, raiseEvent?: boolean): boolean {
        return this.directive.deselectByValue(value, raiseEvent);
    }

    setSelection(keys: TSelectValue[] | null): boolean { return this.directive.setSelection(keys); }

    getSelection(): TSelectValue[] { return this.directive.getSelection(); }

    getSelectedRows(): TRecord[] | null { return this.directive.getSelectedRows(); }

    toggle(row: TRecord): boolean { return this.directive.toggle(row); }

    toggleByValue(value: TSelectValue, raiseEvent?: boolean): boolean {
        return this.directive.toggleByValue(value, raiseEvent);
    }

    isAllSelected(): boolean {
        return this.directive.isAllSelected();
    }

    isSelected(row?: TRecord | undefined): boolean {
        return this.directive.isSelected(row);
    }

    isSelectedByValue(value: TSelectValue): boolean {
        return this.directive.isSelectedByValue(value);
    }

    toggleAll(): void {
        return this.directive.toggleAll();
    }

    isSelectableAllowed(rowData: TRecord | null, keyValue: TSelectValue, type: "select" | "deselect"): boolean {
        return this.directive.isSelectableAllowed(rowData, keyValue, type);
    }
}