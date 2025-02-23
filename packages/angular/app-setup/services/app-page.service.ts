import { inject, Injectable } from '@angular/core';
import { CODINUS_HTTP_SERVICE } from '@ngx-codinus/cdk/http';
import { IAppPageContent, IAppPageInfo, IAppPageSaveRequest } from '../helper/types';
import { transpileTypeScriptToCSScript } from '@codinus/ts-parser';

const PagesAPIKey = 'pages';
const PagesAdminAPIKey = 'pagesAdmin'

@Injectable({ providedIn: 'root' })
export class AppPagesService {

    private readonly _httpService = inject(CODINUS_HTTP_SERVICE);

    getAllPages() {
        return this._httpService.get<IAppPageInfo[]>([PagesAPIKey]);
    }

    getPageAdminConfig(pageName?: string) {
        return this._httpService.get<IAppPageContent>([PagesAdminAPIKey], [pageName]);
    }

    getPageConfig(pageName?: string) {
        return this._httpService.get<IAppPageContent>([PagesAPIKey], [pageName]);
    }

    transpilePageCode(code: string) {
        return transpileTypeScriptToCSScript(code, 'myTest');
    }

    savePage(pageName: string, saveRequest: IAppPageSaveRequest) {
        return this._httpService.post([PagesAdminAPIKey, '', pageName], saveRequest);
    }
}