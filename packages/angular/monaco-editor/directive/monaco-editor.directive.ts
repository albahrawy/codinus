import { ChangeDetectorRef, Directive, inject, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MonacoEditorLoaderService } from '../core/monaco-editor-loader';
import { IMonaco, IStandaloneCodeEditor } from '../core/monaco-interfaces';
import { CODINUS_MONACO_LOADER_SERVICE } from '../core/types';
import { CSMonacoEditorDirectiveBase } from './monaco-editor.directive-base';

@Directive({
    selector: '[monacoEditor]',
    exportAs: 'monacoEditor',
    providers: [
        { provide: CODINUS_MONACO_LOADER_SERVICE, useExisting: MonacoEditorLoaderService },
        { provide: NG_VALUE_ACCESSOR, useExisting: MonacoEditorDirective, multi: true }
    ]
})
export class MonacoEditorDirective extends CSMonacoEditorDirectiveBase implements ControlValueAccessor {

    private cdr = inject(ChangeDetectorRef);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _onChange = (value: unknown) => {/** */ };
    private _onTouched = () => {/** */ };

    controlTouched = output();

    protected override setupEditor(monaco: IMonaco, editor: IStandaloneCodeEditor): void {
        super.setupEditor(monaco, editor);
        editor.onDidBlurEditorText(() => {
            this._onTouched();
            this.controlTouched.emit();
        });
    }

    override _onValueChange(newValue: string | null): void {
        this._onChange(newValue);
        super._onValueChange(newValue);
        this.cdr.markForCheck();
    }

    writeValue(obj: unknown): void {
        if (typeof obj === 'string')
            this.value = obj;
        else
            this.value = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.readOnly = isDisabled;
    }
}