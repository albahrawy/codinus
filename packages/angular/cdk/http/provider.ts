import { HttpInterceptorFn, provideHttpClient, withInterceptors } from "@angular/common/http";
import { EnvironmentProviders, Provider, makeEnvironmentProviders } from "@angular/core";
import { CSHttpUrlResolver } from "./http-url.resolver";
import { CSHttpService } from "./http.service";
import { CODINUS_HTTP_SERVICE, CODINUS_HTTP_URL_RESOLVER, CODINUS_REST_API_CONFIG_PATH } from "./types";

export function provideCodinusHttpService(apiConfigPath?: string, interceptorFns?: HttpInterceptorFn[], includeHttpClient = true): EnvironmentProviders {

    const providers: (Provider | EnvironmentProviders)[] = [
        { provide: CODINUS_HTTP_SERVICE, useExisting: CSHttpService },
        { provide: CODINUS_HTTP_URL_RESOLVER, useExisting: CSHttpUrlResolver },
    ];

    if (apiConfigPath)
        providers.push({ provide: CODINUS_REST_API_CONFIG_PATH, multi: true, useValue: apiConfigPath });

    if (interceptorFns?.length)
        providers.push(provideHttpClient(withInterceptors(interceptorFns)));
    else if (includeHttpClient)
        providers.push(provideHttpClient());

    return makeEnvironmentProviders(providers);
}
