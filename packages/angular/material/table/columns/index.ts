import { CSColumnReordable } from './reordable.directive';
import { CSTableReorderColumns } from './reorder.directive';
import { CSTableColumnResize } from './resize.directive';
import { CSColumnSortable, CSTableSortableDirective } from './sortable.directive';

export * from './resize.directive';
export * from './reorder.directive';
export * from './reordable.directive';
export * from './sortable.directive';

export const CODINUS_TABLE_COLUMNS = [CSTableReorderColumns, CSColumnReordable,
    CSColumnSortable, CSTableSortableDirective, CSTableColumnResize] as const;