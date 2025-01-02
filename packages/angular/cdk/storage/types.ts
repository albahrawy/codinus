import { InjectionToken } from "@angular/core";
import { IGenericRecord } from "@codinus/types";
import { Observable } from "rxjs";

export const CODINUS_STORAGE_SERVICE = new InjectionToken<ICSStorageService>('codinus-storage-service');
export const CODINUS_SERVER_STORAGE_HANDLER = new InjectionToken<ICSServerStorageHandler>('codinus_server_storage_handler');
export const CODINUS_STORAGE_DEFAULT_TYPE = new InjectionToken<StorageType>('codinus_storage_default_type');

export type StorageType = 'local' | 'session' | 'cookies' | 'server';
export type StorageMode = 'string' | 'json' | 'base64' | 'json-base64';


export declare interface ICSStorageService {
    read(key: string, mode?: 'string' | 'base64', type?: StorageType): Observable<string | null>;
    read<T extends IGenericRecord>(key: string, mode: 'json' | 'json-base64', type?: StorageType): Observable<T | null>;
    read<T>(config: IStorageJsonConfig): Observable<T | null>;
    read(config: IStorageStringConfig): Observable<string | null>;
    write(key: string, value: unknown, mode?: StorageMode, type?: StorageType): Observable<boolean>;
    write(config: IStorageConfig, value: unknown): Observable<boolean>;
    remove(key: string, type?: StorageType): Observable<boolean>;
    remove(config: IStorageConfig): Observable<boolean>;
}

export interface ICSServerStorageHandler {
    read(key: string): Observable<string>;
    write(key: string, value: string): Observable<boolean>;
    remove(key: string): Observable<boolean>;
}

export interface IStorageJsonConfig {
    sessionKey: string;
    storageType?: StorageType;
    storageMode?: 'json' | 'json-base64';
}

export interface IStorageStringConfig {
    sessionKey: string;
    storageType?: StorageType;
    storageMode?: 'string' | 'base64';
}

export type IStorageConfig = IStorageJsonConfig | IStorageStringConfig;