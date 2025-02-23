import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { copyObject } from '@codinus/js-extensions';
import {
    CodinusTableModule,
    CSTableApiIRegistrar,
    CSTableDataSource,
    CSTableDirective,
    ICSTableApi,
    ICSTableColumn, SelectionType
} from '@ngx-codinus/material/table';
import { TableButtonsComponent } from '../table-buttons/table-buttons';
export interface PeriodicElement {
    name_en: string;
    name_ar: string;
    position: number;
    weight: number;
    symbol: string;
    nested: { weightx: number, symbolx: string },
    icon: string;
    avatar: string;
}
const BaseData = {
    name_en: ['Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon'],
    name_ar: ['هيدروجين', 'هيليوم', 'ليثيوم', 'بريليوم', 'بورون', 'كربون', 'نيتروجين', 'أكسجين', 'فلورين', 'نيون'],
    weight: 1.001,
    symbol: ['H', 'H', 'L', 'B', 'B', 'C', 'N', 'O', 'F', 'N']
}
type ToggleProp = 'showHeader' | 'showFooter' | 'showFilter' | 'reorderColumns' | 'sortable' | 'editable' | 'responsive';

export interface TableConfigBase<T = unknown> {
    rowHeight?: number;
    attachFilter?: boolean;
    reorderColumns?: boolean;
    sortable?: boolean;
    showHeader?: boolean;
    showFilter?: boolean;
    showFooter?: boolean;
    stickyHeader?: boolean;
    stickyFilter?: boolean;
    stickyFooter?: boolean;
    // noDataText?: string | IStringDictionary;
    // responsive?: ITableRsponsiveInfo
    // dataSource?: NovaDataSource<T>;
    // keyboardNavigation?: KeyboardNavigationType;
    selectColumn?: 'before' | 'after' | 'none';
    iconColumn?: 'before' | 'after' | 'none';
    iconType?: 'icon' | 'avatar';
    showIndex?: boolean;
    selectable?: SelectionType;
    disabled?: boolean;
    columns: ICSTableColumn<T>[];
}

export interface EditableTableConfig<T = unknown> extends TableConfigBase<T> {
    editWithF2?: boolean;
    editWithEnter?: boolean;
    editable?: boolean;
    commitOnDestroy?: boolean;
}

export type TableConfig<T = unknown> = EditableTableConfig<T>
// {
// selectionPredicate?: (args: ISelectionChangingArgs<T>) => boolean;
// iconMember?: ItemGetterType<T>;
// }

@Component({
    selector: 'cs-table-example',
    templateUrl: './codinus-table.html',
    styleUrl: './codinus-table.scss',
    imports: [CommonModule, MatTableModule, TableButtonsComponent,
        CodinusTableModule,
        MatSortModule,
        CSTableDirective,
        //FilterTextCustom, 
        CSTableApiIRegistrar]
})
export class CdoinusTableExampleComponent {

    protected _tableApi?: ICSTableApi<PeriodicElement>;
    dataSource = new CSTableDataSource(this.createData(100));
    disabled = false;
    symbolColumn: ICSTableColumn<PeriodicElement> = {
        name: 'symbol', headerText: 'Symbol',
        resizable: true, reordable: true, sortable: true, filter: { type: 'string' }, editor: { type: 'string' }
    };
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
        selectColumn: 'none',
        iconColumn: 'none',
        // iconMember: 'icon',
        columns: [
            {
                name: 'position', footerAggregation: 'sum', headerText: 'No.',
                resizable: true, reordable: true, sortable: true, filter: { type: 'number' }, editor: { type: 'number' }
            },
            {
                name: 'date', cellFormatter: 'dd/MM/yyyy', footerDefaultValue: 'Footer', headerText: 'Date',
                resizable: true, reordable: false, sortable: true,
                filter: { type: 'date', operations: ['equals', 'greaterThan'], options: { dateFormat: 'dd-MM-yyyy' } },
                editor: { type: 'date' }
            },
            {
                name: 'weight', footerAggregation: 'avg', headerText: 'Weight', dataKey: "nested.weightx", cellFormatter: "#,###.##",
                footerFormatter: "Avg. {#,###.00}", resizable: true, reordable: true, sortable: true,
                filter: { type: 'number', options: { decimalDigits: 3, mode: "decimal" } },
                editor: { type: 'number', options: { allowArrowKeys: true, mode: "decimal" } }
            },
            this.symbolColumn
        ]
    }

    toggleProperties: { key: ToggleProp, text: string }[] = [
        { key: 'showHeader', text: 'Show Header' },
        { key: 'showFooter', text: 'Show Footer' },
        { key: 'showFilter', text: 'Show Filter' },
        { key: 'reorderColumns', text: 'Reorder Columns' },
        { key: 'sortable', text: 'Sortable' },
        { key: 'editable', text: 'Editable' },
        { key: 'responsive', text: 'Responsive' },
    ]


    createData(count: number): PeriodicElement[] {
        const data = Array.from(Array(count + 1 - 1), (_, index) => {
            const position = index + 1;
            const newIndex = index % 10;
            return {
                name_en: BaseData.name_en[newIndex], name_ar: BaseData.name_ar[newIndex],
                position, symbol: BaseData.symbol[newIndex], weight: BaseData.weight * position,
                nested: { weightx: BaseData.weight * position + 6, symbolx: BaseData.symbol[newIndex] },
                date: new Date(2023, index, newIndex),
                icon: 'home',
                avatar: (index + 1) % 5
                    ? 'https://angular.io/generated/images/bios/devversion.jpg'
                    : 'https://angular.io/generated/images/bios/jelbourn.jpg',
            };
        });
        return data;
    }
    changeDataSource() {
        this.dataSource = new CSTableDataSource(this.createData(50_000));
    }
    updateData() {

        const dataArray = this.dataSource.data;
        const record = dataArray ? dataArray[2] : null;
        if (record) {
            record.nested.weightx = 30_00;
            record.name_en = "updated";
            record.name_ar = "تم تحديثه";
            this.dataSource.notifyChanged();
        }
    }

    insertData(empty = true) {
        if (empty) {
            this._tableApi?.addRecord();
            return;
        }
        const dataArray = this.dataSource.data;
        const record = dataArray ? dataArray[2] : null;
        if (record) {
            const newRecord = copyObject(record);
            newRecord.nested.weightx = 30_00;
            newRecord.name_en = "Inserted";
            newRecord.name_ar = "تم إضافته";
            this._tableApi?.addRecords([record]);
        }
    }

    removeRowByIndex() {
        this._tableApi?.removeRecords(3);
    }

    removeRow() {
        const dataArray = this.dataSource.data;
        const record = dataArray ? dataArray[4] : null;
        if (record) {
            this._tableApi?.removeRecords([record]);
        }
    }

    select3rdRow() {
        const dataArray = this.dataSource.data;
        const record = dataArray ? dataArray[2] : null;
        if (record)
            this._tableApi?.selectionModel?.select(record);
    }

    private selectColumnOptions: Array<'before' | 'after' | 'none'> = ['before', 'after', 'none'];
    private selectables: Array<SelectionType> = ['single', 'multiple', 'none'];

    toggleSelectColumn() {
        const _current = this.config.selectColumn ?? 'none';
        let index = this.selectColumnOptions.indexOf(_current);
        index++;
        if (index >= this.selectColumnOptions.length)
            index = 0;
        this.config.selectColumn = this.selectColumnOptions[index];
    }

    toggleIconColumn() {
        const _current = this.config.iconColumn ?? 'none';
        let index = this.selectColumnOptions.indexOf(_current);
        index++;
        if (index >= this.selectColumnOptions.length)
            index = 0;
        this.config.iconColumn = this.selectColumnOptions[index];
    }

    toggleSelectable() {
        const _current = this.config.selectable ?? 'none';
        let index = this.selectables.indexOf(_current);
        index++;
        if (index >= this.selectables.length)
            index = 0;
        this.config.selectable = this.selectables[index];
    }
    toggleIconType() {
        // this.config.iconType = this.config.iconType === 'icon' ? 'avatar' : 'icon';
        // this.config.iconMember = this.config.iconType === 'avatar' ? 'avatar' : 'icon';

    }
    onTableCreated(event: ICSTableApi<PeriodicElement>) {
        this._tableApi = event;
    }

    onEdited(data: unknown) {
        console.log(data);
    }
}