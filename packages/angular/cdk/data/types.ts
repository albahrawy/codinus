import { InjectionToken } from "@angular/core";
import { IGenericRecord, IRecord } from "@codinus/types";
import { HttpHandleOptions, HttpReqOptions } from "@ngx-codinus/cdk/http";
import { ICSFileInfo } from "@ngx-codinus/core/shared";
import { Observable } from "rxjs";


export const CODINUS_DATA_SERVICE = new InjectionToken<ICSDataService>('cs_data_service');
export const CODINUS_DATA_RESPONSE_PARSER = new InjectionToken<ICSDataResponseParser>('cs_data_response_parser');

export type DataResponseType = 'set' | 'table' | 'row' | 'value' | 'json' | 'bytes' | 'execute';
export type DataHttpHandleOptions = Omit<HttpHandleOptions, "argsType">;

export type DataTableCompactResponseType = { columns: string[], rows: Array<unknown>[] };
export type DataTableResponseType = IGenericRecord[];
export type DataSetResponseType = IRecord<DataTableResponseType>;

export declare interface ICSDataRequestBase<T extends DataResponseType> {
    dbContext?: string;
    queryName?: string;
    additional?: string;
    responseType?: T;
    args?: IGenericRecord;
    auditInfo?: ICSRequestAuditInfo;
}

export interface ICSRequestAuditInfo {
    auditLogKey?: string;
    action?: string;
}

export interface ICSSaveRequest {
    oldArgs?: IGenericRecord;
    files?: ICSFileInfo[];
}

declare type IDataRequestReturnSet = ICSDataRequestBase<'set'>;
declare type IDataRequestReturnTable = ICSDataRequestBase<'table'>;
declare type IDataRequestReturnRow = ICSDataRequestBase<'row'>;
declare type IDataRequestReturnValue = ICSDataRequestBase<'value'>;
declare type IDataRequestReturnJson = ICSDataRequestBase<'json'>;
declare type IDataRequestReturnBytes = ICSDataRequestBase<'bytes'>;
declare type IDataRequestReturnNone = ICSDataRequestBase<'execute'>;

export declare type ICSDataRequest =
    IDataRequestReturnSet | IDataRequestReturnTable |
    IDataRequestReturnRow | IDataRequestReturnValue |
    IDataRequestReturnJson | IDataRequestReturnBytes | IDataRequestReturnNone;

export declare interface ICSLookupData {
    key?: number,
    data: IGenericRecord;
}

export declare interface ICSLookupDefinition extends ICSLookupData {
    name: string;
    protected?: boolean;
}

export interface ICSDataService {
    get(request: IDataRequestReturnTable, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<DataTableResponseType | null>;
    get<T>(request: IDataRequestReturnTable, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T[] | null>;
    get(request: IDataRequestReturnSet, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<DataSetResponseType | null>;
    get<T extends IGenericRecord = IGenericRecord>(request: IDataRequestReturnRow, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T | null>;
    get<T = unknown>(request: IDataRequestReturnValue, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T | null>;
    get<T extends IGenericRecord = IGenericRecord>(request: IDataRequestReturnJson, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T | null>;
    get(request: IDataRequestReturnBytes, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<Blob | null>;

    save(request: IDataRequestReturnSet & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<DataSetResponseType | null>;
    save(request: IDataRequestReturnTable & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<DataTableResponseType | null>;
    save<T extends IGenericRecord = IGenericRecord>(request: IDataRequestReturnRow & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T | null>;
    save<T = unknown>(request: IDataRequestReturnValue & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T | null>;
    save<T extends IGenericRecord = IGenericRecord>(request: IDataRequestReturnJson & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T | null>;
    save(request: IDataRequestReturnBytes & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<Blob | null>;
    save(request: IDataRequestReturnNone & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<number | null>;
}

export interface ICSLookupService {
    get<T = IGenericRecord>(lookupKey: number, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T>;
    save(lookupKey: number, data: ICSLookupData, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<ICSLookupData>;
    delete(lookupKey: number, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<boolean>;
    getDefinition<T = IGenericRecord>(lookupKey?: number, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T>;
    getDefinitionKeys(options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<ICSLookupDefinition>;
    saveDefinition(lookupKey: number, data: ICSLookupDefinition, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<ICSLookupData>;
    deleteDefinition(lookupKey: number, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<boolean>;
}

export interface ICSDataResponseParser {
    parse(data: unknown, responseType?: DataResponseType): unknown;
}