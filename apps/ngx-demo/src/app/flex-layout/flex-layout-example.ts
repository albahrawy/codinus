import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { enumerableRange } from '@codinus/js-extensions';
import { CODINUS_CDK_FLEX_DIRECTIVES } from '@ngx-codinus/core/layout';
import { CSMatButtonStyle } from '@ngx-codinus/material/buttons';
import { CSContextMenuDirective, IContextMenuItem } from '@ngx-codinus/material/context-menu';

type FlexExampleItem = {
    mdBase: number | string,
    base: string,
    order: number
    index: number
}


@Component({
    selector: 'flex-layout-example',
    templateUrl: 'flex-layout-example.html',
    styleUrl: './flex-layout-example.scss',
    imports: [CODINUS_CDK_FLEX_DIRECTIVES, CommonModule, CSMatButtonStyle, MatButtonModule, CSContextMenuDirective]
})
export class FlexLayoutExampleComponent {

    _contextMenuItems: IContextMenuItem[] = [
        {
            key: 'a',
            caption: 'Menu-1',
            icon: 'home',
        },
        {
            key: 'b',
            caption: 'Menu-2',
            icon: 'home',
        }
    ];

    _contextMenuItems2: IContextMenuItem[] = [
        {
            key: 'a',
            caption: '22Menu-1',
            icon: 'home',
        },
        {
            key: 'b',
            caption: '22Menu-2',
            icon: 'home',
        }
    ];

    shufflePlace(item: FlexExampleItem) {
        item.order = Math.floor(Math.random() * (10 - 0) + 0);
    }
    flexGap: string | null = '5px,1px,1px,2px';
    config: FlexExampleItem[] = enumerableRange(0, 10).map(v => {
        return {
            mdBase: 50,
            base: `33.33,100,33.33,33.33`,
            order: v,
            index: v + 1
        }
    });

    removeGaps() {
        this.flexGap = null;
    }

    addGaps() {
        this.flexGap = '5px,1px,1px,2px';
    }
}