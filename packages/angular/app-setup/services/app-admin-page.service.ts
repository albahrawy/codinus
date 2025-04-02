import { inject, Injectable } from '@angular/core';
import { CODINUS_HTTP_SERVICE } from '@ngx-codinus/cdk/http';
import { IAppPageSaveRequest } from '../helper/types';
import { transpileTypeScriptToCSScript } from '@codinus/ts-parser';
import { map, Observable } from 'rxjs';
import { IAppPageContent, IAppPageInfo } from '@ngx-codinus/data-pages/core';

const PagesAPIKey = 'pages';
const PagesAdminAPIKey = 'pagesAdmin'

@Injectable({ providedIn: 'root' })
export class AppAdminPagesService {

    private readonly _httpService = inject(CODINUS_HTTP_SERVICE);

    getAllPages(): Observable<IAppPageInfo[] | undefined> {
        return this._httpService.get<string[]>([PagesAPIKey])
            .pipe(map(pageNames => pageNames?.map(p => ({ pageName: p, local: false }))));
    }

    getPageConfig(pageName?: string) {
        return this._httpService.get<IAppPageContent>([PagesAdminAPIKey], [pageName]);
    }

    transpilePageCode(code: string) {
        return transpileTypeScriptToCSScript(code, { ignoreImports: ['codinus-types'] });
    }

    savePage(pageName: string, saveRequest: IAppPageSaveRequest) {
        return this._httpService.post([PagesAdminAPIKey, '', pageName], saveRequest, { errorHandleType: 'string' });
    }
}