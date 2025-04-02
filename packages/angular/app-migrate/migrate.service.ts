import { inject, Injectable } from '@angular/core';
import { CODINUS_DATA_SERVICE } from '@ngx-codinus/cdk/data';
import { delay, map } from 'rxjs';
import { NovaAppPage } from './types';

@Injectable({ providedIn: 'root' })
export class AppMigrateService {

    private dbService = inject(CODINUS_DATA_SERVICE);
    readPreviousVersionPages() {
        return this.dbService
            .get({ dbContext: 'migrate', responseType: 'table', queryName: 'get-auto-pages-definition' })
            .pipe(delay(10), map(res => res?.map(r => new NovaAppPage(r['page_schema_json']))));
    }
}