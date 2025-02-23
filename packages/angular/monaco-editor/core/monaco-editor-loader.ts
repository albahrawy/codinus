import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { setMonacoEditorExLib } from './_fucntions';
import { IMonaco } from './monaco-interfaces';
import { ICSMonacoEditorLoader, CODINUS_MONACO_EDITOR_TS_LIB_LOADER } from './types';

@Injectable({ providedIn: 'root' })
export class MonacoEditorLoaderService implements ICSMonacoEditorLoader {

    private static loadPromise: Promise<IMonaco> | undefined;
    private exLibLoader = inject(CODINUS_MONACO_EDITOR_TS_LIB_LOADER, { optional: true });


    public get monaco() { return window.monaco; }

    public load(baseUrl?: string): Promise<IMonaco> {

        if (MonacoEditorLoaderService.loadPromise)
            return MonacoEditorLoaderService.loadPromise;

        MonacoEditorLoaderService.loadPromise = new Promise<IMonaco>((resolve, reject) => {
            const fixedBaseUrl = baseUrl || './assets/monaco/vs';
            const loadEditor = () => {
                if (!window.require?.config)
                    return reject("Failed to load Monaco Editor");
                const documentBaseURI = document.baseURI.endsWith('/') ? document.baseURI : `${document.baseURI}/`;
                const absoluteUrl = new URL(fixedBaseUrl, documentBaseURI).href
                window.require.config({ paths: { vs: absoluteUrl } });
                window.require(['vs/editor/editor.main'], () => {
                    const monaco = window.monaco;
                    if (monaco) {
                        this.loadExtraLib(monaco);
                        this.setDefaultTheme(monaco);
                        resolve(monaco);
                    }
                    reject("Failed to load Monaco Editor");
                });
            };

            if (window.require)
                loadEditor();

            const scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.src = `${fixedBaseUrl}/loader.js`;
            scriptElement.onload = loadEditor;
            document.body.appendChild(scriptElement);

        });

        return MonacoEditorLoaderService.loadPromise;
    }
    setDefaultTheme(monaco: IMonaco) {
        monaco.editor.defineTheme('csVSCodeDrakTheme', {
            base: 'vs-dark', // Keep the base theme as VS Code dark
            inherit: true,
            rules: [
                { token: 'function', foreground: 'FFD700', fontStyle: 'bold' }, // Function names in yellow
                { token: 'identifier', foreground: 'FFD700' }, // Ensure variables don't override
                { token: 'keyword', foreground: '569CD6' }, // Keep keywords blue
                { token: 'type', foreground: '4EC9B0' }, // 
            ],
            colors: {},
        });

        // Apply the theme
        // monaco.editor.setTheme('myCustomVSCodeTheme');
    }

    private loadExtraLib(monaco: IMonaco) {
        if (!this.exLibLoader)
            return;
        const response = this.exLibLoader.load();
        if (response instanceof Observable)
            response.subscribe(d => setMonacoEditorExLib(monaco, d));
        else if (response instanceof Promise)
            response.then(d => setMonacoEditorExLib(monaco, d));
        else
            setMonacoEditorExLib(monaco, response);
    }
}