import { inject, Injectable, INJECTOR } from '@angular/core';
import { loadModuleDynamically } from '@codinus/dom';
import { ICSTranspliedModule } from '@codinus/ts-parser';
import { CODINUS_HTTP_SERVICE } from '@ngx-codinus/cdk/http';
import { IAppClientPageContent, IAppPageContent, IAppPageInfo } from '@ngx-codinus/data-pages/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { assignRferences } from './functions';
import { ICSRuntimeFormEvents } from '@ngx-codinus/material/forms';

const PagesAPIKey = 'pages';

@Injectable({ providedIn: 'root' })
export class AppPagesService {

    private readonly _httpService = inject(CODINUS_HTTP_SERVICE);
    private readonly _injector = inject(INJECTOR);

    getAllPages(): Observable<IAppPageInfo[] | undefined> {
        return this._httpService.get<string[]>([PagesAPIKey])
            .pipe(map(pageNames => pageNames?.map(p => ({ pageName: p, local: false }))));
    }

    async getPageConfig(pageName?: string): Promise<Partial<IAppClientPageContent>> {
        const page = await firstValueFrom(this._httpService.get<IAppPageContent>([PagesAPIKey], [pageName]));
        if (page?.code) {
            const events = await loadModuleDynamically<ICSTranspliedModule, ICSRuntimeFormEvents | null>(page.code,
                m => assignRferences(m, this._injector, page.properties?.codeClassName));
            return { ...page, events };
        }
        return { ...page };
    }
}