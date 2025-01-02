import { InjectionToken } from "@angular/core";
import { IStorageJsonConfig } from "@ngx-codinus/cdk/storage";
import { Observable } from "rxjs";

export const CODINUS_AUTH_SERVICE = new InjectionToken<IAuthService>('codinus-auth-service');
export const CODINUS_AUTH_CONFIG = new InjectionToken<ICSAuthConfig>('codinus-auth-storage-config');

export declare interface IAuthService {
    currentUser(): IAuthUser | null | undefined;
    currentUserToken(): string | null | undefined;
    isLoggedIn: Observable<boolean>;
    login(loginName: string, password: string): Observable<IAuthUser | null>;
    logout(): void;
}

export const DefaultAuthConfig: ICSAuthConfig = {
    logoutRedirectUrl: '/',
    storageConfig: {
        sessionKey: 'sessionInfo',
        storageType: 'session',
        storageMode: 'json-base64'
    }
}

export interface IAuthUser {
    key: number;
    loginName: string;
    email?: string;
    token?: string;
    mustChangePassword?: boolean;
}

export interface ICSAuthConfig {
    storageConfig: IStorageJsonConfig;
    logoutRedirectUrl: string;
}