import { booleanAttribute, Directive, ElementRef, inject, input, Input, NgZone, OnDestroy, OnInit, output } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { CSEditorModel } from '../core/editor-model';
import {
    ICodeEditor, IEditorActionDescriptor, IEditorIExtraLibs, IEditorModel, IMonaco,
    ICSMonacoEditor, IStandaloneCodeEditor
} from '../core/monaco-interfaces';
import { DEFAULT_MONACO_EDITOR_CONFIG, CSEditorLanguage, CODINUS_MONACO_LOADER_SERVICE } from '../core/types';

@Directive()
export abstract class CSMonacoEditorDirectiveBase implements OnInit, OnDestroy, ICSMonacoEditor {

    private _loader = inject(CODINUS_MONACO_LOADER_SERVICE);
    private _elementRef = inject(ElementRef);
    private _ngZone = inject(NgZone);
    private _editor: IStandaloneCodeEditor | null = null;
    private _readOnly = false;

    valueChanged = output<string | null>();

    modelName = input<string | undefined>(undefined);
    extraLibs = input<IEditorIExtraLibs | null | undefined>(null);
    language = input<CSEditorLanguage | undefined>('typescript');

    @Input()
    get value(): string | null { return this.csModel.value; }
    set value(value: string | null) {
        this.csModel.value = value;
    }

    @Input({ transform: booleanAttribute })
    get readOnly(): boolean { return this._readOnly; }
    set readOnly(value: boolean) {
        this._readOnly = value;
        this._editor?.updateOptions({ readOnly: value });
    }

    @Input() actions?: IEditorActionDescriptor[] | null;

    protected csModel = new CSEditorModel(this.modelName, this.language, this);

    protected get model(): IEditorModel | null { return this.csModel.currentModel; }
    protected get editor(): IStandaloneCodeEditor | null { return this._editor; }

    ngOnInit(): void {
        const options = { ...DEFAULT_MONACO_EDITOR_CONFIG };
        this._loader.load().then(monaco => {
            this._ngZone.runOutsideAngular(() => {
                this.csModel.init(monaco);
                const model = this.csModel.currentModel;
                const editor = monaco.editor.create(this._elementRef.nativeElement, { model, ...options, ...{ readOnly: this.readOnly } });
                this.setupEditor(monaco, editor);
            });
        });
    }

    protected setupEditor(monaco: IMonaco, editor: IStandaloneCodeEditor) {
        this.csModel.setEditor(editor);
        this._createActions(editor, monaco);
        this._editor = editor;
        this.formatAndFocus();
    }

    _onValueChange(newValue: string | null): void {
        this.valueChanged.emit(newValue);
    }

    formatAndFocus() {
        setTimeout(() => {
            this._editor?.getAction('editor.action.formatDocument')?.run();
            this._editor?.focus();
        }, 500);
    }


    ngOnDestroy(): void {
        this.csModel.dispose();
        this._editor?.dispose();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _createActions(editor: IStandaloneCodeEditor, monaco: IMonaco) {
        if (!this.actions)
            return;
        this.actions.forEach(a => {
            if (a.type == 'custom')
                editor.addAction({ ...{ contextMenuGroupId: '1_modification' }, ...a });
            else {
                const userRun = a.run;
                const run = (ed: ICodeEditor) => new Promise<void>(resolve => {
                    const lineCount = ed.getModel()?.getLineCount() ?? 0;
                    const lastLineLength = ed.getModel()?.getLineMaxColumn(lineCount) ?? 0;
                    const { column, lineNumber } = ed.getPosition() ?? { column: 0, lineNumber: 0 };
                    const args = {
                        column, lineNumber,
                        separator: ed.getValue() ? '\r\n\r\n' : '',
                        range: {
                            startLineNumber: lineCount,
                            startColumn: lastLineLength,
                            endColumn: lineCount,
                            endLineNumber: lastLineLength
                        },
                    };
                    const res = userRun(args);
                    if (typeof res === 'string') {
                        ed.executeEdits('', [{ range: args.range, text: args.separator + res, forceMoveMarkers: true }]);
                        this.formatAndFocus();
                        resolve();
                    } else {
                        const promiseResult = res instanceof Observable ? lastValueFrom(res) : res;
                        promiseResult.then(codePattern => {
                            ed.executeEdits('', [{ range: args.range, text: args.separator + codePattern, forceMoveMarkers: true }]);
                            this.formatAndFocus();
                            resolve();
                        });
                    }
                });
                editor.addAction({ ...{ contextMenuGroupId: '1_modification' }, ...a, run });
            }

        });
    }
}