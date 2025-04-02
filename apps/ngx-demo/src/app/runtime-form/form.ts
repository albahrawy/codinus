import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';



import { BehaviorSubject, Observable, of } from 'rxjs';

import { IGenericRecord } from '@codinus/types';
import { ConextMenuOpenArgs, IContextMenuClickArgs, IContextMenuItem } from '@ngx-codinus/material/context-menu';
import {
    CSRuntimeForm, ICSRuntimeFormButtonBase, ICSRuntimeFormElementAnyField,
    ICSRuntimeFormEvents, ICSRunTimeFormFieldArea, ICSRuntimeFormHandler, ICSRuntimeFormValueChangeArg
} from '@ngx-codinus/material/forms';
import { createPanel } from './form-helper';


const BaseData = {
    name_en: ['Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon'],
    name_ar: ['هيدروجين', 'هيليوم', 'ليثيوم', 'بريليوم', 'بورون', 'كربون', 'نيتروجين', 'أكسجين', 'فلورين', 'نيون'],
    weight: 1.001,
    valueB: 1,
    symbol: ['H', 'H', 'L', 'B', 'B', 'C', 'N', 'O', 'F', 'N']
}

@Component({
    selector: 'cs-runtime-form-example',
    templateUrl: './form.example.html',
    styles: [
        `
        :host{
            overflow: auto;
            display:flex;
            flex-direction: column;
            flex: 1 1 auto;
        }
        `
    ],
    imports: [CSRuntimeForm, JsonPipe]
})

export class CSRuntimeFromExampleComponent {
    // config: INovaRuntimeFormAreaPanel = this.createPanel('root', p => {
    //     const newPanel: INovaRunTimeFormFieldArea =
    //     {
    //         panels: [this.createPanel('nested_panel2'), this.createPanel('nested_panel2')],
    //         name: 'subPanel',
    //         flex: '100,100,100',
    //         type: 'area',
    //         displayType: 'tab'

    //     };
    //     (p.children?.at(3) as INovaRuntimeFormFieldSection)?.children?.push(newPanel)
    // });
    prefix = 'nested_panel1'
    config: ICSRunTimeFormFieldArea = {
        panels: [createPanel('nested_panel1')],
        displayType: 'tab',
        name: 'main-area',
        type: 'area'
    }

    events = new MyEvents();

    onClick() {
        // const c = this._form.getElementByDataKey('nested_panel1_db_section_4');
        // console.log(c);

        const smallData = Array(3).fill(0).map((v, i) => ({
            name: 'item' + i+5, value: i + 1, disable: (i + 1) % 15 == 0,
            icon: (i + 1) % 5 ? 'home' : 'tel',
            avatar: (i + 1) % 3
                ? 'https://angular.io/generated/images/bios/devversion.jpg'
                : 'https://angular.io/generated/images/bios/jelbourn.jpg',
        }));
        this.events.signalDataSource.next(smallData);
    }
}

class MyEvents implements ICSRuntimeFormEvents {
    private _formHandler!: ICSRuntimeFormHandler;
    valueChange(arg: ICSRuntimeFormValueChangeArg): void {
        // console.log(arg);
    }

    formInitialized(formHandler: ICSRuntimeFormHandler): void {
        this._formHandler = formHandler;
        console.log('initialize From', formHandler);
    }

    TextComponent_Validators(control: AbstractControl): ValidationErrors | null {
        if (control.value.length === 4)
            return { misMatch: true };
        return null;
    }
    signalDataSource = new BehaviorSubject<unknown[]>([]);
    nested_panel1_SelectComponent_DataSource() {
        const smallData = Array(3).fill(0).map((v, i) => ({
            name: 'item' + i, value: i + 1, disable: (i + 1) % 15 == 0,
            icon: (i + 1) % 5 ? 'home' : 'tel',
            avatar: (i + 1) % 3
                ? 'https://angular.io/generated/images/bios/devversion.jpg'
                : 'https://angular.io/generated/images/bios/jelbourn.jpg',
        }));
        this.signalDataSource.next(smallData);
        return this.signalDataSource;
    }

    nested_panel1_SelectGridComponent_DataSource() {
        console.log(this);
        const data = Array.from(Array(30 + 1 - 1), (_, index) => {
            const position = index + 1;
            const newIndex = index % 10;
            return {
                name_en: BaseData.name_en[newIndex], name_ar: BaseData.name_ar[newIndex],
                position, symbol: BaseData.symbol[newIndex], weight: BaseData.weight * position,
                nested: { weightx: BaseData.weight * position + 6, symbolx: BaseData.symbol[newIndex] },
                date: new Date(2023, index, newIndex),
                valueB: index,
                icon: 'home',
                avatar: (index + 1) % 5
                    ? 'https://angular.io/generated/images/bios/devversion.jpg'
                    : 'https://angular.io/generated/images/bios/jelbourn.jpg',
            };
        });
        return data;
    }

    TextComponent_AsyncValidators(control: AbstractControl): Observable<ValidationErrors | null> {
        if (control.value.length === 6)
            return of({ misMatch: true });
        return of(null);
    }

    nested_panel1_TextComponent1_DateDefaultValue() {
        console.log('xxx');
        return [new Date(2020, 1, 2), null];
    }

    nested_panel1_TextComponent1_DateFilter(d: Date | null): boolean {
        const day = (d || new Date()).getDay();
        // Prevent Saturday and Sunday from being selected.
        return day !== 0 && day !== 5;
    };

    nested_panel1_TextComponent1_CellClass(cellDate: Date, view: 'month' | 'year' | 'multi-year') {
        // Only highligh dates inside the month view.
        if (view === 'month') {
            const date = cellDate.getDate();

            // Highlight the 1st and 20th day of each month.
            return date === 1 || date === 20 ? 'example-custom-date-class' : '';
        }

        return '';
    };

    TextComponent_LeftHint(control: AbstractControl) {
        return control.value.length;
    }

    nested_panel1_TextComponent_Invisible(formValue: IGenericRecord) {

        return formValue?.['nested_panel1_db_3'] == 3;
    }
    nested_panel2_Hidden(formValue: IGenericRecord) {
        return formValue?.['nested_panel1_db_3'] == 4;
    }
    nested_panel2_Invisible(formValue: IGenericRecord) {
        return formValue?.['nested_panel1_db_3'] == 2;
    }

    elementButtonClick(button: ICSRuntimeFormButtonBase, config: ICSRuntimeFormElementAnyField): void {
        if (config.name === 'nested_panel2_TextComponent') {
            const element = this._formHandler.getElementByName('nested_panel1.nested_panel1_TextComponent');
            if (element)
                element.invisible = !element.invisible;
        }
    }

    nested_panel1_ArrayComponent_ContextMenuOpen(arg: ConextMenuOpenArgs) {
        //  console.log(arg);
    }

    nested_panel1_ArrayComponent_ContextMenuClick(arg: IContextMenuClickArgs) {
        console.log(arg);
    }

    test_nested_panel1_ArrayComponent_ContextMenuItems(): IContextMenuItem[] {
        return [
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
    }
}