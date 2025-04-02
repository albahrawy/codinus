import {
    Component, computed, contentChildren, input, linkedSignal,
    model, output, signal, viewChild, ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { preventEvent } from '@codinus/dom';
import { stringReplaceAll } from '@codinus/js-extensions';
import { IAction, IStringRecord } from '@codinus/types';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { noop } from 'rxjs';
import { IEditorActionDescriptor, IEditorIExtraLibs, IEditorModel, IMonacoUri } from '../core/monaco-interfaces';
import { CODINUS_MONACO_EDITOR_PARENT, CSEditorLanguage } from '../core/types';
import { MonacoEditorDirective } from '../directive/monaco-editor.directive';
import { CSMonacoEditorPage } from './cs-monaco-editor-page';
import { ICSMonacoEditorPage } from './types';

class DefinitionPage implements ICSMonacoEditorPage {
    language: CSEditorLanguage = 'typescript';
    label = '';
    content = '';
    readOnly = true;
    key = '__definition';
    type = 'definition';
    extraLibs?: IEditorIExtraLibs | null = null;
    actions?: IEditorActionDescriptor[] | null = null;
}

@Component({
    selector: 'cs-monaco-editor',
    templateUrl: './monaco-editor.component.html',
    styleUrl: './monaco-editor.scss',
    imports: [MonacoEditorDirective, MatTabsModule, CSTranslatePipe, MatButtonModule, FormsModule, MatIconModule],
    host: {
        'class': 'cs-monaco-editor'
    },
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: CSMonacoEditor, multi: true },
        { provide: CODINUS_MONACO_EDITOR_PARENT, useExisting: CSMonacoEditor }
    ]
})

export class CSMonacoEditor implements ControlValueAccessor {

    protected closeDefinition(event: MouseEvent) {
        preventEvent(event);
        this._definitionIsOpen.set(false);
        this._definitionIsActive.set(false);
    }

    /** @internal */
    _definitionPage = new DefinitionPage();

    private _activePage = linkedSignal(() => this._renderedPages().at(0));
    private dirtyMap = new Map<string, boolean>();
    private _definitionIsOpen = signal(false);

    protected isDisabled = signal(false);
    protected _definitionIsActive = signal(false);

    valueChanged = output<IStringRecord | null>();
    pages = input<ICSMonacoEditorPage[]>([]);
    enableGotoDefinition = input(true);
    value = model<IStringRecord>({});

    protected _valueProxy = new EditorValueProxy(this) as IStringRecord;

    protected _renderedPages = computed(() => {
        const contentPages = this._contentPages().map(p => p.editorPageConfig());
        return [...contentPages, ...this.pages()];
    });

    protected definitionIsOpen = computed(() => this.enableGotoDefinition() && this._definitionIsOpen());
    protected activePage = computed(() => this.definitionIsOpen() && this._definitionIsActive()
        ? this._definitionPage
        : this._activePage())

    private _contentPages = contentChildren(CSMonacoEditorPage);
    private _editor = viewChild(MonacoEditorDirective);

    handleOpener(model: IEditorModel | null, resource: IMonacoUri): boolean {
        if (!model)
            return false;
        this._definitionPage.content = model.getValue();
        this._definitionPage.label = stringReplaceAll(resource.path, ["/node_modules/@types/", "/index", ".d.ts", "/"]);
        this._definitionPage.language = model?.getLanguageId() as CSEditorLanguage;
        this._definitionIsOpen.set(true);
        this._definitionIsActive.set(true);
        return true;
    }

    onPageChanged(page: ICSMonacoEditorPage) {
        this._definitionIsActive.set(false);
        this._activePage.set(page);
    }

    formatAndFocus() {
        this._editor()?.formatAndFocus();
    }

    isDirty(editorKey: string) {
        return this.dirtyMap.get(editorKey) === true;
    }

    protected _onValueChanged(page: ICSMonacoEditorPage) {
        if (page.readOnly || this.isDisabled())
            return;
        this.dirtyMap.set(page.key, true);
        this._onChange(this.value());
        this.valueChanged.emit(this.value());
    }

    protected _onTouchedChanged(page: ICSMonacoEditorPage) {
        if (page.readOnly || this.isDisabled())
            return;
        this._onTouched();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _onChange = (value: unknown) => {/** */ };
    protected _onTouched = noop;


    writeValue(obj: unknown): void {
        this.value.set(obj as IStringRecord || {});
    }

    registerOnChange(fn: IAction<unknown>): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: IAction): void {
        this._onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }
}

class EditorValueProxy {
    constructor(editor: CSMonacoEditor) {
        return new Proxy(editor, {
            get(target, prop) {
                if (prop === '__definition')
                    return target._definitionPage.content;
                return target.value()[prop as string];
            },
            set(target, prop, value) {
                if (prop === '__definition')
                    throw new Error(`${prop as string} is read-only`);
                target.value()[prop as string] = value;
                return true;
            }
        });
    }
}