import { Component, } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { CodinusTableModule, ICSDataModifedArgs } from '@ngx-codinus/material/table';
import { PeriodicElement, TableConfig } from '../codinus-table/codinus-table';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { createSampleData } from '../../helper/data-provider';
import { CSFormFieldToolBar } from '@ngx-codinus/material/buttons';
import { JsonPipe } from '@angular/common';

@Component({
    selector: 'table-form-control',
    templateUrl: './table-form-control.html',
    imports: [MatFormFieldModule, CodinusTableModule, MatTableModule, ReactiveFormsModule, CSFormFieldToolBar, JsonPipe]
})

export class TableFormExampleComponent {

    onEdited($event: ICSDataModifedArgs<PeriodicElement>) {
        console.log('Edited');
    }

    protected formControl = new FormControl(createSampleData(5));

    constructor() {
        this.formControl.valueChanges.subscribe(e => console.log(e));
    }

    onGridCreated($event: Event) {
        //    throw new Error('Method not implemented.');
    }
    config: TableConfig<PeriodicElement> = {
        editable: true,
        commitOnDestroy: true,
        editWithF2: true,
        editWithEnter: true,
        rowHeight: 30,
        attachFilter: true,
        reorderColumns: true,
        sortable: true,
        showHeader: true,
        showFilter: true,
        showFooter: true,
        stickyHeader: true,
        stickyFilter: true,
        stickyFooter: true,
        // noDataText: 'There is no Data',
        // responsive: { enabled: true, md: 2, sm: 1, xs: 1 },
        selectable: 'single',
        selectColumn: 'before',
        // iconMember: 'icon',
        columns: [
            {
                name: 'position', footerAggregation: 'sum', label: 'No.',
                resizable: true, reordable: true, sortable: true, filter: { type: 'number' }, editor: { type: 'number' }
            },
            {
                name: 'date', cellFormatter: 'dd/MM/yyyy', footerDefaultValue: 'Footer', label: 'Date',
                resizable: true, reordable: false, sortable: true,
                filter: { type: 'date', operations: ['equals', 'greaterThan'], options: { dateFormat: 'dd-MM-yyyy' } },
                editor: { type: 'date', options: { dateFormat: 'dd-MM-yyyy' } }
            },
            {
                name: 'weight', footerAggregation: 'avg', label: 'Weight', dataKey: "nested.weightx", cellFormatter: "#,###.##",
                footerFormatter: "Avg. {#,###.00}", resizable: true, reordable: true, sortable: true,
                filter: { type: 'number', options: { decimalDigits: 3, mode: 'decimal' } },
                editor: { type: 'number', options: { allowArrowKeys: true, mode: 'decimal' } }
            },
        ]
    }

}