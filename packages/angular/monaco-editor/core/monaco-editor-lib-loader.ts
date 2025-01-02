import { HttpClient } from "@angular/common/http";
import { inject, Injectable, InjectionToken } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { ICSEditorTSExLibCollection, ICSEditorTSExLibLoader } from './types';

export const CODINUS_MONACO_TS_LIB_CONFIG_PATH = new InjectionToken<string>('codinus_monaco_ts_lib_config_path');

export interface ITsLibConfig {
    path: string,
    files: string[]
}

@Injectable({ providedIn: 'root' })
export class MonacoEditorTsLibLoader implements ICSEditorTSExLibLoader {
    private http = inject(HttpClient);
    private configPath = inject(CODINUS_MONACO_TS_LIB_CONFIG_PATH, { optional: true }) ?? 'assets/config/ts-lib.json';

    load(): ICSEditorTSExLibCollection | Observable<ICSEditorTSExLibCollection> | Promise<ICSEditorTSExLibCollection> {

        return this.http.get<ITsLibConfig>(this.configPath).pipe(
            switchMap(r =>
                forkJoin(r.files.map(f => this.http.get(`${r.path}/${f}.ts`, { responseType: 'text' })))
                    .pipe(map(finalR => r.files.reduce((pr, cr, i) => {
                        pr[cr] = finalR[i];
                        return pr;
                    }, {} as ICSEditorTSExLibCollection)))
            )
        );
    }
}