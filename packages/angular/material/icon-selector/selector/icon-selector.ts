import { NumberInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import { booleanAttribute, Component, inject, Input, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { toNumber } from '@codinus/js-extensions';
import { Nullable } from '@codinus/types';
import { CODINUS_DIALOG_SERVICE } from '@ngx-codinus/cdk/overlays';
import { forceInputSet } from '@ngx-codinus/core/shared';
import { CSMatFormFieldControl } from '@ngx-codinus/material/inputs';
import { CSIconBrowserDialog } from '../browser/icon-browser-dialog';

@Component({
    selector: 'cs-icon-selector',
    templateUrl: './icon-selector.html',
    styleUrl: './icon-selector.scss',
    hostDirectives: [CSMatFormFieldControl],
    imports: [MatIconModule, MatButtonModule],
    host: {
        '[attr.tabindex]': '-1',
        'ngSkipHydration': '',
        '(focusin)': '_onFocusIn($event)',
        '(focusout)': '_onFocusOut()',
    },
})

export class CSIconSelector {
    private _document = inject(DOCUMENT);
    protected dialogService = inject(CODINUS_DIALOG_SERVICE);
    protected readonly _mfc = inject(CSMatFormFieldControl, { self: true }).setComponent(this);

    private _value: Nullable<string> = null;

    dialogLabel = input<string>();
    _disabled = input(false, { alias: 'disabled', transform: booleanAttribute });

    iconList = input<string[]>(); // Icons to display
    iconCssClass = input<string>(); // CSS class to apply to the icon;
    itemSize = input(100, { transform: (v: NumberInput) => toNumber(v, 100) }); // Size of each icon
    showButton = input(false, { transform: booleanAttribute });
    buttonIcon = input('more_horiz', { transform: (v: Nullable<string>) => v ?? 'more_horiz' });
    acceptText = input('Accept');
    closeText = input('Close');
    clearText = input('Clear Icon');

    @Input()
    get value(): Nullable<string> { return this._value; }
    set value(value: Nullable<string>) {
        this._value = value;
        this._mfc.notifyChange(this._value);
    }

    protected openDialog(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        const width = this._document.body.clientWidth;
        const remaning = (width * .8) % (this.itemSize() + 4);
        const minWidth = `${(((width * 0.8) + remaning) / width) * 100}vw`;
        this.dialogService.open({
            component: CSIconBrowserDialog,
            data: {
                iconList: this.iconList(),
                iconCssClass: this.iconCssClass(),
                itemSize: this.itemSize(),
                value: this.value,
            },
            options: {
                caption: this.dialogLabel(),
                minHeight: '80vh',
                minWidth,
                cssClass: 'cs-icon-selector-dialog',
                noPadding: true,
                actionBar: {
                    buttons: {
                        'accept': { icon: 'check', text: this.acceptText() },
                        'close': { icon: 'clear', text: this.closeText() },
                        'removeIcon': { icon: 'delete', text: this.clearText() },
                    }
                }
            },
        }).subscribe(result => {
            if (result !== undefined)
                this.value = result;
        });
    }

    //#region valueAccessor


    writeValue(obj: unknown): void {
        this.value = obj as Nullable<string>;
    }

    setDisabledState(isDisabled: boolean): void {
        forceInputSet(this._disabled, isDisabled);
    }

    //#endregion

    //#region MatFormFieldControl

    get disabled() { return this._disabled(); }
    get shouldLabelFloat(): boolean { return true; }
    get empty(): boolean { return !this._value; }

    focus() {
        this._mfc.focusElement();
    }

    protected _onFocusIn() {
        this._mfc.setFocused(true);
    }

    protected _onFocusOut() {
        if (!this.disabled)
            this._mfc.notifyTouched();
        this._mfc.setFocused(false);
    }

    //#endregion
}