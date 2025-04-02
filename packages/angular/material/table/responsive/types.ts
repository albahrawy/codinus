import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

export const CODINUS_TABLE_RESPONSIVE_VIEW = new InjectionToken<ICSTableResponsiveView>('codinus_table_responsive_view');

export interface ICSTableResponsiveView {
    viewChanged: Observable<ICSTableResponsiveArgs>;
}

export interface ICSTableResponsiveArgs {
    columns: number;
    cells: number;
}