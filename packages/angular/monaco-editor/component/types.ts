import { IStringRecord } from "@codinus/types";
import { IEditorActionDescriptor, IEditorIExtraLibs } from "../core/monaco-interfaces";
import { CSEditorLanguage } from "../core/types";

export interface ICSMonacoEditorPage {
    extraLibs?: IEditorIExtraLibs | null;
    actions?: IEditorActionDescriptor[] | null;
    language?: CSEditorLanguage;
    readOnly?: boolean;
    label: string | IStringRecord;
    key: string;
}