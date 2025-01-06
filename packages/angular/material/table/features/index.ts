import { CSInteractiveRowDirective } from './row-interactive.directive';
import { CSInteractiveTableDirective } from './table-interactive.directive';

export * from './row-interactive.directive';
export * from './table-interactive.directive';

export const CODINUS_TABLE_SELECTION_NAVIGATION = [CSInteractiveTableDirective, CSInteractiveRowDirective] as const