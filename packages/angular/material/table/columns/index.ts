import { CSColumnDraggable } from './draggable.directive';
import { CSTableReorderColumns } from './reorder.directive';
import { CSTableColumnResize } from './resize.directive';
import { CSColumnSortable, CSTableSortableDirective } from './sortable.directive';

export * from './resize.directive';
export * from './reorder.directive';
export * from './draggable.directive';
export * from './sortable.directive';

export const CODINUS_TABLE_COLUMNS_REORDER = [CSTableReorderColumns, CSColumnDraggable] as const;
export const CODINUS_TABLE_COLUMNS_SORT = [CSColumnSortable, CSTableSortableDirective] as const;
export const CODINUS_TABLE_COLUMNS = [CODINUS_TABLE_COLUMNS_REORDER, CODINUS_TABLE_COLUMNS_SORT, CSTableColumnResize] as const;