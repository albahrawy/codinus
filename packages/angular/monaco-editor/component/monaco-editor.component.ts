import {
    Component, computed, contentChildren, input, linkedSignal,
    model, output, signal, viewChild, ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { IAction, IStringRecord } from '@codinus/types';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { noop } from 'rxjs';
import { MonacoEditorDirective } from '../directive/monaco-editor.directive';
import { CSMonacoEditorPage } from './cs-monaco-editor-page';
import { ICSMonacoEditorPage } from './types';

@Component({
    selector: 'cs-monaco-editor',
    templateUrl: './monaco-editor.component.html',
    styleUrl: './monaco-editor.scss',
    imports: [MonacoEditorDirective, MatTabsModule, CSTranslatePipe, MatButtonModule, FormsModule],
    host: {
        'class': 'cs-monaco-editor'
    },
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: CSMonacoEditor, multi: true }
    ]
})

export class CSMonacoEditor implements ControlValueAccessor {

    protected activePage = linkedSignal(() => this._renderedPages().at(0));
    protected isDisabled = signal(false);
    private dirtyMap = new Map<string, boolean>();

    valueChanged = output<IStringRecord | null>();
    pages = input<ICSMonacoEditorPage[]>([]);
    value = model<IStringRecord>({});

    protected _renderedPages = computed(() => {
        const contentPages = this._contentPages().map(p => p.editorPageConfig());
        return [...contentPages, ...this.pages()];
    });

    private _contentPages = contentChildren(CSMonacoEditorPage);
    private _editor = viewChild(MonacoEditorDirective);

    onPageChanged(page: ICSMonacoEditorPage) {
        this.activePage.set(page);
    }

    formatAndFocus() {
        this._editor()?.formatAndFocus();
    }

    isDirty(editorKey: string) {
        return this.dirtyMap.get(editorKey) === true;
    }

    protected _onValueChanged(editorKey: string) {
        this.dirtyMap.set(editorKey, true);
        this._onChange(this.value());
        this.valueChanged.emit(this.value());
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