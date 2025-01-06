import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConextMenuOpenArgs, IContextMenuClickArgs, IContextMenuItem, CSContextMenuDirective } from '@ngx-codinus/material/context-menu';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { CSMatButtonStyle } from '@ngx-codinus/material/buttons';

import { ListIconType, ListTogglePosition, CSSelectionList } from '@ngx-codinus/material/selection-list';
interface KeyValue {
    name: string;
    value: number;
    icon: string,
    avatar: string,
}

@Component({
    selector: 'mat-list-seelction-virtual',
    templateUrl: 'mat-list-seelction-virtual.html',
    styleUrl: 'mat-list-seelction-virtual.css',
    imports: [ReactiveFormsModule, CSSelectionList, MatFormFieldModule, CSTranslatePipe,
        JsonPipe, MatButtonModule, CSMatButtonStyle, CSContextMenuDirective]
})

export class CSSelectionListVirtualComponent {
    onContextMenuClick(event: IContextMenuClickArgs) {
        console.log('click', event);
    }
    onContextMenuOpen(args: ConextMenuOpenArgs) {
        // if ((args.data as KeyValue).value === 3)
        args.menuItems[1].disabled = (args.data as KeyValue).value === 3;
        args.menuItems[0].hidden = (args.data as KeyValue).value === 5;
    }
    togglePosition: ListTogglePosition = 'after';
    iconType: ListIconType = 'icon';
    iconMember = 'icon';
    _positions: ListTogglePosition[] = ['after', 'before', 'none'];
    _iconTypes: ListIconType[] = ['none', 'icon', 'avatar'];

    typesOfShoes: KeyValue[] = Array(400).fill(0).map((v, i) => (
        {
            name: 'item' + i, value: i + 1,
            icon: 'home',
            avatar: (i + 1) % 5
                ? 'https://angular.io/generated/images/bios/devversion.jpg'
                : 'https://angular.io/generated/images/bios/jelbourn.jpg',
            disable: (i + 1) % 15 == 0
        }));
    optionHeight = 48;
    stickySelected = false;
    multiple = true;
    showTitle = true;
    showIndex = true;
    listLable = { 'en': 'Virtual Selection List', ar: 'تجربة الليست' };
    frmControl = new FormControl([1, 2, 3]);
    contextMenuEnabled = true;
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

    changeDataSource() {
        this.typesOfShoes = Array(20).fill(0).map((v, i) => ({
            name: 'item' + i, value: i + 1, disable: (i + 1) % 15 == 0,
            icon: (i + 1) % 5 ? 'home' : 'currency_exchange',
            avatar: (i + 1) % 3
                ? 'https://angular.io/generated/images/bios/devversion.jpg'
                : 'https://angular.io/generated/images/bios/jelbourn.jpg',
        }));
    }
    toggleDisable() {
        const currentstate = this.frmControl.disabled;
        if (currentstate)
            this.frmControl.enable();
        else
            this.frmControl.disable();
    }

    changeControlValue() {
        this.frmControl.setValue([12, 11, 10]);
    }

    togglePositionValue() {
        let reqtIndex = this._positions.indexOf(this.togglePosition) + 1;
        if (reqtIndex >= this._positions.length)
            reqtIndex = 0;
        this.togglePosition = this._positions[reqtIndex];
    }

    toggleIconType() {
        let reqtIndex = this._iconTypes.indexOf(this.iconType) + 1;
        if (reqtIndex >= this._iconTypes.length)
            reqtIndex = 0;
        this.iconType = this._iconTypes[reqtIndex];
        this.iconMember = this.iconType === 'avatar' ? 'avatar' : 'icon';
    }
}