import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ScrollingModule, ViewportRuler } from '@angular/cdk/scrolling';
import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
    OnDestroy, ViewEncapsulation, forwardRef, inject
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatList, MatListModule } from '@angular/material/list';
import { CSNamedTemplate } from '@ngx-codinus/core/outlet';
import { CODINUS_CONTEXT_MENU_PARENT } from '@ngx-codinus/material/context-menu';
import { CSMatFormFieldControl, IMatFormFieldSupport } from '@ngx-codinus/material/inputs';
import { CSListOption } from '../option/list-option';
import { CSSelectionListPanel } from './selection-list-panel';
import { CODINUS_SELECTION_LIST } from './types';

@Component({
    selector: 'cs-selection-list',
    exportAs: 'csSelectionList',
    templateUrl: './selection-list.html',
    styleUrls: ['./selection-list.scss'],
    host: {
        '[id]': 'id',
    },
    encapsulation: ViewEncapsulation.None,
    imports: [MatInputModule, MatDividerModule, CSListOption, CSNamedTemplate,
        MatIconModule, MatListModule, ScrollingModule, CdkDropList, CdkDrag,],

    providers: [
        {
            provide: ViewportRuler,
            useFactory: (list: CSSelectionList<unknown, unknown>) => list._htmlElementRuler,
            deps: [forwardRef(() => CSSelectionList)],
        },
        { provide: MatList, useExisting: CSSelectionList },
        { provide: CODINUS_SELECTION_LIST, useExisting: CSSelectionList },
        { provide: CODINUS_CONTEXT_MENU_PARENT, useExisting: CSSelectionList },
    ],
    hostDirectives: [CSMatFormFieldControl],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CSSelectionList<TRow = unknown, TValue = unknown> extends CSSelectionListPanel<TRow, TValue>
    implements IMatFormFieldSupport<TValue | TValue[] | null>, AfterViewInit, OnDestroy {

    private readonly _changeDetectorRef = inject(ChangeDetectorRef);
    private readonly _mfc = inject(CSMatFormFieldControl, { self: true }).setComponent(this);

    get shouldLabelFloat(): boolean { return true; }
    get empty(): boolean { return !this.value || (Array.isArray(this.value) && !this.value.length); }

    protected override notifyFocused(focused: boolean) {
        this._mfc.setFocused(focused);
    }

    //#region ControlValueAccessor

    protected override _notifyValueChange() {
        this._mfc.notifyChange(this.value);
    }

    override _notifyTouched() {
        this._mfc.notifyTouched();
    }

    writeValue(value: TValue[] | TValue | null): void {
        this._setValue(value, 'accessor');
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this._changeDetectorRef.markForCheck();
        this._mfc.changeState();
    }

    //#endregion
}