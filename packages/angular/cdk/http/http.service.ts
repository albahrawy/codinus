/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpContext, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { isObject, jsonMap, toStringValue } from "@codinus/js-extensions";
import { IArray, IGenericRecord } from "@codinus/types";
import { CODINUS_OBSERVABLE_ERROR_HANDLER } from "@ngx-codinus/cdk/observable-error-handler";
import { Observable, switchMap } from "rxjs";
import { CACHING_ENABLED, CODINUS_HTTP_URL_RESOLVER, HttpHandleOptions, HttpReqOptions, ICSHttpService } from "./types";

type IGenericObservable = Observable<any>;

@Injectable({ providedIn: 'root' })
export class CSHttpService implements ICSHttpService {

    httpClient = inject(HttpClient);
    protected urlResolver = inject(CODINUS_HTTP_URL_RESOLVER);
    protected errorHandler = inject(CODINUS_OBSERVABLE_ERROR_HANDLER, { optional: true });

    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptions): IGenericObservable {
        reqOptions = this._assignReqOptions(reqOptions, handleOptions);
        const urlSegments = this.assignArgs(reqOptions, handleOptions?.argsType, args);
        return this.placeRequest(url, urlSegments, handleOptions, fullUrl => this.httpClient.get(fullUrl, reqOptions as any));
    }

    private _assignReqOptions(reqOptions?: HttpReqOptions, handleOptions?: HttpHandleOptions): HttpReqOptions {
        reqOptions ??= {};
        if (handleOptions?.enableCache)
            reqOptions.context = new HttpContext().set(CACHING_ENABLED, true);
        return reqOptions;
    }

    getWithProgress(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptions): IGenericObservable {
        reqOptions = this._assignReqOptions(reqOptions, handleOptions);
        const urlSegments = this.assignArgs(reqOptions, handleOptions?.argsType, args);
        if (!reqOptions)
            reqOptions = {};
        reqOptions.reportProgress = true;
        reqOptions.observe = 'events';
        return this.placeRequest(url, urlSegments, handleOptions, fullUrl => this.httpClient.get(fullUrl, reqOptions as any));
    }

    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptions): IGenericObservable {
        reqOptions = this._assignReqOptions(reqOptions, handleOptions);
        const urlSegments = this.assignArgs(reqOptions, handleOptions?.argsType, args);
        return this.placeRequest(url, urlSegments, handleOptions, fullUrl => this.httpClient.delete(fullUrl, reqOptions as any));
    }

    post(url: string | string[], body: unknown, handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptions): IGenericObservable {
        reqOptions = this._assignReqOptions(reqOptions, handleOptions);
        return this.placeRequest(url, undefined, handleOptions, fullUrl => this.httpClient.post(fullUrl, body, reqOptions as any));
    }

    put(url: string | string[], body: unknown, handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptions): IGenericObservable {
        reqOptions = this._assignReqOptions(reqOptions, handleOptions);
        return this.placeRequest(url, undefined, handleOptions, fullUrl => this.httpClient.put(fullUrl, body, reqOptions as any));
    }

    patch(url: string | string[], body: unknown, handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptions): IGenericObservable {
        reqOptions = this._assignReqOptions(reqOptions, handleOptions);
        return this.placeRequest(url, undefined, handleOptions, fullUrl => this.httpClient.patch(fullUrl, body, reqOptions as any));
    }

    private assignArgs(reqOptions: HttpReqOptions, argsType?: 'path' | 'query', args?: IGenericRecord | IArray): string[] | undefined {
        if (!args)
            return;
        if (argsType === 'query') {
            if (isObject(args)) {
                const reqParams = reqOptions.params ?? new HttpParams();
                if (reqParams instanceof HttpParams)
                    reqOptions.params = reqParams.appendAll(jsonMap(args, v => toStringValue(v)));
                else {
                    jsonMap(args, (v, k) => reqParams[k] = toStringValue(v));
                    reqOptions.params = reqParams;
                }
            }
        } else {
            if (Array.isArray(args))
                return args.map(v => toStringValue(v));
            else if (isObject(args))
                return Object.values(args).map(v => toStringValue(v));
        }
        return;
    }

    private placeRequest<T>(url: string | string[], urlSegments: string[] | undefined, handleOptions: HttpHandleOptions | undefined,
        httpCall: (fullUrl: string) => Observable<T>) {
        const errorHandler = this.errorHandler?.errorHandler<T | null>(handleOptions?.errorHandleType, handleOptions?.logError);
        const urlObservable = this.urlResolver.getUrl(url, urlSegments);
        if (errorHandler != null)
            return urlObservable.pipe(switchMap(fullUrl => httpCall(fullUrl)), errorHandler);
        else
            return urlObservable.pipe(switchMap(fullUrl => httpCall(fullUrl)));
    }
}