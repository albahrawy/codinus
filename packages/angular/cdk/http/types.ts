import {
    HttpClient, HttpContext, HttpContextToken, HttpEvent, HttpHeaders,
    HttpParams, HttpRequest, HttpResponse
} from "@angular/common/http";
import { InjectionToken } from "@angular/core";
import { IArray, IGenericRecord, IStringRecord } from "@codinus/types";
import { ErrorHandleType } from "@ngx-codinus/cdk/observable-error-handler";
import { Observable } from "rxjs";

export const CODINUS_HTTP_URL_RESOLVER = new InjectionToken<IHttpUrlResolver>('codinus_http_url_resolver');
export const CODINUS_REST_API_CONFIG_PATH = new InjectionToken<string>('rest_api_config_path');
export const CODINUS_HTTP_SERVICE = new InjectionToken<ICSHttpService>('codinus_http_service');
export const HTTP_CACHE_SERVICE = new InjectionToken<IHttpCacheService>('http_cache_service');
export const CACHING_ENABLED = new HttpContextToken<boolean>(() => false);


export declare type ApiConfig = {
    base: string;
    urls: { [key: string]: { root: string, endPoints: IStringRecord; } };
};

export interface IHttpUrlResolver {
    getUrl(url: string | string[], segments?: string[]): Observable<string>;
}

export interface IHttpCacheService {
    get(req: HttpRequest<unknown>): HttpResponse<unknown> | undefined | null;
    put(req: HttpRequest<unknown>, response: HttpResponse<unknown>): void;
    clearCache(): void;
}

export interface HttpReqOptionsBase {
    headers?: HttpHeaders | { [header: string]: string | string[] },
    context?: HttpContext,
    params?: HttpParams |
    { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
    reportProgress?: boolean,
    withCredentials?: boolean,
    transferCache?: { includeHeaders?: string[]; } | boolean;
}
type HttpResponseType = 'arraybuffer' | 'blob' | 'text' | 'json';
type HttpReqOptionsBodyBase<T extends HttpResponseType> = HttpReqOptionsBase & { observe?: 'body', responseType?: T };
type HttpReqOptionsEventsBase<T extends HttpResponseType> = HttpReqOptionsBase & { observe: 'events', responseType?: T };
type HttpReqOptionsResponseBase<T extends HttpResponseType> = HttpReqOptionsBase & { observe: 'response', responseType?: T };

type HttpReqOptionsBody = HttpReqOptionsBodyBuffer | HttpReqOptionsBodyBlob | HttpReqOptionsBodyText | HttpReqOptionsBodyJson;
type HttpReqOptionsEvents = HttpReqOptionsEventsBuffer | HttpReqOptionsEventsBlob | HttpReqOptionsEventsText | HttpReqOptionsEventsJson;
type HttpReqOptionsResponse = HttpReqOptionsResponseBuffer | HttpReqOptionsResponseBlob | HttpReqOptionsResponseText | HttpReqOptionsResponseJson;

export type HttpReqOptionsBodyBuffer = HttpReqOptionsBodyBase<'arraybuffer'>;
export type HttpReqOptionsBodyBlob = HttpReqOptionsBodyBase<'blob'>;
export type HttpReqOptionsBodyText = HttpReqOptionsBodyBase<'text'>;
export type HttpReqOptionsBodyJson = HttpReqOptionsBodyBase<'json'>;

export type HttpReqOptionsEventsBuffer = HttpReqOptionsEventsBase<'arraybuffer'>;
export type HttpReqOptionsEventsBlob = HttpReqOptionsEventsBase<'blob'>;
export type HttpReqOptionsEventsText = HttpReqOptionsEventsBase<'text'>;
export type HttpReqOptionsEventsJson = HttpReqOptionsEventsBase<'json'>;

export type HttpReqOptionsResponseBuffer = HttpReqOptionsResponseBase<'arraybuffer'>;
export type HttpReqOptionsResponseBlob = HttpReqOptionsResponseBase<'blob'>;
export type HttpReqOptionsResponseText = HttpReqOptionsResponseBase<'text'>;
export type HttpReqOptionsResponseJson = HttpReqOptionsResponseBase<'json'>;


export type HttpReqOptions = HttpReqOptionsBody | HttpReqOptionsEvents | HttpReqOptionsResponse;

export interface HttpHandleOptions {
    auditAction?: string;
    errorHandleType?: ErrorHandleType;
    logError?: boolean;
    argsType?: 'path' | 'query',
    enableCache?: boolean;
}

export declare interface ICSHttpService {

    readonly httpClient: HttpClient;

    get<T = unknown>(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyJson): Observable<T | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBuffer): Observable<ArrayBuffer | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBlob): Observable<Blob | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyText): Observable<string | null>;

    get<T = unknown>(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsJson): Observable<HttpEvent<T> | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBuffer): Observable<HttpEvent<ArrayBuffer> | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBlob): Observable<HttpEvent<Blob> | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsText): Observable<HttpEvent<string> | null>;

    get<T = unknown>(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseJson): Observable<HttpResponse<T> | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBuffer): Observable<HttpResponse<ArrayBuffer> | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBlob): Observable<HttpResponse<Blob> | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseText): Observable<HttpResponse<string> | null>;

    delete<T = unknown>(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyJson): Observable<T | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBuffer): Observable<ArrayBuffer | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBlob): Observable<Blob | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyText): Observable<string | null>;

    delete<T = unknown>(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsJson): Observable<HttpEvent<T> | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBuffer): Observable<HttpEvent<ArrayBuffer> | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBlob): Observable<HttpEvent<Blob> | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsText): Observable<HttpEvent<string> | null>;

    delete<T = unknown>(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseJson): Observable<HttpResponse<T> | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBuffer): Observable<HttpResponse<ArrayBuffer> | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBlob): Observable<HttpResponse<Blob> | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseText): Observable<HttpResponse<string> | null>;

    post<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyJson): Observable<T | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBuffer): Observable<ArrayBuffer | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBlob): Observable<Blob | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyText): Observable<string | null>;

    post<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsJson): Observable<HttpEvent<T> | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBuffer): Observable<HttpEvent<ArrayBuffer> | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBlob): Observable<HttpEvent<Blob> | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsText): Observable<HttpEvent<string> | null>;

    post<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseJson): Observable<HttpResponse<T> | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBuffer): Observable<HttpResponse<ArrayBuffer> | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBlob): Observable<HttpResponse<Blob> | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseText): Observable<HttpResponse<string> | null>;

    put<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyJson): Observable<T | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBuffer): Observable<ArrayBuffer | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBlob): Observable<Blob | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyText): Observable<string | null>;

    put<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsJson): Observable<HttpEvent<T> | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBuffer): Observable<HttpEvent<ArrayBuffer> | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBlob): Observable<HttpEvent<Blob> | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsText): Observable<HttpEvent<string> | null>;

    put<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseJson): Observable<HttpResponse<T> | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBuffer): Observable<HttpResponse<ArrayBuffer> | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBlob): Observable<HttpResponse<Blob> | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseText): Observable<HttpResponse<string> | null>;

    patch<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyJson): Observable<T | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBuffer): Observable<ArrayBuffer | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBlob): Observable<Blob | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyText): Observable<string | null>;

    patch<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsJson): Observable<HttpEvent<T> | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBuffer): Observable<HttpEvent<ArrayBuffer> | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBlob): Observable<HttpEvent<Blob> | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsText): Observable<HttpEvent<string> | null>;

    patch<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseJson): Observable<HttpResponse<T> | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBuffer): Observable<HttpResponse<ArrayBuffer> | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBlob): Observable<HttpResponse<Blob> | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseText): Observable<HttpResponse<string> | null>;
}