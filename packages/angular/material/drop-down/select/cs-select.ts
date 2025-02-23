import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { ValueGetter } from '@codinus/types';
import { CSStringFilterPredicate, ValueChangeReason } from '@ngx-codinus/core/data';
import { booleanTrueAttribute } from '@ngx-codinus/core/shared';
import { CSMatFormFieldControl } from '@ngx-codinus/material/inputs';
import { CSSelectionListPanel, ListIconType } from '@ngx-codinus/material/selection-list';
import { CsDropDownHost } from '../host/drop-down-host';
import { CSOverlayHost } from '../host/overlay-host';
import { IDropDownElement, ListType } from '../types';

@Component({
    selector: 'cs-select',
    templateUrl: './cs-select.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [CSMatFormFieldControl],
    imports: [CSSelectionListPanel, CSOverlayHost],
})

export class CSSelect<TRow, TValue> extends CsDropDownHost<TRow, TValue> {

    private _listPanel = viewChild(CSSelectionListPanel<TRow, TValue>);
    private _searchHeight = signal(0);
    protected override dropDownElementLoaded = computed(() => !!this._listPanel());

    iconMember = input<ValueGetter<TRow>>();
    filterPredicate = input<CSStringFilterPredicate<TRow>>();
    selectOnlyByCheckBox = input(false, { transform: booleanAttribute });
    stickySelected = input(false, { transform: booleanAttribute });
    //TODO: think about select the first item
    activateFirstItem = input(false, { transform: booleanAttribute });
    showTitle = input(true, { transform: booleanTrueAttribute });
    showSearch = input(true, { transform: booleanTrueAttribute });
    iconType = input<ListIconType>('none');

    //protected listTogglePosition = computed(() => this.multiple() ? this.togglePosition() || 'before' : 'none');

    protected override getInnerValue() { return this._listPanel()?.value; }
    protected override listHeight = computed(() => (this._listPanel()?.listDataHeight() ?? 0) + this._searchHeight());
    protected override selectedTitles = computed(() => this._listPanel()?.selectedTitles());
    protected override setInnerValue(value: ListType<TValue>, reason: ValueChangeReason): void {
        (this._listPanel() as unknown as IDropDownElement<TValue>)?._setValue(value, reason);
    }

    protected override positioningSettled(): void {
        const panel = this._listPanel();
        if (!panel)
            return;
        this._searchHeight.set(panel.searchHeight ?? 0);
        this._listPanel()?.scrollToStart();
    }

    getDisplayText(values: TValue[]) {
        return this.getDisplayTextCore(this._listPanel()?.getSelectedTitles(values));
    }
}
