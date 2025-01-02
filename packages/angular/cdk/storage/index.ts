import { EnvironmentProviders, makeEnvironmentProviders, Provider, Type } from '@angular/core';
import { DefaultCSStorageService } from './storage.service';
import {
    ICSServerStorageHandler, CODINUS_SERVER_STORAGE_HANDLER,
    CODINUS_STORAGE_DEFAULT_TYPE, CODINUS_STORAGE_SERVICE, StorageType
} from './types';

export * from './cookies-storage';
export * from './storage.service';
export * from './types';

export function provideCodinusStorageService(defaultStorageType?: StorageType, serverHandler?: Type<ICSServerStorageHandler>): EnvironmentProviders {

    const providers: Provider | EnvironmentProviders[] = [
        { provide: CODINUS_STORAGE_SERVICE, useExisting: DefaultCSStorageService }
    ];
    if (serverHandler)
        providers.push({ provide: CODINUS_SERVER_STORAGE_HANDLER, useExisting: serverHandler });

    if (defaultStorageType)
        providers.push({ provide: CODINUS_STORAGE_DEFAULT_TYPE, multi: true, useValue: defaultStorageType });

    return makeEnvironmentProviders(providers);
} 