import { EnvironmentProviders, Provider, makeEnvironmentProviders } from "@angular/core";
import { CSDataResponseParser } from "./data-response-parser";
import { CSDataService } from "./database.service";
import { CODINUS_DATA_RESPONSE_PARSER, CODINUS_DATA_SERVICE } from "./types";


export function provideCSDataService(): EnvironmentProviders {

    const providers: Provider | EnvironmentProviders[] = [
        { provide: CODINUS_DATA_SERVICE, useExisting: CSDataService },
        { provide: CODINUS_DATA_RESPONSE_PARSER, useExisting: CSDataResponseParser }
    ];
    return makeEnvironmentProviders(providers);
} 