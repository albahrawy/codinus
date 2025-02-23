import { CSDefaultColumnDataDef, CSTableColumnDataDef } from './dataDef.directive';
import { CSTableDataSourceDirective, CSTableVirtualDataSourceDirective } from './datasource.directive';

export * from './dataDef.directive';
export * from './datasource';
export * from './datasource.directive';
export * from './functions';
export * from './types';

export const CODINUS_TABLE_DATA_DIRECTIVES = [
    CSTableColumnDataDef, CSDefaultColumnDataDef, CSTableDataSourceDirective, CSTableVirtualDataSourceDirective] as const;