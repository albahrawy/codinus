import { CSColumnReordable } from './reordable.directive';
import { CSCDKTableReorderColumns } from './reorder.directive';
import { CSTableColumnResize } from './resize.directive';
import { CSCdkTableResizable, CSTableResizable } from './resizeable.directive';
import { CSColumnSortable, CSTableSortableDirective } from './sortable.directive';

export * from './resize.directive';
export * from './reorder.directive';
export * from './reordable.directive';
export * from './sortable.directive';
export * from './resizeable.directive';

export const CODINUS_TABLE_COLUMNS = [CSCDKTableReorderColumns, CSColumnReordable,
    CSColumnSortable, CSTableSortableDirective, CSTableColumnResize, CSTableResizable, CSCdkTableResizable] as const;
