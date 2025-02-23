import { booleanAttribute, Directive, ElementRef, inject, input, Input, NgZone, OnDestroy, OnInit, output, signal } from '@angular/core';
import { Nullable } from '@codinus/types';
import { CSEditorModel } from '../core/editor-model';
import {
    ICSMonacoEditor,
    IEditorActionDescriptor, IEditorIExtraLibs, IEditorModel, IMonaco, IStandaloneCodeEditor
} from '../core/monaco-interfaces';
import { CODINUS_MONACO_LOADER_SERVICE, CSEditorLanguage, DEFAULT_MONACO_EDITOR_CONFIG } from '../core/types';

// type ContextMenuFn = { _getMenuActions: (...args: unknown[]) => { id: string }[] } | null;

@Directive()
export abstract class CSMonacoEditorDirectiveBase implements OnInit, OnDestroy {

    private _loader = inject(CODINUS_MONACO_LOADER_SERVICE);
    private _elementRef = inject(ElementRef);
    private _ngZone = inject(NgZone);

    private _monaco = signal<IMonaco | null>(null);
    private _editor = signal<IStandaloneCodeEditor | null>(null);
    private _readOnly = false;

    protected csModel = new CSEditorModel(this as unknown as ICSMonacoEditor);

    valueChanged = output<string | null>();

    modelName = input.required<string>();
    extraLibs = input<IEditorIExtraLibs | null | undefined>(null);
    language = input('typescript', { transform: (v: Nullable<CSEditorLanguage>) => v ?? 'typescript' });

    @Input()
    get value(): string | null { return this.csModel.value; }
    set value(value: string | null) {
        this.csModel.value = value;
    }

    @Input({ transform: booleanAttribute })
    get readOnly(): boolean { return this._readOnly; }
    set readOnly(value: boolean) {
        this._readOnly = value;
        this._editor()?.updateOptions({ readOnly: value });
    }

    actions = input<IEditorActionDescriptor[] | null>();

    protected get model(): IEditorModel | null { return this.csModel.currentModel; }
    protected get editor(): IStandaloneCodeEditor | null { return this._editor(); }

    ngOnInit(): void {
        const options = { ...DEFAULT_MONACO_EDITOR_CONFIG };
        this._loader.load().then(monaco => {
            this._ngZone.runOutsideAngular(() => {
                this._monaco.set(monaco);
                const model = this.csModel.currentModel;
                const editor = monaco.editor.create(this._elementRef.nativeElement, { model, ...options, ...{ readOnly: this.readOnly } });
                this.setupEditor(monaco, editor);
                this._editor.set(editor);
            });
        });
    }

    protected setupEditor(monaco: IMonaco, editor: IStandaloneCodeEditor) {
        // const contextmenu = editor.getContribution('editor.contrib.contextmenu') as unknown as ContextMenuFn;
        // if (contextmenu) {
        //     const origMethod = contextmenu._getMenuActions;
        //     const csModel = this.csModel;
        //     contextmenu._getMenuActions = function (...args: unknown[]) {
        //         const items = origMethod.apply(contextmenu, args);
        //         return csModel.filterActions(items);
        //     }
        // }

        this.formatAndFocus();
    }

    protected _onValueChange(newValue: string | null): void {
        this.valueChanged.emit(newValue);
    }

    formatAndFocus(): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => {
                this._editor()?.getAction('editor.action.formatDocument')?.run();
                this._editor()?.focus();
                resolve();
            }, 500);
        });
    }


    ngOnDestroy(): void {
        this.csModel.dispose();
        this._editor()?.dispose();
    }
}