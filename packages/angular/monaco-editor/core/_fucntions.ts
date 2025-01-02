import { IMonaco } from "./monaco-interfaces";
import { ICSEditorTSExLibCollection } from "./types";
export function setMonacoEditorExLib(monaco: IMonaco, lib?: ICSEditorTSExLibCollection) {
    if (!lib || !monaco)
        return;
    Object.entries(lib).forEach(([key, content]) => {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(content, `file:///node_modules/@types/${key}/index.d.ts`);
    });
}