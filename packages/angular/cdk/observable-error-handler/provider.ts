import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { ObservableErrorHandler } from "./error-handler";
import { CODINUS_OBSERVABLE_ERROR_HANDLER } from "./types";

export function provideCodinusErrorHandler(): EnvironmentProviders {
    return makeEnvironmentProviders([
        { provide: CODINUS_OBSERVABLE_ERROR_HANDLER, useExisting: ObservableErrorHandler }
    ]);
}