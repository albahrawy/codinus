import { inject, Injectable } from "@angular/core";
import { base64ToString, isEmpty, jsonParse, jsonStringify, stringToBase64, toStringValue } from "@codinus/js-extensions";
import { IGenericRecord } from "@codinus/types";
import { from, map, mergeMap, Observable, of } from "rxjs";
import { CookiesStorage } from "./cookies-storage";
import {
    ICSStorageService, IStorageConfig, CODINUS_SERVER_STORAGE_HANDLER,
    CODINUS_STORAGE_DEFAULT_TYPE, StorageMode, StorageType
} from "./types";

@Injectable({ providedIn: 'root' })
export class DefaultCSStorageService implements ICSStorageService {

    private _serverHandler = inject(CODINUS_SERVER_STORAGE_HANDLER, { optional: true });
    private _defaultType = inject(CODINUS_STORAGE_DEFAULT_TYPE, { optional: true }) ?? 'local';

    read<T extends IGenericRecord | string = string>(config: IStorageConfig): Observable<T | string | null>;
    read<T extends IGenericRecord | string = string>(key: string, mode?: StorageMode, type?: StorageType): Observable<T | string | null>;
    read<T extends IGenericRecord | string = string>(config: string | IStorageConfig, mode?: StorageMode, type?: StorageType): Observable<T | string | null> {
        if (config == null)
            return of(null);
        let key: string;
        if (typeof config === 'string') {
            key = config;
        } else {
            mode = config.storageMode;
            type = config.storageType;
            key = config.sessionKey;
            if (key == null)
                return of(null);
        }

        type ??= this._defaultType;

        const isEncoded = mode?.includes('base64');
        const isJson = mode?.includes('json');

        return this._readCore(key, type)
            .pipe(
                mergeMap(v => (isEncoded && v) ? from(base64ToString(v)) : of(v ?? null)),
                map(v => (isJson && v ? jsonParse<T>(v) : v))
            );
    }

    write(config: IStorageConfig, value: unknown): Observable<boolean>;
    write(key: string, value?: unknown, mode?: StorageMode, type?: StorageType): Observable<boolean>;
    write(config: string | IStorageConfig, value?: unknown, mode?: StorageMode, type?: StorageType): Observable<boolean> {
        if (config == null || isEmpty(value))
            return of(false);

        let key: string;
        if (typeof config === 'string') {
            key = config;
        } else {
            mode = config.storageMode;
            type = config.storageType;
            key = config.sessionKey;
            if (key == null)
                return of(false);
        }

        type ??= this._defaultType;

        const stringValue = typeof (value) === 'string'
            ? value
            : mode?.includes('json')
                ? jsonStringify(value)
                : toStringValue(value);

        return (mode?.includes('base64')
            ? from(stringToBase64(stringValue))
            : of(stringValue))
            .pipe(mergeMap(v => this._writeCore(key, v, type)));
    }

    remove(config: IStorageConfig): Observable<boolean>;
    remove(key: string, type?: StorageType): Observable<boolean>;
    remove(config: string | IStorageConfig, type?: StorageType): Observable<boolean> {
        if (config == null)
            return of(false);

        let key: string;
        if (typeof config === 'string') {
            key = config;
        } else {
            type = config.storageType;
            key = config.sessionKey;
            if (key == null)
                return of(false);
        }

        type ??= this._defaultType;

        return this._removeCore(key, type);
    }

    private getStorage(type?: StorageType): Storage {
        switch (type) {
            case 'session':
                return sessionStorage;
            case 'cookies':
                return CookiesStorage.current;
            default:
                return localStorage;
        }
    }

    private _writeCore(key: string, value: string | null, type?: StorageType): Observable<boolean> {
        if (value == null)
            return of(false);
        if (type === 'server')
            return this._serverHandler?.write(key, value) ?? of(false);
        this.getStorage(type).setItem(key, value);
        return of(true);
    }

    private _readCore(key: string, type?: StorageType) {
        if (type === 'server')
            return this._serverHandler?.read(key) ?? of(null);
        return of(this.getStorage(type).getItem(key));
    }

    private _removeCore(key: string, type?: StorageType) {
        if (type === 'server')
            return this._serverHandler?.remove(key) ?? of(false);
        this.getStorage(type)?.removeItem(key);
        return of(true);
    }
}