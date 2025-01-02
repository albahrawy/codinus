import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { CSDateAdapter } from "./date-adapter";
import { MAT_CODINUS_DATE_FORMATS } from "./date-format";

export function provideCodinusDateProvider(): EnvironmentProviders {
    return makeEnvironmentProviders([
        { provide: DateAdapter, useClass: CSDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_CODINUS_DATE_FORMATS }
    ]);
}