import { IStringRecord } from "@codinus/types";
import { ICSRuntimeFormConfig, ICSRuntimeFormEvents } from "@ngx-codinus/material/forms";

export const enum CSDataAccess { None = 0, New = 1, Edit = 2, Delete = 4, Save = 8, Print = 16 };

export interface IAppPageInfo {
    pageName: string;
    originalName?: string;
    local: boolean;
}
export interface IAppPageProperties {
    pageName: string;
    pageType?: 'page' | 'form' | 'grid';
    title: IStringRecord;
    cssClass?: string;
    icon?: string;

    autoSaveLayout?: boolean;
    gridSize?: number;
    dataAccess: CSDataAccess;
    codeClassName?: string;

    //leaveConfirmConfig: IConfirmConfig;

    // search: IPageSearch;
    // buttons: IToolBarButton[];
    // securityItems: IDataPageSecurityItem[];
    // reports: ReportMenuInfo[]
}

export interface IAppPageContent {
    properties: IAppPageProperties,
    sections: ICSRuntimeFormConfig,
    code?: string;
    styles?: string;
}

export interface IAppClientPageContent {
    properties?: IAppPageProperties,
    sections: ICSRuntimeFormConfig,
    events?: ICSRuntimeFormEvents | null;
    styles?: string;
}