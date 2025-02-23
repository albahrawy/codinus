import { NgModule } from '@angular/core';
import { CSMonacoEditorPage } from './component/cs-monaco-editor-page';
import { CSMonacoEditor } from './component/monaco-editor.component';
import { MonacoEditorDirective } from './directive/monaco-editor.directive';

export * from './component/cs-monaco-editor-page';
export * from './component/monaco-editor.component';
export * from './component/types';
export * from './core/monaco-editor-lib-loader';
export * from './core/monaco-interfaces';
export * from './core/provider';
export * from './core/types';
export * from './directive/monaco-editor.directive';
export * from './directive/monaco-editor.directive-base';


const EDITOR_IMPORTS = [CSMonacoEditorPage, CSMonacoEditor, MonacoEditorDirective]

@NgModule({
    imports: EDITOR_IMPORTS,
    exports: EDITOR_IMPORTS,
})
export class CodinusMonacoEditorModule { }