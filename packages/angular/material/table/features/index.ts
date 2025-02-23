import { CSTableNavigatableCell } from '../cells/navigatable-cell';
import { CSInteractiveRowDirective } from './row-interactive.directive';
import { CSInteractiveTableDirective } from './table-interactive.directive';

export * from './row-interactive.directive';
export * from './table-interactive.directive';
export * from '../cells/navigatable-cell';
export * from './rows-definitions.directive';

export const CODINUS_TABLE_SELECTION_NAVIGATION
    = [CSInteractiveTableDirective, CSInteractiveRowDirective, CSTableNavigatableCell] as const