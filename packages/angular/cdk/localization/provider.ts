import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer, Provider } from "@angular/core";
import { CSDefaultLocalizerConfig } from "./localize.config";
import { CSDefaultLocalizer } from "./localizer";
import { CODINUS_LOCALIZER, CODINUS_LOCALIZER_CONFIG, CODINUS_LOCALIZER_CONFIG_PATH } from "./types";

export function provideCodinusLocalizer(configPath?: string, mandatory?: boolean): EnvironmentProviders {
    const providers: (Provider | EnvironmentProviders)[] = [
        { provide: CODINUS_LOCALIZER, useExisting: CSDefaultLocalizer },
        { provide: CODINUS_LOCALIZER_CONFIG, useExisting: CSDefaultLocalizerConfig },
        provideAppInitializer(() => inject(CODINUS_LOCALIZER).init(mandatory))
    ];
    if (configPath)
        providers.push({ provide: CODINUS_LOCALIZER_CONFIG_PATH, multi: true, useValue: configPath });

    return makeEnvironmentProviders(providers);
}