import { CSTableReactiveCell } from './reactive-cell';
import { CSTableFooterReactiveCell } from './reactive-footer-cell';

export * from './reactive-cell';
export * from './reactive-footer-cell';

export const CODINUS_TABLE_CELLS = [CSTableFooterReactiveCell, CSTableReactiveCell] as const;