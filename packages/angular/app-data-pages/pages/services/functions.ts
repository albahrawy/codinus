import { InjectOptions, Injector, ProviderToken } from "@angular/core";
import { isClassType } from "@codinus/js-extensions";
import { ICSTranspliedModule } from "@codinus/ts-parser";
import { IAction, IGenericRecord } from "@codinus/types";
import { CODINUS_AUTH_SERVICE } from "@ngx-codinus/cdk/authorization";
import { CODINUS_DATA_SERVICE } from '@ngx-codinus/cdk/data';
import { CODINUS_HTTP_SERVICE } from "@ngx-codinus/cdk/http";
import { CODINUS_LOCALIZER } from "@ngx-codinus/cdk/localization";
import { CODINUS_STORAGE_SERVICE } from "@ngx-codinus/cdk/storage";
import { ICSRuntimeFormEvents } from "@ngx-codinus/material/forms";
import { BehaviorSubject } from "rxjs";
import * as jsExtensions from '@codinus/js-extensions';


export function assignRferences(module: ICSTranspliedModule | undefined | null, injector: Injector, className?: string) {
    if (!module?.classes?.length)
        return null;

    const pageClassName = className ? module.classes.find(c => c === className) : module.classes[0];
    const pageClass = pageClassName ? module[pageClassName] : null;
    if (!isClassType(pageClass))
        return null;

    module.dependencies?.forEach(d => setDependency(injector, d, module));

    return new pageClass() as ICSRuntimeFormEvents;
}

function setDependency(injector: Injector, dependencyName: string, module: ICSTranspliedModule): void {
    const setter: IAction<unknown> | undefined = module[`set_${dependencyName}`];
    if (!setter)
        return;
    const injectFn = <T>(token: ProviderToken<T>, options?: InjectOptions) => injector.get<T>(token, undefined, options);
    if (dependencyName in jsExtensions)
        return setter((jsExtensions as IGenericRecord)[dependencyName])
    switch (dependencyName) {
        case 'inject':
            return setter(injectFn);
        case 'BehaviorSubject':
            return setter(BehaviorSubject);
        case 'ICSDataService':
            return setter(CODINUS_DATA_SERVICE);
        case 'ICSHttpService':
            return setter(CODINUS_HTTP_SERVICE);
        case 'ICSLocalizer':
            return setter(CODINUS_LOCALIZER);
        case 'IAuthService':
            return setter(CODINUS_AUTH_SERVICE);
        case 'ICSStorageService':
            return setter(CODINUS_STORAGE_SERVICE);
    }
}
