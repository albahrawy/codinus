import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { setMonacoEditorExLib } from './_fucntions';
import { IMonaco } from './monaco-interfaces';
import { ICSMonacoEditorLoader, CODINUS_MONACO_EDITOR_TS_LIB_LOADER } from './types';

@Injectable({providedIn: 'root'})
export class MonacoEditorLoaderService implements ICSMonacoEditorLoader {

    private static loadPromise: Promise<IMonaco> | undefined;
    private exLibLoader = inject(CODINUS_MONACO_EDITOR_TS_LIB_LOADER, { optional: true });


    public get monaco() { return window.monaco; }

    public load(baseUrl?: string): Promise<IMonaco> {

        if (MonacoEditorLoaderService.loadPromise)
            return MonacoEditorLoaderService.loadPromise;

        MonacoEditorLoaderService.loadPromise = new Promise<IMonaco>((resolve, reject) => {
            baseUrl = baseUrl || './assets/monaco/vs';
            const loadEditor = () => {
                if (!window.require?.config)
                    return reject("Failed to load Monaco Editor");

                window.require.config({ baseUrl: '/', paths: { vs: baseUrl } });
                window.require(['vs/editor/editor.main'], () => {
                    const monaco = window.monaco;
                    if (monaco) {
                        this.loadExtraLib(monaco);
                        resolve(monaco);
                    }
                    reject("Failed to load Monaco Editor");
                });
            };

            if (window.require)
                loadEditor();

            const scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.src = `${baseUrl}/loader.js`;
            scriptElement.onload = loadEditor;
            document.body.appendChild(scriptElement);

        });

        return MonacoEditorLoaderService.loadPromise;
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