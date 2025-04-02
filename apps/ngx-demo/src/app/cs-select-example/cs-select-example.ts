import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ThemePalette } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CODINUS_CDK_FLEX_DIRECTIVES } from '@ngx-codinus/core/layout';
import { CSMatButtonStyle } from '@ngx-codinus/material/buttons';
import { CSSelect, CSSelectGrid } from '@ngx-codinus/material/drop-down';
import { CSTableDataSource, ICSTableColumn } from '@ngx-codinus/material/table';
import { BehaviorSubject } from 'rxjs';

export interface PeriodicElement {
    name_en: string;
    name_ar: string;
    position: number;
    weight: number;
    symbol: string;
    nested: { weightx: number, symbolx: string },
    icon: string;
    valueB: number;
    avatar: string;
}
const BaseData = {
    name_en: ['Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon'],
    name_ar: ['هيدروجين', 'هيليوم', 'ليثيوم', 'بريليوم', 'بورون', 'كربون', 'نيتروجين', 'أكسجين', 'فلورين', 'نيون'],
    weight: 1.001,
    valueB: 1,
    symbol: ['H', 'H', 'L', 'B', 'B', 'C', 'N', 'O', 'F', 'N']
}

@Component({
    selector: 'cs-select-example',
    templateUrl: './cs-select-example.html',
    styleUrl: './cs-select-example.scss',
    standalone: true,
    imports: [MatFormFieldModule, ReactiveFormsModule, MatButtonModule,
        CODINUS_CDK_FLEX_DIRECTIVES, CSMatButtonStyle, JsonPipe, CSSelect, CSSelectGrid]
})

export class CSSelectExampleComponent {
    disabled = false;
    color: ThemePalette = 'accent';
    allowClear = true;
    showButtons = true;
    showSearch = false;
    readOnly = false;
    stickySelected = false;
    formGroup = new FormGroup({
        number: new FormControl<number>({ value: 180000, disabled: true }),
        selectValue: new FormControl<number | number[]>([1, 4, 5]),
        selectGridValue: new FormControl<number | number[]>([1, 4, 5]),
    });
    typesOfShoes: unknown[] = Array(400).fill(0).map((v, i) => ({
        name: 'item' + i, value: i + 1, icon: 'home', disable: (i + 1) % 15 == 0
    }));
    optionHeight = 30;
    multiple = true;
    isDefaultDataSource = true;
    isDefaultGridDataSource = true;
    gridResponsive = { enabled: true, md: 2, sm: 1, xs: 1 };

    columns: ICSTableColumn<unknown, unknown>[] = [
        {
            name: 'position', footerAggregation: 'sum', label: 'No.', // sticky: 'start',
            resizable: true, readOnly: true, sortable: true, filter: { type: 'number' },
        },
        {
            name: 'date', cellFormatter: 'dd/MM/yyyy', footerDefaultValue: 'Footer', label: 'Date',
            resizable: true, readOnly: false, sortable: true,
            filter: { type: 'date', operations: ['equals', 'greaterThan'], options: { dateFormat: 'dd-MM-yyyy' } },
        },
        {
            name: 'weight', footerAggregation: 'avg', label: 'Weight', dataKey: "nested.weightx", cellFormatter: "#,###.##",
            footerFormatter: "Avg. {#,###.00}", resizable: true, readOnly: true, sortable: true,
            filter: { type: "number", options: { decimalDigits: 3, mode: "decimal" } },
        },
        {
            name: 'symbol', label: 'Symbol',
            resizable: true, readOnly: true, sortable: true, filter: { type: 'string' }
        }
    ];

    toggleReadOnly() {
        this.readOnly = !this.readOnly;
    }

    toggleDisabled() {
        this.disabled = !this.disabled;
        if (this.formGroup.disabled)
            this.formGroup.enable();
        else
            this.formGroup.disable();
    }

    asyncDataSource = new BehaviorSubject(this.typesOfShoes);
    dataSourceGrid = new CSTableDataSource(this.createDataForGrid(100));

    toggleDataSource() {
        if (this.isDefaultDataSource) {
            this.isDefaultDataSource = false;
            const smallData = Array(3).fill(0).map((v, i) => ({
                name: 'item' + i, value: i + 1, disable: (i + 1) % 15 == 0,
                icon: (i + 1) % 5 ? 'home' : 'tel',
                avatar: (i + 1) % 3
                    ? 'https://angular.io/generated/images/bios/devversion.jpg'
                    : 'https://angular.io/generated/images/bios/jelbourn.jpg',
            }));
            this.asyncDataSource.next(smallData);
        } else {
            this.isDefaultDataSource = true;
            this.asyncDataSource.next(this.typesOfShoes);
        }
    }

    toggleGridDataSource() {
        if (this.isDefaultGridDataSource) {
            this.isDefaultGridDataSource = false;
            const smallData = this.createDataForGrid(3);
            this.dataSourceGrid.data = smallData;
        } else {
            this.isDefaultGridDataSource = true;
            this.dataSourceGrid.data = this.createDataForGrid(100);
        }
    }

    createDataForGrid(count: number): PeriodicElement[] {
        const data = Array.from(Array(count + 1 - 1), (_, index) => {
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
}