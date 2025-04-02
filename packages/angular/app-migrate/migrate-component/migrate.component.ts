import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppAdminPagesService, IAppPageSaveRequest } from '@ngx-codinus/app-setup';
import { ICSDataRequest } from '@ngx-codinus/cdk/data';
import { CSDataAccess } from '@ngx-codinus/data-pages/core';
import { convertPageType, convertSections, sanitizeVariableName } from '../migrate-converters';
import { AppMigrateService } from '../migrate.service';
import { INovaAppPage, NovaAppPage } from '../types';

@Component({
    selector: 'app-migrate-pages',
    templateUrl: './migrate.component.html',
    styleUrl: './migrate.component.scss',
    imports: [MatProgressBarModule, MatListModule, MatButtonModule]
})

export class AppMigratePages {

    private migrateService = inject(AppMigrateService);
    private pageSetup = inject(AppAdminPagesService);

    protected novaPages = rxResource({ loader: () => this.migrateService.readPreviousVersionPages() });
    protected isBusy = signal(false);
    protected selectAllText = signal('Select All');

    protected migrateSelected(list: MatSelectionList) {
        const selected = list.selectedOptions.selected;
        if (selected.length === 0) {
            return;
        }
        this.isBusy.set(true);
        for (const option of selected) {
            this._savePage(option.value);
        }
        this.isBusy.set(false);
    }

    protected selectAll(list: MatSelectionList) {
        if (list.selectedOptions.selected.length === list.options.length) {
            list.deselectAll();
            this.selectAllText.set('Select All');
        } else {
            list.selectAll();
            this.selectAllText.set('Deselect All');
        }
    }


    private convertPage(novaPage: NovaAppPage) {
        // Convert the page
        const page = novaPage.page;
        const csPage = {} as IAppPageSaveRequest;
        // Convert the page properties
        csPage.properties = {
            pageName: page.pageName,
            cssClass: page.cssClass,
            pageType: convertPageType(page.elements),
            dataAccess: page.dataAccess as unknown as CSDataAccess,
            title: page.caption,
            autoSaveLayout: page.autoSaveLayout,
        };

        const code = this._convertPageCode(page);

        csPage.sections = convertSections(page);
        csPage.styles = page.cssStyles;
        csPage.code = code;
        csPage.transpiledCode = this.pageSetup.transpilePageCode(code);
        csPage.overwrite = true;
        return csPage;
    }

    private _convertPageCode(page: INovaAppPage) {

        const loadRequest: ICSDataRequest = page.dataHandler.load ? {
            responseType: page.dataHandler.load.isDataSet ? 'set' : 'table',
            additional: page.dataHandler.load.additional,
            dbContext: page.dataHandler.load.storeType,
            queryName: page.dataHandler.load.queryName,
            args: page.dataHandler.load.args,
            auditInfo: page.dataHandler.load.auditInfo
        } : {};

        const loadArgs = JSON.stringify(loadRequest, null, 2) // Pretty-print with 2 spaces
            .replace(/"([^"]+)":/g, '$1:'); // Remove quotes from object keys

        return `
        
        import { inject } from 'ng-core';
        import { ICSDataService } from 'codinus';
        import { ICSRuntimeFormHandler,ICSRuntimeFormValueChangeArg,ICSRuntimeFormElementAnyField,ICSRuntimeFormButtonBase } from 'codinus-types';
        
        export class ${sanitizeVariableName(page.pageName)}Page {
            private dataService = inject(ICSDataService);
            private formHandler?: ICSRuntimeFormHandler;

            loadData() {
                return this.dataService.get(${loadArgs});
            }

            valueChange(args: ICSRuntimeFormValueChangeArg): void
            {
            }
            
            elementButtonClick(button: ICSRuntimeFormButtonBase, config: ICSRuntimeFormElementAnyField): void
            {
            }
            
            formInitialized(formHandler: ICSRuntimeFormHandler): void
            {
                this.formHandler = formHandler;
            }
        }
        `;
    }

    private _savePage(page: NovaAppPage) {
        try {
            this.pageSetup.savePage(page.page.pageName, this.convertPage(page))
                .subscribe({
                    next: () => {
                        page.converting.set(1);
                        page.message.set('Page converted successfully');
                    },
                    error: (error) => {
                        page.converting.set(2);
                        page.message.set(error ?? 'Failed to save page on server');
                    }
                });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            page.converting.set(2);
            page.message.set(error?.message ?? 'Failed to convert page');
        }
    }
}
