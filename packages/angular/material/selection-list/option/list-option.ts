/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation,
    computed, effect, inject, input, signal
} from '@angular/core';
import { MatListItem } from '@angular/material/list';
import { CODINUS_SELECTION_LIST, ICSSelectionList } from '../list/types';

@Component({
    selector: 'cs-list-option',
    exportAs: 'csListOption',
    styleUrls: ['./list-option.scss'],
    templateUrl: './list-option.html',
    host: {
        'class': 'mat-mdc-list-item mat-mdc-list-option mdc-list-item mat-mdc-list-item-single-line mdc-list-item--with-one-line',
        'role': 'option',
        // As per MDC, only list items without checkbox or radio indicator should receive the
        // `--selected` class.
        '[class.mdc-list-item--selected]': 'selected()',
        '[class.mdc-list-item--current]': 'isCurrent',
        '[class.mdc-list-item--with-leading-avatar]': 'isLeadingAvatar()',
        '[class.mdc-list-item--with-leading-icon]': 'isLeadingIcon()',
        '[class.mdc-list-item--with-leading-checkbox]': 'isLeadingCheckbox()',
        '[class.mdc-list-item--with-leading-radio]': 'isLeadingRadio()',

        '[class.mat-mdc-list-option-with-trailing-avatar]': 'isTrailingAvatar()',
        '[class.mdc-list-item--with-trailing-icon]': 'isTrailingIcon()',
        '[class.mdc-list-item--with-trailing-checkbox]': 'isTrailingCheckbox()',
        '[class.mdc-list-item--with-trailing-radio]': 'isTrailingRadio()',
        '[class._mat-animation-noopable]': '_noopAnimations',
        '[attr.aria-selected]': 'selected()',
        '[attr.aria-disabled]': '_isDisabled()',
        '[attr.tabindex]': '_isDisabled()? -1: 0',
        '(blur)': '_handleBlur()',
        '(click)': '_onClick()',
        '(contextmenu)': '_onContextMenu($event)',
    },
    encapsulation: ViewEncapsulation.None,
    imports: [NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MatListItem, useExisting: CSListOption },
    ],
})
//@ts-expect-error override private property
export class CSListOption<TData = unknown, TValue = unknown> extends MatListItem implements OnDestroy {

    protected _dataVersion = signal(0);
    protected override _listBase = inject(CODINUS_SELECTION_LIST) as ICSSelectionList<TData, TValue>;
    data = input.required<TData>();
    index = input<number>();

    value = computed(() => {
        this._dataVersion();
        return this._listBase._binder.valueMember()(this.data());
    });

    protected _isDisabled = computed(() => {
        this._dataVersion();
        return !this._listBase.enabled() || (this._listBase._binder.disableMember?.()?.(this.data()) ?? false);
    });

    protected _icon = computed(() => {
        this._dataVersion();
        return this._listBase._binder.iconMember?.()?.(this.data());
    });
    protected _title = computed(() => {
        this._dataVersion();
        return this._listBase._binder.displayMember()(this.data());
    });
    /**
     *
     */
    constructor() {
        super();
        effect(() => {
            this.disabled = this._isDisabled();
        });
    }

    selected = computed(() => {
        return this._listBase.isSelected(this.value());
    });

    get isCurrent(): boolean {
        return this._listBase._isOptionCurrent(this);
    }

    protected isLeadingAvatar = computed(() =>
        this._listBase._optionIconType() === "avatar" && this._listBase._optionIconPosition() === "before")
    protected isLeadingIcon = computed(() =>
        this._listBase._optionIconType() === "icon" && this._listBase._optionIconPosition() === "before")
    protected isLeadingCheckbox = computed(() =>
        this._listBase._optionToggleType() === "check" && this._listBase._optionTogglePosition() === "before")
    protected isLeadingRadio = computed(() =>
        this._listBase._optionToggleType() === "radio" && this._listBase._optionTogglePosition() === "before")

    protected isTrailingAvatar = computed(() =>
        this._listBase._optionIconType() === "avatar" && this._listBase._optionIconPosition() === "after")
    protected isTrailingIcon = computed(() =>
        this._listBase._optionIconType() === "icon" && this._listBase._optionIconPosition() === "after")
    protected isTrailingCheckbox = computed(() =>
        this._listBase._optionToggleType() === "check" && this._listBase._optionTogglePosition() === "after")
    protected isTrailingRadio = computed(() =>
        this._listBase._optionToggleType() === "radio" && this._listBase._optionTogglePosition() === "after")


    focus(): void {
        this._hostElement.focus();
    }

    _handleBlur() {
        setTimeout(() => this._listBase._notifyTouched());
    }

    update() {
        this._dataVersion.update(v => {
            v++;
            if (v >= Number.MAX_VALUE)
                v = 0;
            return v;
        });
    }

    /**
     * Sets the selected state of the option.
     * @returns Whether the value has changed.
     */
    _setSelected(selected: boolean): boolean {
        if (selected === this.selected())
            return false;
        this._listBase._optionSelectChange(this, selected);
        return true;
    }

    /**
     * Notifies Angular that the option needs to be checked in the next change detection run.
     * Mainly used to trigger an update of the list option if the disabled state of the selection
     * list changed.
     */
    
    protected _onCheckBoxClick(event: Event) {
        event.stopImmediatePropagation();
        if (!this.disabled && this._listBase.enabled()) {
            this._toggleOnInteraction();
        }
    }

    protected _onClick() {
        if (!this.disabled && this._listBase.enabled()) {
            if (!this._listBase.multiple() || !this._listBase.selectOnlyByCheckBox())
                this._toggleOnInteraction();
            this._listBase._optionClicked(this);
        }
    }

    /** Toggles the option's value based on a user interaction. */
    protected _toggleOnInteraction() {
        if (this.disabled || !this._listBase.enabled())
            return;

        if (this._listBase.multiple())
            this._setSelected(!this.selected());
        else if (!this.selected())
            this._setSelected(true);
    }

    protected _onContextMenu(event: Event) {
        this._listBase.conextMenuOpening.emit({ event, data: this.data });
    }
}