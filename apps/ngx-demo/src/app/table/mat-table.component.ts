import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { TableButtonsComponent } from './table-buttons/table-buttons';
import {
  CSAggregationFn, CSTableApiIRegistrar, CSTableMetaRowsVisiblity, CSTableSelectionChange,
  CSTableDisplayedColumns, CodinusTableModule
} from '@ngx-codinus/material/table';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { CSAggregation } from '@ngx-codinus/core/data';
import { of, tap } from 'rxjs';


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

// @Component({
//   selector: 'filter-text-custom',
//   template: 'ahmed',
//   providers: [{ provide: TABLE_FILTER_ELEMENT, useExisting: FilterTextCustom }]
// })
// export class FilterTextCustom implements ITableFilterElement<string> {

//   defaultOperation = 'custom'
//   predicates: FilterPredicates<string> = {
//     'custom': (a, b) => a.includes(b),
//     'custom1': (a, b) => a.localeCompare(b) === 0,
//     'custom2': (a, b) => a.startsWith(b),
//   };

//   changeFilter = noopFn;
//   clearFilter = noopFn;

//   registerClearFilter(fn: () => void): void {
//     this.clearFilter = fn;
//   }

//   registerChangeFilter(fn: (value: unknown) => void): void {
//     this.changeFilter = fn;
//   }


// }


@Component({
  selector: 'mat-table-virtual-scroll',
  templateUrl: './mat-table.component.html',
  styleUrls: ['./mat-table.component.scss'],
  imports: [
    CommonModule, TableButtonsComponent, MatTableModule,
    CodinusTableModule,
    CSTableDisplayedColumns,
    MatSortModule,
    CSTableMetaRowsVisiblity,
    //FilterTextCustom, 
    CSTranslatePipe, CSTableApiIRegistrar
  ]
})
export class TestMatTableComponent {
  onSelectChange(arg: CSTableSelectionChange) {
    // console.log(arg);
  }
  gridEvents = new TestGridEvents();
  // // filters: TableFilters = { 'position': { type: 'string', dataKey: 'abbass' } };
  //filterType: FilterType = 'string';
  nameKey = { ar: 'name_ar', en: 'name_en' };
  //numberFilterType: FilterType = 'number';

  // changeFilterConfig() {
  //   // const newPosition = {...this.filters['position']};
  //   // newPosition.dataKey='ahmed';
  //   // this.filters['position'] = newPosition;
  //   // this.filters['name'] = { type: 'string', dataKey: 'abbass' };
  //   // this.filters ={...this.filters};
  //   this.filters = { 'position': { type: 'string', dataKey: 'abbass' }, 'name': { type: 'string', dataKey: 'abbass' } };
  //  }
  dateFilterOptions = {
    dateFormat: 'dd-MM-yyyy'
  };
  typesOfShoes: unknown[] = Array(10).fill(0).map((v, i) => ({
    name: 'item' + (i + 1), value: i + 1, icon: 'home', disable: (i + 1) % 15 == 0
  }));
  selectOptions = {
    optionHeight: 30,
    categorized: 'none',
    multiple: true,
    dataSource: this.typesOfShoes,
    displayMember: "name",
    valueMember: "value",
    iconMember: "icon",
    showSearch: true,
    isDialog: false,
    disableMember: "disable",
    iconColor: 'accent',
    showIndex: true,
    iconType: 'icon',
    panelWidth: '400px',
    titleDisplayCount: 2
  }

  selectGridOptions =
    {
      optionHeight: 30,
      multiple: true,
      dataSource: this.createDataForGrid(10),
      displayMember: "name_en",
      valueMember: "position",
      iconMember: "icon",
      showFilter: true,
      showHeader: true,
      isDialog: false,
      disableMember: "disable",
      iconColor: 'accent',
      showIndex: true,
      iconType: 'icon',
      panelWidth: '400px',
      titleDisplayCount: 2,
      responsive: { enabled: true, xs: 1, sm: 1 },
      columns: [
        {
          name: 'position', footerAggregation: 'sum', headerText: 'No.', // sticky: 'start',
          resizable: true, draggable: true, sortable: true, filter: { type: 'number' }, editor: { type: 'number' }
        },
        {
          name: 'date', cellFormatter: 'dd/MM/yyyy', footerDefaultValue: 'Footer', headerText: 'Date',
          resizable: true, draggable: false, sortable: true,
          filter: { type: 'date', operations: ['equals', 'greaterThan'], options: { dateFormat: 'dd-MM-yyyy' } },
          editor: { type: 'date' }
        },
        {
          name: 'weight', footerAggregation: 'avg', headerText: 'Weight', dataKey: "nested.weightx", cellFormatter: "#,###.##",
          footerFormatter: "Avg. {#,###.00}", resizable: true, draggable: true, sortable: true,
          filter: { type: 'number', options: { decimalDigits: 3, mode: "decimal" } },
          editor: { type: 'decimal', options: { allowArrowKeys: true, mode: "decimal" } }
        },
        {
          name: 'symbol', headerText: 'Symbol',
          resizable: true, draggable: true, sortable: true, filter: { type: 'string' }, editor: { type: 'string' }
        },
      ]

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

  // drop(event: CdkDragDrop<string[]>, buttons: any) {
  //   const source = buttons.displayedColumns[event.previousIndex];
  //   const target = buttons.displayedColumns[event.currentIndex];
  //   if (!source || !target)
  //     return;

  //   // const targeteInMap = this._columnsMap.get(target);
  //   // const sourceInMap = this._columnsMap.get(source);
  //   // if (sourceInMap && targeteInMap) {
  //   //   const sourceIndex = sourceInMap.displayIndex;
  //   //   sourceInMap.displayIndex = targeteInMap.displayIndex;
  //   //   targeteInMap.displayIndex = sourceIndex;
  //   // }
  //   console.log(buttons.displayedColumns, event.previousIndex, event.currentIndex);
  //   moveItemInArray(buttons.displayedColumns, event.previousIndex, event.currentIndex);
  //   console.log(buttons.displayedColumns);
  // }

  // toggleWeightFilterType() {
  //   this.numberFilterType = 'number';
  // }
  footerAggregation: CSAggregation | CSAggregationFn<unknown> = 'sum';
  sortPredicate = (index: number, drag: CdkDrag, drop: CdkDropList) => {
    const dropped = drop.getSortedItems()[index];
    return !dropped?.disabled;
  };

  changeAggregation() {
    //this.footerAggregation = (k, d, r) => d?.length && r?.length ? d.length / r.length : 0;
  }
}

class TestGridEvents {
  type_DataSource() {
    return of(Array(10).fill(0).map((v, i) => ({
      name: 'item' + (i + 1), value: i + 1, icon: 'home', disable: (i + 1) % 15 == 0
    }))).pipe(tap(x => console.log(x)));
  }
  tableApi = null;
}