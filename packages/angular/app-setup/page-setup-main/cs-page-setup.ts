import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { preventEvent } from '@codinus/dom';
import { Nullable } from '@codinus/types';
import { CODINUS_DIALOG_SERVICE } from '@ngx-codinus/cdk/overlays';
import { CodinusFormsModule, CSFormGroup } from '@ngx-codinus/core/forms';
import { IAppPageContent, IAppPageInfo } from '@ngx-codinus/data-pages/core';
import { CSFormSection } from '@ngx-codinus/material/forms';
import { CSSelectionListPanel } from '@ngx-codinus/material/selection-list';
import { CSplitterModule } from '@ngx-codinus/material/splitter';
import { CodinusMonacoEditorModule, CSMonacoEditor, ICodeEditor, IEditorActionDescriptor } from '@ngx-codinus/monaco-editor';
import { firstValueFrom, of } from 'rxjs';
import { CSAppPagesSectionsHandler } from '../helper/cs-page-sections-handler';
import { insertPatternWithImports } from '../helper/functions';
import { IAppPageSaveRequest } from '../helper/types';
import { CSPageSetupCodePattern } from '../page-code-pattern/page-code-pattern';
import { CSPageSetupProperties } from '../page-setup-properties/page-setup-properties';
import { PageSetupSections } from '../page-setup-sections/page-setup-sections';
import { AppAdminPagesService } from '../services/app-admin-page.service';

@Component({
    selector: 'cs-page-setup',
    templateUrl: './cs-page-setup.html',
    styleUrl: './cs-page-setup.scss',
    imports: [
        MatToolbarModule, MatButtonModule, MatIconModule, CSplitterModule, CSSelectionListPanel,
        MatFormFieldModule, MatSelectModule, PageSetupSections, CSPageSetupProperties, CSFormSection,
        MatButtonToggleModule, FormsModule, CodinusFormsModule, CodinusMonacoEditorModule],
})

export class CSPageSetup {

    private _pageService = inject(AppAdminPagesService);
    private _dialogService = inject(CODINUS_DIALOG_SERVICE);
    protected _sectionsHandelr = new CSAppPagesSectionsHandler();

    protected _readOnly = signal(false);
    protected _currentPage = signal<Nullable<IAppPageInfo>>(null);
    private _formGroup = signal<CSFormGroup | null>(null);

    private editor = viewChild(CSMonacoEditor);
    private pagesList = viewChild(CSSelectionListPanel);
    private _savedValue: string | null = null;

    /**
     *
     */
    constructor() {
        effect(() => {
            const pageConfig = this.currentPageConfig.value();
            const formGroup = this._formGroup();
            if (formGroup) {
                const { properties, sections, code, styles } = pageConfig ?? {};
                const pageInfo = { properties, sections, pageCode: { code, styles } };
                this._savedValue = JSON.stringify(pageInfo);
                formGroup.reset(pageInfo);
            }
        });

    }

    // protected _filterPredicate = computed(() => {
    //     const currentFileType = this._filterType();
    //     return (d: IAppPageInfo, f: Nullable<string>) =>
    //         (currentFileType == null || d.type === currentFileType) && (f == null || d.pageName.includes(f));
    // });

    // protected _iconMember = (d: IAppPageInfo) => getIocnFromPageInfo(d);
    protected viewMode: 'properties' | 'sections' | 'code' = 'sections';
    protected pages = rxResource({ loader: () => this._pageService.getAllPages() });
    protected _disabled = computed(() => this._readOnly());
    protected _disableSave = computed(() => {
        const fg = this._formGroup();
        if (!fg)
            return true;
        return !this._currentPage() || !this._isValid() || fg._pristine();
    });

    protected _canUndo = computed(() => {
        const fg = this._formGroup();
        if (!fg)
            return false;
        return this._currentPage() && !fg._pristine() && this._savedValue !== null;
    });

    protected _isValid = computed(() => this._formGroup()?.isValid() ?? true);

    protected _onAddingClick(event: Event) {
        preventEvent(event);
        const pageName = 'New Page';
        this.pagesList()?.add({ pageName, local: true });
    }

    protected _currentChanging = (current: Nullable<IAppPageInfo>) => {
        return !this._formGroup()?.dirty && !current?.local;
    }

    protected _onCurrentPageChanged(pageInfo: Nullable<IAppPageInfo>) {
        this._currentPage.set(pageInfo);
    }

    protected _onMainFormInitialized(formGroup: CSFormGroup) {
        this._formGroup.set(formGroup);
    }

    protected _onPageNameChanged(name: string) {
        const page = this._currentPage();
        if (!page)
            return;
        page.originalName = page.pageName;
        page.pageName = name;
        this.pagesList()?.refreshItem(page);
    }

    protected onViewModeChanged(viewMode: typeof this.viewMode) {
        if (viewMode === 'code')
            this.editor()?.formatAndFocus();
    }

    protected undo() {
        const formGroup = this._formGroup();
        const currentPage = this._currentPage();
        if (!currentPage || !formGroup || !this._savedValue)
            return;
        formGroup.reset(JSON.parse(this._savedValue));
        formGroup.markAsUntouched();
        formGroup.markAsPristine();
    }

    protected save() {
        const formGroup = this._formGroup();
        const currentPage = this._currentPage();
        if (!currentPage || !formGroup || !this._isValid())
            return;

        const { properties, sections, pageCode } = formGroup.value;
        const saveRequest = { properties, sections } as IAppPageSaveRequest;

        if (this.editor()?.isDirty('code')) {
            saveRequest.code = pageCode.code;
            saveRequest.transpiledCode = this._pageService.transpilePageCode(pageCode.code);
        }

        if (this.editor()?.isDirty('styles'))
            saveRequest.styles = pageCode.styles;

        saveRequest.overwrite = !currentPage.local;
        this._pageService.savePage(currentPage.pageName, saveRequest).subscribe(() => {
            formGroup.markAsUntouched();
            formGroup.markAsPristine();
            this._savedValue = null;
        });
    }

    protected actions: IEditorActionDescriptor[] = [
        {
            id: 'page-events',
            label: 'Page Events',
            type: 'custom',
            run: async (ed: ICodeEditor) => {
                const dialogResult = this.getFromDialogComponent();
                const codePattern = dialogResult ? await firstValueFrom(dialogResult) : null;
                if (codePattern) {
                    insertPatternWithImports(ed, codePattern);
                }
            }
        },
    ];

    private currentPageConfig = rxResource({
        request: () => this._currentPage(),
        loader: ({ request }) => !request
            ? of(null)
            : request?.local
                ? of({} as IAppPageContent)
                : this._pageService.getPageConfig(request?.pageName)
    });

    private getFromDialogComponent() {
        const fg = this._formGroup();
        if (!fg)
            return;
        const { sections } = fg.value;
        return this._dialogService.open({
            component: CSPageSetupCodePattern,
            data: {
                sections: sections,
                handler: this._sectionsHandelr
            },
            options: {
                width: '80vw',
                height: '80vh',

            }
        });
    }
}
