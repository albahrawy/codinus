import { CSTableColumnDataDef } from './dataDef.directive';
import { CSTableDataSourceDirective } from './datasource.directive';

export * from './dataDef.directive';
export * from './datasource';
export * from './datasource.directive';
export * from './functions';
export * from './types';

export const CODINUS_TABLE_DATA_DIRECTIVES = [CSTableColumnDataDef, CSTableDataSourceDirective] as const;