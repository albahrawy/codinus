import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ThemePalette } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { removeFromArray } from '@codinus/js-extensions';
import { CSMatButtonStyle } from '@ngx-codinus/material/buttons';
import { CSTableDataSource, ICSTableApi } from '@ngx-codinus/material/table';

// import { NovaTableDataSource } from '@ngx-nova/material-extensions/table';
// import { ITableFilterChangedArgs } from '@ngx-nova/material-extensions/table';
// import { NovaMatButtonStyle } from '@ngx-nova/material-extensions/components';

// import { arrays } from '@ngx-nova/js-extensions';
type ToggleProp = 'showHeader' | 'showFooter' | 'showFilter' | 'reorderColumns' | 'sortable' | 'editable' ;
export interface PeriodicElement {
    name_en: string;
    name_ar: string;
    position: number;
    weight: number;
    symbol: string;
    nested: { weightx: number, symbolx: string };
    active: boolean;
    type: number[];
}
const BaseData = {
    name_en: ['Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon'],
    name_ar: ['هيدروجين', 'هيليوم', 'ليثيوم', 'بريليوم', 'بورون', 'كربون', 'نيتروجين', 'أكسجين', 'فلورين', 'نيون'],
    weight: 1.001,
    symbol: ['H', 'H', 'L', 'B', 'B', 'C', 'N', 'O', 'F', 'N'],
    active: false
}

const _Operations = ['contains', 'notEquals', 'startsWith', 'endsWith', 'equals', 'greaterThan', 'lesserThan', 'greaterThanOrEqual', 'lesserThanOrEqual'];

@Component({
    selector: 'table-buttons',
    templateUrl: './table-buttons.html',
    styleUrls: ['./table-buttons.scss'],
    imports: [CSMatButtonStyle, MatButtonModule, MatMenuModule, MatIconModule, MatSliderModule]
})
export class TableButtonsComponent {

    //private matTableExample = inject(TestMatTableComponent, { optional: true });

    showSymbol = false;
    showHeader = false;
    showFooter = true;
    showFilter = true;
    responsive = true;
    positionColumnDataDef: unknown;
    currentOperation = 'notEquals';

    displayedColumns: string[] = ['position', 'name', 'weight', 'date', 'active', 'type', 'typeGrid'];
    dataSource = new CSTableDataSource(this.createData(100));
    rowHeight = 30;

    toggleProperties: { key: ToggleProp, text: string }[] = [
        { key: 'showHeader', text: 'Show Header' },
        { key: 'showFooter', text: 'Show Footer' },
        { key: 'showFilter', text: 'Show Filter' },
        { key: 'reorderColumns', text: 'Reorder Columns' },
        { key: 'sortable', text: 'Sortable' },
        { key: 'editable', text: 'Editable' },
        // { key: 'responsive', text: 'Responsive' },
    ]

    @Input()
    color: ThemePalette = 'primary';

    createData(count: number): PeriodicElement[] {
        const data = Array.from(Array(count + 1 - 1), (_, index) => {
            const position = index + 1;
            const newIndex = index % 10;
            return {
                name_en: BaseData.name_en[newIndex], name_ar: BaseData.name_ar[newIndex],
                position, symbol: BaseData.symbol[newIndex], weight: BaseData.weight * position,
                nested: { weightx: BaseData.weight * position + 6, symbolx: BaseData.symbol[newIndex] },
                date: new Date(2023, index, newIndex),
                active: position % 15 == 0,
                type: position % 5 == 0 ? [1] : [1, 2],
                typeGrid: position % 5 == 0 ? [1] : [1, 2],
            };
        });
        return data;
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

    insertData() {
        // const dataArray = this.dataSource.data;
        // const record = dataArray ? dataArray[2] : null;
        // if (record) {
        // const newRecord = copyObject(record);
        // newRecord.nested.weightx = 30_00;
        // newRecord.name_en = "Inserted";
        // newRecord.name_ar = "تم إضافته";
        this._tableApi?.addRecord();
        // dataArray.push(newRecord);
        // this.dataSource.notifyChanged();
        // setTimeout(() => {
        //     this._tableApi?.scrollToEnd();
        //     this._tableApi?.selectionModel?.selectRow(newRecord);
        // });

        // }
    }

    removeData() {
        const dataArray = this.dataSource.data;
        const record = dataArray ? dataArray[3] : null;
        if (record) {
            removeFromArray(dataArray, record);
            this.dataSource.notifyChanged();
        }
    }

    toggleSymbol() {
        const columns = this.displayedColumns;
        if (columns.indexOf('symbol') == -1) {
            columns.push('symbol');
            this.showSymbol = true;
        } else {
            removeFromArray(columns, 'symbol');
            this.showSymbol = false;
        }
    }

    toggleOperation() {
        let _newtIndex = _Operations.indexOf(this.currentOperation) + 1;
        if (_newtIndex >= _Operations.length)
            _newtIndex = 0;
        this.currentOperation = _Operations[_newtIndex];
    }
    changeDataSource() {
        this.dataSource = new CSTableDataSource(this.createData(50_000));
    }
    // filterChanged(args: ITableFilterChangedArgs) {
    //     // this.dataSource.filterPredicate = args.predicate;
    //     // this.dataSource.filter = args.filter;
    //     // console.log(args);
    // }

    filterCleared() {
        // this.dataSource.filter = "";
    }

    select3rdRow() {
        const dataArray = this.dataSource.data;
        const record = dataArray ? dataArray[2] : null;
        if (record)
            this._tableApi?.selectionModel?.selectRow(record);
    }

    _tableApi?: ICSTableApi<PeriodicElement>;
    onCreated(event: ICSTableApi<PeriodicElement>) {
        this._tableApi = event;
    }

}