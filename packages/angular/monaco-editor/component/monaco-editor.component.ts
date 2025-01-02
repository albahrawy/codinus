import { Component, effect, input, model, output, signal, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { IAction, IStringRecord, Nullable } from '@codinus/types';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { noop } from 'rxjs';
import { MonacoEditorDirective } from '../directive/monaco-editor.directive';
import { ICSMonacoEditorPage } from './types';

@Component({
    selector: 'cs-monaco-editor-multiple',
    templateUrl: './monaco-editor.component.html',
    styleUrl: './monaco-editor-multiple.scss',
    imports: [MonacoEditorDirective, MatTabsModule, CSTranslatePipe, MatButtonModule, FormsModule],
    host: {
        'class': 'cs-monaco-editor-multiple'
    },
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: CSMonacoEditorMultiple, multi: true }
    ]
})

export class CSMonacoEditorMultiple implements ControlValueAccessor {

    protected activePage = signal<Nullable<ICSMonacoEditorPage>>(null);
    protected isDisabled = signal(false);

    valueChanged = output<IStringRecord | null>();
    pages = input<ICSMonacoEditorPage[]>([]);
    value = model<IStringRecord>({});

    constructor() {
        effect(() => {
            this.activePage.set(this.pages().at(0));
        });
    }

    onPageChanged(page: ICSMonacoEditorPage) {
        this.activePage.set(page);
    }

    protected _onValueChanged() {
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