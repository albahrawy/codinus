import { booleanAttribute, ChangeDetectionStrategy, Component, forwardRef, input, viewChild } from "@angular/core";
import { toNumber } from "@codinus/js-extensions";
import { IFunc, IGenericRecord, Nullable } from '@codinus/types';
import { CODINUS_FORM_VALIDATOR, CSFormGroupDirective } from "@ngx-codinus/core/forms";
import { CSOutletDirective } from "@ngx-codinus/core/outlet";
import { CODINUS_CONTEXT_MENU_PARENT } from "@ngx-codinus/material/context-menu";
import { CSMatFormFieldControl } from "@ngx-codinus/material/inputs";
import { CSplitterModule } from "@ngx-codinus/material/splitter";
import { ChildrenAllowedListFn, CodinusTreeModule, CSTreeFeatures } from "@ngx-codinus/material/tree";
import { CSFormSectionArrayBase } from "./cs-form-section-array-base";

@Component({
    selector: 'cs-form-section-tree',
    templateUrl: './cs-form-section-tree.html',
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
        { provide: CODINUS_FORM_VALIDATOR, useExisting: forwardRef(() => CSFormSectionTree) },
        { provide: CODINUS_CONTEXT_MENU_PARENT, useExisting: CSFormSectionTree },
    ],
    hostDirectives: [CSMatFormFieldControl, CSFormGroupDirective],
    imports: [CSOutletDirective, CSplitterModule, CodinusTreeModule]
})
export class CSFormSectionTree<TRow extends IGenericRecord = IGenericRecord> extends CSFormSectionArrayBase<TRow> {

    private sectionTree = viewChild(CSTreeFeatures<TRow>);

    showIcon = input(false, { transform: booleanAttribute });
    activateFirstItem = input(false, { transform: booleanAttribute });
    childrenAccessor = input.required<IFunc<TRow, TRow[] | null>>();
    isRemoveAllowed = input<IFunc<TRow, boolean>>();
    allowedChildTypes = input<ChildrenAllowedListFn<TRow>>();
    nodeIndent = input(20, { transform: (v: Nullable<string | number>) => v ? toNumber(v) : 20 });

    protected override refreshItem(activeItem: TRow): void {
        this.sectionTree()?.refreshItem(activeItem);
    }

    protected _onNodeRemoved(node: TRow | TRow[]) {
        if (Array.isArray(node)) {
            node.forEach(n => this._validationCache.delete(n));
        } else {
            this._validationCache.delete(node);
        }
    }


    refresh() {
        this.sectionTree()?.refresh();
    }
}