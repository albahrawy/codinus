import { provideHttpClient } from "@angular/common/http";
import { EnvironmentProviders, Provider, makeEnvironmentProviders } from "@angular/core";
import { MonacoEditorTsLibLoader, CODINUS_MONACO_TS_LIB_CONFIG_PATH } from "./monaco-editor-lib-loader";
import { CODINUS_MONACO_EDITOR_TS_LIB_LOADER } from "./types";

export function provideMonacoTsLibService(exLibConfigPath?: string): EnvironmentProviders {

    const providers: Provider | EnvironmentProviders[] = [
        { provide: CODINUS_MONACO_EDITOR_TS_LIB_LOADER, useExisting: MonacoEditorTsLibLoader },
        provideHttpClient()
    ];
    if (exLibConfigPath)
        providers.push({ provide: CODINUS_MONACO_TS_LIB_CONFIG_PATH, multi: true, useValue: exLibConfigPath });

    return makeEnvironmentProviders(providers);
} 