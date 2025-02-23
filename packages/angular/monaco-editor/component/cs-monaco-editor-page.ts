import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { IStringRecord } from '@codinus/types';
import { IEditorActionDescriptor, IEditorIExtraLibs } from '../core/monaco-interfaces';
import { CSEditorLanguage } from '../core/types';
import { ICSMonacoEditorPage } from './types';

@Directive({
    selector: 'cs-monaco-editor-page'
})
export class CSMonacoEditorPage {
    key = input.required<string>();
    label = input.required<string | IStringRecord>();
    readOnly = input(false, { transform: booleanAttribute });
    extraLibs = input<IEditorIExtraLibs>();
    actions = input<IEditorActionDescriptor[]>();
    language = input<CSEditorLanguage>();

    editorPageConfig = computed<ICSMonacoEditorPage>(() => ({
        key: this.key(),
        label: this.label(),
        readOnly: this.readOnly(),
        extraLibs: this.extraLibs(),
        actions: this.actions(),
        language: this.language()
    }));
}