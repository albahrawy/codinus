import { ScrollingModule, ViewportRuler } from '@angular/cdk/scrolling';
import { Component, forwardRef, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Nullable } from '@codinus/types';
import { CSMultiColumnsFixedSizeVirtualScroll } from '@ngx-codinus/cdk/virtual-scroll';
import { CSIconBrowserBase } from './icon-browser.directive';
import { ICSDialogHost } from '@ngx-codinus/cdk/overlays';

@Component({
    selector: 'cs-icon-browser-dialog',
    templateUrl: './icon-browser.html',
    styleUrl: './icon-browser.scss',
    encapsulation: ViewEncapsulation.None,
    providers: [{
        provide: ViewportRuler,
        useFactory: (browser: CSIconBrowserDialog) => browser._htmlElementRuler,
        deps: [forwardRef(() => CSIconBrowserDialog)],
    }],
    imports: [
        ScrollingModule, MatFormFieldModule, MatIconModule, FormsModule, MatInputModule, CSMultiColumnsFixedSizeVirtualScroll
    ]
})

export class CSIconBrowserDialog extends CSIconBrowserBase {

    override iconList = signal<Nullable<string[]>>(null); // Icons to display
    override iconCssClass = signal<Nullable<string>>(null); // CSS class to apply to the icon;
    override itemSize = signal<number>(100); // Size of each icon
    private _dialogHost?: ICSDialogHost<Nullable<string>>;

    protected getResult(): Nullable<string> {
        return this.value;
    }

    protected override _onIconDblClick(icon: string): void {
        super._onIconDblClick(icon);
        this._dialogHost?.accept(this.value);
    }

    protected initiate(data: { iconList: string[], iconCssClass: string, itemSize: number, value: string }, host?: ICSDialogHost<Nullable<string>>): void {
        this.value = data.value;
        this.iconList.set(data.iconList);
        this.iconCssClass.set(data.iconCssClass);
        this.itemSize.set(data.itemSize);
        this._dialogHost = host;
    }

    protected buttonClicked?(id: string): void {
        if (id === 'removeIcon') {
            this.value = null;
            this._dialogHost?.accept(null);
        }
    }

}