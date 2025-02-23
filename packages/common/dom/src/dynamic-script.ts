/* eslint-disable @typescript-eslint/no-explicit-any */
export interface HTMLScriptElementScope {
    scriptElement: HTMLScriptElement;
    remove: () => void;
}

export function addScriptSectionToDocument(id: string, code: string): HTMLScriptElementScope | null {
    if (!document?.head)
        return null;
    if (id && document.getElementById(id)) {
        return null;
    }
    let scriptElement: HTMLScriptElement | null = document.createElement('script');
    scriptElement.id = id;
    scriptElement.innerText = code;
    document.head.appendChild(scriptElement);
    return {
        scriptElement, remove: () => {
            if (scriptElement != null) {
                document.head.removeChild(scriptElement);
                scriptElement = null;
            }
        }
    };
}

export function removeScriptSectionFromDocument(id: string): void {
    if (!id || !document.head)
        return;
    const scriptElement = document.getElementById(id);
    if (scriptElement)
        document.head.removeChild(scriptElement);
}

export function getGlobalWindowMember<T>(key: string): T | null {
    const windowObj = window as Record<string, any>;
    if (windowObj[key])
        return windowObj[key] as T;
    return null;
}

export function removeGlobalWindowMember(key: string): void {
    const windowObj = window as Record<string, any>;
    if (windowObj[key])
        delete windowObj[key];
}

export async function loadModuleDynamically<TModule>(moduleCode: string): Promise<TModule>;
export async function loadModuleDynamically<TModule, TResult>(moduleCode: string, fetchFn: (module: TModule) => TResult): Promise<TResult>;
export async function loadModuleDynamically(moduleCode: string, fetchFn?: (module: any) => any) {
    const blob = new Blob([moduleCode], { type: 'application/javascript' });
    const moduleUrl = URL.createObjectURL(blob);
    const module = await import( /* @vite-ignore */moduleUrl);
    // Clean up the Blob URL after use
    URL.revokeObjectURL(moduleUrl);
    if (typeof fetchFn === 'function')
        return fetchFn(module);
    return module;
}