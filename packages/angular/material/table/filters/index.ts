import { CSTableFilterComponent } from './component/filter.component';
import {
    CSCdkFilterCellDef, CSMatFilterCellDef, CSCdkFilterColumnDef, CSMatFilterColumnDef,
    CSMatFilterRowDef, CSCdkFilterRowDef
} from './filter-def.directive';
import { CSTableFilterEvents } from './filter-events.directive';
import { CSCdkFilterCell, CSMatFilterCell, CSCdkFilterRow, CSMatFilterRow } from './filter-row-cell.directive';

export * from './_filter-element-base';
export * from './filter-def.directive';
export * from './filter-events.directive';
export * from './filter-row-cell.directive';
export * from './component/filter.component';

export const CODINUS_TABLE_FILTERS = [
    CSCdkFilterCellDef,
    CSMatFilterCellDef, CSCdkFilterColumnDef, CSMatFilterColumnDef,
    CSMatFilterRowDef, CSCdkFilterRowDef,
    CSCdkFilterCell, CSMatFilterCell,
    CSCdkFilterRow, CSMatFilterRow, CSTableFilterEvents,
    CSTableFilterComponent
] as const;