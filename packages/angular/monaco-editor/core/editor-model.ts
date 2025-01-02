import { computed, effect, Signal, signal } from "@angular/core";
import { CSEditorLanguage } from "./types";
import { IEditorModel, IMonaco, ICSMonacoEditor, IStandaloneCodeEditor } from "./monaco-interfaces";

export class CSEditorModel {
    private _monaco = signal<IMonaco | null>(null);
    private _editor?: IStandaloneCodeEditor;
    private _currentModel: IEditorModel | null = null;
    private _iniialized = signal(false);
    private _value = '';
    private _changeEvent?: { dispose(): void; }

    private _modelFilePath = computed(() => {
        const monaco = this._monaco();
        if (!monaco)
            return null;
        const lang = this.language() ?? 'typescript';
        return `file:///model_${lang}_${this.modelName() ?? 'shared'}.${this.getExtension(lang)}`;

    });

    private _modelFileUri = computed(() => {
        const monaco = this._monaco();
        const modelPath = this._modelFilePath();
        if (!monaco || !modelPath)
            return null;
        return monaco.Uri.parse(modelPath);
    });


    constructor(
        private modelName: Signal<string | undefined>,
        private language: Signal<CSEditorLanguage | undefined>,
        private _parentEditor: ICSMonacoEditor
    ) {
        effect(() => this._verifyModel());
    }

    get value(): string | null { return !this._value ? null : this._value; }
    set value(value: string | null) {
        this._value = value ?? '';
        if (this._currentModel) {
            this._currentModel.setValue(this._value);
            this._parentEditor.formatAndFocus();
        }
    }

    get currentModel(): IEditorModel | null { return this._currentModel; }

    init(monaco: IMonaco) {
        if (this._iniialized() || !monaco)
            return;
        this._monaco.set(monaco);
        this._currentModel = this.createModel();
        this._iniialized.set(true);
    }

    setEditor(editor: IStandaloneCodeEditor) {
        this._editor = editor;
    }

    dispose() {
        this._changeEvent?.dispose();
    }

    protected getExtension(lang: CSEditorLanguage) {
        switch (lang) {
            case 'typescript':
                return 'ts';
            default:
                return lang;
        }
    }

    private createModel(): IEditorModel | null {
        const monaco = this._monaco();
        const modelPathUri = this._modelFileUri();
        if (!monaco || !modelPathUri)
            return null;

        let model = monaco.editor.getModel(modelPathUri);
        this._changeEvent?.dispose();
        const lang = this.language() ?? 'typescript';

        if (model && model.getLanguageId() === lang) {
            model.setValue(this._value);
            this._parentEditor.formatAndFocus();
        } else {
            model = monaco.editor.createModel(this._value, lang, modelPathUri);
            this._parentEditor.formatAndFocus();
        }

        this._changeEvent = model.onDidChangeContent(() => {
            this._value = model.getValue();
            this._parentEditor._onValueChange(this.value);
        });

        return model;
    }

    private _verifyModel() {
        if (!this._iniialized())
            return;
        const editorModel = this._editor?.getModel();
        if (editorModel && editorModel.uri.path != this._modelFileUri()?.path) {
            this._currentModel = this.createModel();
            this._editor?.setModel(this.currentModel);
        }
    }
}