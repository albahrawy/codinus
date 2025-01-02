import { InjectionToken, OutputEmitterRef } from "@angular/core";
import { IStringRecord } from "@codinus/types";
import { Observable } from "rxjs";

export const CODINUS_CONTEXT_MENU_PARENT = new InjectionToken<ICSContextMenuParent>('codinus_context_menu_parent');

export declare interface IContextMenuItem {
    key: string;
    icon?: string;
    disabled?: boolean;
    caption?: string | IStringRecord;
    cssClass?: string;
    hidden?: boolean;
    action?: (args: IContextMenuClickArgs) => void;
}

export declare interface IContextMenuClickArgs {
    menuItem: IContextMenuItem;
    data: unknown;
}

export interface ICSContextMenuParent {
    readonly conextMenuOpening: Observable<ConextMenuOpeningArgs> | OutputEmitterRef<ConextMenuOpeningArgs>;
}

export type ConextMenuOpeningArgs = { data?: unknown, event?: Event };

export type ConextMenuOpenArgs = { menuItems: IContextMenuItem[], data?: unknown };
