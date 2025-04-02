import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";
import { IEditorOptions as ICSEditorOptions, IEditorActionDescriptor, IEditorModel, IMonaco, IMonacoUri, ShowLightbulbIconMode } from "./monaco-interfaces";

export const CODINUS_MONACO_LOADER_SERVICE = new InjectionToken<ICSMonacoEditorLoader>('codinus_monaco_loader_service');
export const CODINUS_MONACO_EDITOR_PARENT = new InjectionToken<ICSMonacoEditorParent>('codinus_monaco_editor_parent');
export const CODINUS_MONACO_EDITOR_TS_LIB_LOADER = new InjectionToken<ICSEditorTSExLibLoader>('codinus_monaco_editor_ts_lib_loader');

export declare type CSEditorLanguage = 'typescript' | 'json' | 'css' | 'html';
export interface ICSMonacoEditorLoader {
    load(baseUrl?: string): Promise<IMonaco>;
}

export interface ICSMonacoEditorParent {
    handleOpener(model: IEditorModel | null, resource: IMonacoUri): boolean;
}

export const DEFAULT_MONACO_EDITOR_CONFIG: ICSEditorOptions = {
    minimap: { enabled: false },
    lineNumbers: 'off',
    wordWrap: 'on',
    renderLineHighlight: 'none',
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    fixedOverflowWidgets: true,
    overviewRulerLanes: 0,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    suggestOnTriggerCharacters: true,
    // suggest: {
    //     showFunctions: true,
    //     showModules: true
    // },
    quickSuggestions: true, // Enable quick suggestions
    // scrollbar: {
    //     verticalScrollbarSize: 5,
    //     horizontalScrollbarSize: 5
    // },
    theme: "vs-dark",
    // theme: 'csVSCodeDrakTheme',
    padding: {
        top: 10
    },
    lightbulb: {
        enabled: ShowLightbulbIconMode.Off
    }
};

export type ICSEditorTSExLibCollection = Record<string, string>;

export interface ICSEditorTSExLibLoader {
    load(): ICSEditorTSExLibCollection | Observable<ICSEditorTSExLibCollection> | Promise<ICSEditorTSExLibCollection>;
}

export interface ICSEditorActionSet {
    key: string;
    actions: IEditorActionDescriptor[];
}

