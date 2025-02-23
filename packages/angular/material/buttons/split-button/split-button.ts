import { Component, computed, contentChildren, input, linkedSignal, output, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { CSMatButtonStyle } from '../button-style.directive';
import { CSButtonStyle, ICSSplitButtonItem, ISplitButtonArgs } from '../types/types';
import { CSSplitButtonItem } from './split-button-item';


@Component({
    selector: 'cs-split-button',
    templateUrl: './split-button.html',
    styleUrl: './split-button.scss',
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'cs-split-button',
    },
    imports: [MatMenuModule, MatIconModule, MatButtonModule, CSTranslatePipe, CSMatButtonStyle]
})

export class CSSplitButton {

    items = input<ICSSplitButtonItem[]>([]);
    buttonStyle = input<CSButtonStyle>(null);
    buttonClick = output<ISplitButtonArgs>();

    protected currentButton = linkedSignal(() => this._renderedItems().at(0));

    protected _onClick() {
        const clickedButton = this.currentButton();
        if (clickedButton) {
            const arg = { clickedButton, getItem: (key: string) => this._renderedItems().find(b => b.key === key) }
            this.buttonClick.emit(arg);
        }
    }

    protected _renderedItems = computed(() => {
        const contentItems = this._contentItems().map(c => c.splitButtonItem());
        return [...contentItems, ...this.items()];
    });

    private _contentItems = contentChildren(CSSplitButtonItem);
}