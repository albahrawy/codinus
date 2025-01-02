import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { IStringRecord } from "@codinus/types";
import { Observable, catchError, map, of, throwError } from "rxjs";
import { CODINUS_LOCALIZER_CONFIG_PATH, ILanguage, ILocalizeConfig } from "./types";

@Injectable({ providedIn: 'root' })
export class CSDefaultLocalizerConfig implements ILocalizeConfig {

    private configPath = inject(CODINUS_LOCALIZER_CONFIG_PATH, { optional: true });
    private _http = inject(HttpClient);

    appTitle?: string | IStringRecord;
    languages?: ILanguage[];
    defaultLang?: string;
    localizeSource?: {
        type?: 'local' | 'api',
        path?: string | string[]
    };

    getDefaultLang(): ILanguage | undefined {
        return this.languages?.find(l => l.symbol == this.defaultLang);
    }

    init(mandatory = true): Observable<ILocalizeConfig> {
        const cachDate = new Date().valueOf();
        const configPath = this.configPath || `assets/config/localize.json?x=${cachDate}`;
        return this._http.get<ILocalizeConfig>(configPath).pipe(
            map(config => Object.assign(this, config)),
            catchError(error => {
                if (mandatory)
                    return throwError(() => error);
                else
                    return of(this);
            })
        );
    }
}