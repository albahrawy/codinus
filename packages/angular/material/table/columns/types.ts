import { InjectionToken } from "@angular/core";
import { Nullable } from "@codinus/types";

export const CODINUS_TABLE_RESIZABLE = new InjectionToken<ICSTableResizable>('cs_table_resizable');

export interface ICSTableResizable {
    setColumnSize(key: string, value: Nullable<string>): void;
    getSize(key: string): Nullable<string>;
}