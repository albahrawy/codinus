import { ChangeDetectionStrategy, Component, booleanAttribute, forwardRef, input, viewChild } from "@angular/core";
import { IGenericRecord } from '@codinus/types';
import { CODINUS_FORM_VALIDATOR, CSFormGroupDirective } from "@ngx-codinus/core/forms";
import { CSOutletDirective } from "@ngx-codinus/core/outlet";
import { CODINUS_CONTEXT_MENU_PARENT } from "@ngx-codinus/material/context-menu";
import { CSMatFormFieldControl } from "@ngx-codinus/material/inputs";
import { CSSelectionListPanel, ListIconType } from '@ngx-codinus/material/selection-list';
import { CSplitterModule } from "@ngx-codinus/material/splitter";
import { CSFormSectionArrayBase } from "./cs-form-section-array-base";

@Component({
    selector: 'cs-form-section-array',
    templateUrl: './cs-form-section-array.html',
    styleUrl: './cs-form-section-array.scss',
    exportAs: 'csFormSectionArray',
    host: {
        '[attr.tabindex]': '-1',
        'ngSkipHydration': '',
        '(focusin)': '_onFocusIn($event)',
        '(focusout)': '_onFocusOut($event)',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: CODINUS_FORM_VALIDATOR, useExisting: forwardRef(() => CSFormSectionArray) },
        { provide: CODINUS_CONTEXT_MENU_PARENT, useExisting: CSFormSectionArray },
    ],
    hostDirectives: [CSMatFormFieldControl, CSFormGroupDirective],
    imports: [CSOutletDirective, CSplitterModule, CSSelectionListPanel]
})
export class CSFormSectionArray<TRow extends IGenericRecord = IGenericRecord> extends CSFormSectionArrayBase<TRow> {

    private selectionList = viewChild(CSSelectionListPanel<TRow>);

    showIndex = input(true, { transform: booleanAttribute });
    showTitle = input(true, { transform: v => v == null ? true : booleanAttribute(v) });
    sectionName = input<string>();

    iconType = input<ListIconType>('none');

    getSelected(): TRow[] | null {
        return this.selectionList()?.getSelectedRecords() || null;
    }

    addNew(row?: TRow | TRow[]) {
        this._listStructureChaning = 'adding';
        if (!row)
            row = this._form.getDefaultValue() as TRow;
        this._value = this.selectionList()?.add(row) ?? null;
        this._mfc.notifyChange(this._value);
    }

    remove(row?: TRow | TRow[]) {
        this._listStructureChaning = 'removing';
        this.selectionList()?.remove(row);
        this._mfc.notifyChange(this._value);
    }

    protected override refreshItem(activeItem: TRow): void {
        this.selectionList()?.refreshItem(activeItem);
    }
}