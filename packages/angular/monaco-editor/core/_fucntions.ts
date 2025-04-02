import { IMonaco } from "./monaco-interfaces";
import { ICSEditorTSExLibCollection } from "./types";
export function setMonacoEditorExLib(monaco: IMonaco, lib?: ICSEditorTSExLibCollection) {
    if (!monaco)
        return;
    if (!lib) {
        setCompilerOptions(monaco, {});
        return;
    }

    const paths: Record<string, string[]> = {};
    const exLibs: { content: string; filePath?: string; }[] = [];
    Object.entries(lib).forEach(([key, content]) => {
        // content = `declare module '${key}' { ${content} }`;
        exLibs.push({ content, filePath: `file:///node_modules/@types/${key}/index.d.ts` });
        paths[key] = [`node_modules/@types/${key}`];
    });
    monaco.languages.typescript.typescriptDefaults.setExtraLibs(exLibs);
    setCompilerOptions(monaco, paths);
}


export function setCompilerOptions(monaco: IMonaco, paths: Record<string, string[]>) {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        allowJs: true,
        allowNonTsExtensions: true,
        noLib: false,
        noEmit: true,
        lib: ['es2020'],
        baseUrl: 'file:///', // Required for path resolution
        paths,
        typeRoots: ['file:///node_modules/@types'] // Where to find types
    });
}