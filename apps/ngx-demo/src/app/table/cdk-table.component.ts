import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { CODINUS_TABLE_COLUMNS, CODINUS_TABLE_DATA_DIRECTIVES, CODINUS_TABLE_RESPONSIVE, CODINUS_TABLE_VIRTUAL_SCROLL, CSTableApiIRegistrar, CSTableMetaRowsVisiblity } from '@ngx-codinus/material/table';
import { TableButtonsComponent } from './table-buttons/table-buttons';



@Component({
  selector: 'cdk-table-virtual-scroll',
  templateUrl: './cdk-table.component.html',
  styleUrls: ['./cdk-table.component.scss'],
  imports: [
    CommonModule, TableButtonsComponent, CdkTableModule,
    CODINUS_TABLE_VIRTUAL_SCROLL,
    //TABLE_SELECTION, CdkTableKeyboadNavigation, 
    CODINUS_TABLE_COLUMNS,
    //NOVA_TABLE_FILTER_CORE, NOVA_TABLE_EDIT_CORE,
    CODINUS_TABLE_RESPONSIVE,
    CODINUS_TABLE_DATA_DIRECTIVES,
    MatSortModule,
    CSTableMetaRowsVisiblity,
    //FilterTextCustom, 
    CSTableApiIRegistrar
  ]
})
export class TestCdkTableComponent {
}
