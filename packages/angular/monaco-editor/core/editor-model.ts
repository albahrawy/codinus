import { computed, effect } from "@angular/core";
import { CSEditorLanguage } from "./types";
import {
    IEditorModel, ICSMonacoEditor, ICodeEditor,
    IEditorActionDescriptor, IStandaloneCodeEditor,
    IContextKey
} from "./monaco-interfaces";
import { Nullable } from "@codinus/types";
import { Observable, lastValueFrom } from "rxjs";

export class CSEditorModel {

    private _value = '';
    private _changeEvent?: { dispose(): void; }

    private _modelFilePath = computed(() => {
        const monaco = this._parentEditor._monaco();
        if (!monaco)
            return null;
        const lang = this._parentEditor.language() ?? 'typescript';
        return `file:///model_${lang}_${this._parentEditor.modelName()}.${this.getExtension(lang)}`;

    });

    private _modelFileUri = computed(() => {
        const monaco = this._parentEditor._monaco();
        const modelPath = this._modelFilePath();
        if (!monaco || !modelPath)
            return null;
        return monaco.Uri.parse(modelPath);
    });

    private _contextKey: IContextKey | null = null;


    constructor(private _parentEditor: ICSMonacoEditor) {
        effect(() => {
            this._currentModel();
        });
    }

    get value(): string | null { return !this._value ? null : this._value; }
    set value(value: string | null) {
        this._value = value ?? '';
        this._currentModel()?.setValue(this._value);
       // this._parentEditor.formatAndFocus();
    }

    get currentModel() { return this._currentModel() as unknown as IEditorModel | null; }

    private _currentModel = computed<IEditorModel | null>(() => {
        const editor = this._parentEditor._editor();
        if (!editor)
            return null;
        const editorModel = editor.getModel();
        if (!editorModel || editorModel.uri.path != this._modelFileUri()?.path) {
            const model = this.createModel();
            editor.setModel(model);
            return model;
        }
        return editorModel;
    });

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
        const monaco = this._parentEditor._monaco();
        const modelPathUri = this._modelFileUri();
        if (!monaco || !modelPathUri)
            return null;

        const attachEvent = (model: IEditorModel | null) => {
            if (!model)
                return;
            this._changeEvent = model.onDidChangeContent(() => {
                this._value = model.getValue();
                this._parentEditor._onValueChange(this.value);
            });
        };

        let model = monaco.editor.getModel(modelPathUri);
        this._changeEvent?.dispose();
        if (model) {
            model.setValue(this._value);
            this._parentEditor.formatAndFocus().then(() => attachEvent(model));
        } else {
            model = monaco.editor.createModel(this._value, this._parentEditor.language(), modelPathUri);
            this._createActions(this._parentEditor._editor(), this._parentEditor.actions());
            this._parentEditor.formatAndFocus().then(() => attachEvent(model));
        }

        this._contextKey?.set(this._parentEditor.modelName());

        return model;
    }

    // filterActions(items: { id: string }[]) {
    //     const moduleId = this._parentEditor.modelName();
    //     return items.filter(i => !i.id.endsWith('|csAction') || i.id.split('|').at(-2) === moduleId);
    // }

    private _createActions(editor: Nullable<IStandaloneCodeEditor>, actions: Nullable<IEditorActionDescriptor[]>) {
        if (!actions || !editor)
            return;

        this._contextKey = editor.createContextKey("moduleId", null);
        const moduleId = this._parentEditor.modelName();
        actions.forEach(a => {
            if (!a.precondition) {
                a.precondition = `moduleId == ${moduleId}`;
                // ...{ id: `${a.id}|${moduleId}|csAction` }
            }
            if (a.type == 'custom')
                editor.addAction({ ...{ contextMenuGroupId: '1_modification' }, ...a });
            else {
                const userRun = a.run;
                const run = (ed: ICodeEditor) => new Promise<void>(resolve => {
                   // const lineCount = ed.getModel()?.getLineCount() ?? 0;
                   // const lastLineLength = ed.getModel()?.getLineMaxColumn(lineCount) ?? 0;
                    const { column, lineNumber } = ed.getPosition() ?? { column: 0, lineNumber: 0 };
                    const args = {
                        column, lineNumber,
                        separator: ed.getValue() ? '\r\n\r\n' : '',
                        range: {
                            startLineNumber: lineNumber,
                            startColumn: column,
                            endColumn: column,
                            endLineNumber: lineNumber
                        },
                    };
                    const res = userRun(args);
                    if (typeof res === 'string') {
                        ed.executeEdits(null, [{ range: args.range, text: args.separator + res, forceMoveMarkers: true }]);
                        this._parentEditor.formatAndFocus();
                        resolve();
                    } else {
                        const promiseResult = res instanceof Observable ? lastValueFrom(res) : res;
                        promiseResult.then(codePattern => {
                            if (codePattern)
                                ed.executeEdits(null, [{ range: args.range, text: args.separator + codePattern, forceMoveMarkers: true }]);
                            this._parentEditor.formatAndFocus();
                            resolve();
                        });
                    }
                });
                editor.addAction({ ...{ contextMenuGroupId: '1_modification' }, ...a, run });
            }
        });
    }
}