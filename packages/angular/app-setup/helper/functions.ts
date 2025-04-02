import { arrayFromObject, arrayGroupBy, arrayUnique } from "@codinus/js-extensions";
import { IStringRecord, Nullable } from "@codinus/types";
import {
    ICSRuntimeFormAreaBase, ICSRuntimeFormElementAnyField, ICSRuntimeFormFieldDate,
    ICSRuntimeFormFieldLocalizable, ICSRuntimeFormFieldNamelessConfig, ICSRuntimeFormFieldNumber, ICSRuntimeFormFieldSelect,
    ICSRuntimeFormFieldSlideToggle, ICSRuntimeFormFieldText
} from "@ngx-codinus/material/forms";
import { ICodeEditor } from "@ngx-codinus/monaco-editor";
import { ICSEditorCodePatternInfo, ICSEditorImportInfo, ICSRuntimeFormSetupFieldConfig } from "./types";

const flexColumns = '2,1,2,2,2,2';
const flexGap = '5px';
const flexSpan = '1';

type RunTimeConfig<T, K extends (string & keyof T) = never> = Omit<T, 'name' | 'type' | 'dataKey' | 'label' | K> & { dataKey?: Nullable<string> };

export function getTextPropertyConfig(name: string, label: IStringRecord,
    options?: RunTimeConfig<ICSRuntimeFormFieldText>) {
    return createOptions(name, label, 'text', options);
}

export function getIntegerPropertyConfig(name: string, label: IStringRecord,
    options?: RunTimeConfig<ICSRuntimeFormFieldNumber, 'mode'>) {
    return createOptions<ICSRuntimeFormFieldNumber>(name, label, 'number', { ...options, mode: 'integer' });
}

export function getDecimalPropertyConfig(name: string, label: IStringRecord,
    options?: RunTimeConfig<ICSRuntimeFormFieldNumber, 'mode'>) {
    return createOptions<ICSRuntimeFormFieldNumber>(name, label, 'number', { ...options, mode: 'decimal' });
}

export function getDatePropertyConfig(name: string, label: IStringRecord,
    options?: RunTimeConfig<ICSRuntimeFormFieldDate>) {
    return createOptions(name, label, 'date', options);
}

export function getLocalizableTextPropertyConfig(name: string, label: IStringRecord,
    options?: RunTimeConfig<ICSRuntimeFormFieldLocalizable>) {
    options = { ...{ flex: '100', gap: flexGap, columns: flexColumns }, ...options };
    return createOptions<ICSRuntimeFormFieldLocalizable>(name, label, 'localizable-text', options);
}

export function getBooleanPropertyConfig(name: string, label: IStringRecord,
    options?: RunTimeConfig<ICSRuntimeFormFieldSlideToggle>) {
    return createOptions<ICSRuntimeFormFieldSlideToggle>(name, label, 'slide-toggle', options);
}

export function getSelectPropertyConfig(name: string, label: IStringRecord, dataSource: unknown[], defaultValue?: unknown,
    options?: RunTimeConfig<ICSRuntimeFormFieldSelect, 'dataSource' | 'defaultValue'>) {
    const allowClear = defaultValue == null;
    return createOptions<ICSRuntimeFormFieldSelect>(name, label, 'select', { showSearch: false, defaultValue, dataSource, allowClear, ...options });
}

export function getContainerProperties(): ICSRuntimeFormSetupFieldConfig[] {
    return [
        // think about reverse
        getSelectPropertyConfig('align', { en: 'Flex Align' }, ['start', 'end', 'center'], 'start'),
        { type: 'flex-columns', name: 'flexColumns' },
        { type: 'flex-gap', name: 'flexGap' },
    ];
}

export function normalizeSections(config: ICSRuntimeFormAreaBase, showRoot: boolean) {
    if (config.panels?.length > 1 || showRoot)
        return [config];
    else if (config.panels?.length === 1)
        return config.panels[0].children as unknown as ICSRuntimeFormFieldNamelessConfig[];
    else
        return showRoot ? [{ type: 'area', name: 'root' }] as unknown as ICSRuntimeFormFieldNamelessConfig[] : [];
}

function createOptions<T extends ICSRuntimeFormElementAnyField>(name: string,
    label: IStringRecord, type: T["type"], options?: RunTimeConfig<T>) {
    if (!options?.flexSpan) {
        options = { ...options, ...{ flexSpan } } as T;
    }
    return { name, dataKey: name, type, label, ...options };
}

export function insertPatternWithImports(editor: ICodeEditor, patternInfo: ICSEditorCodePatternInfo) {
    const model = editor.getModel();
    if (model == null)
        return;
    const fullText = model.getValue();

    const regexImport = /import\s*{([^}]+)}\s*from\s*['"]([^'"]+)['"]/;
    const regexMethods = /^\s*protected\s+(\w+)\s*\(/gm;

    const matchedMethods = [...fullText.matchAll(regexMethods)].map(match => match[1]);
    matchedMethods.forEach(m => delete patternInfo[m]);

    const codePattern = Object.values(patternInfo).map(p => p.codePattern).join('\r\n\r\n');
    const imports = Object.values(patternInfo).map(p => p.imports).filter(i => !!i).flat();

    const position = editor.getPosition();
    const edits = [
        {
            range: createRange(position?.lineNumber, position?.column, position?.lineNumber, position?.column),
            text: codePattern,
            forceMoveMarkers: true,
        }
    ];

    if (imports?.length) {
        const lines = fullText.split('\n');
        const orignalImports: ICSEditorImportInfo[] = [];
        let lastIndex = 1;
        lines.every((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                lastIndex = index + 1;
                return true;
            } else {
                const match = trimmedLine.match(regexImport);
                if (match) {
                    const path = match[2]; // Get the path
                    lastIndex = index + 1;
                    orignalImports.push(...match[1].split(',').map(type => ({ type: type.trim(), path })));
                    return true;
                }
                return false;
            }
        });
        const allImports = [...imports, ...orignalImports];
        const finalImports = arrayFromObject(
            arrayGroupBy(allImports, v => v.path),
            (key, value) => `import {${arrayUnique(value.map(v => v.type)).join(', ')}} from '${key}';`
        );
        edits.unshift({ // Add the import to the start of edits
            range: createRange(1, 1, 1, 1), // Insert at the top
            text: finalImports.join('\r\n') + '\r\n',
            forceMoveMarkers: true,
        });
        edits.unshift({ // Add the import to the start of edits
            range: createRange(1, 1, lastIndex, 1), // Insert at the top
            text: '',
            forceMoveMarkers: true,
        });
    }

    // Execute all edits at once
    editor.executeEdits(null, edits); // Apply all edits in one operation
    editor.getAction('editor.action.formatDocument')?.run();
    editor.focus();
}

// export function insertPatternWithImportsx(editor: ICodeEditor, patternInfo: ICSEditorCodePatternInfo) {
//     const model = editor.getModel();
//     if (model == null)
//         return;

//     const fullText = model.getValue();
//     const { codePattern, imports } = patternInfo;
//     const position = editor.getPosition();

//     // Insert the code pattern at the current cursor position
//     editor.executeEdits(null, [
//         {
//             range: createRange(position?.lineNumber, position?.column, position?.lineNumber, position?.column),
//             text: codePattern,
//             forceMoveMarkers: true,
//         }
//     ]);

//     // Check and update imports
//     imports?.forEach(({ type, path }) => {
//         const importRegex = new RegExp(`import\\s*{[^}]*${type}[^}]*}\\s*from\\s*['"]${path}['"]`);

//         if (!importRegex.test(fullText)) {
//             // Find the position to insert the import statement (usually at the top)
//             const lines = fullText.split('\n');
//             const importLineIndex = lines.findIndex(line => line.startsWith('import'));

//             if (importLineIndex !== -1) {
//                 // Modify existing import statement
//                 const existingImportLine = lines[importLineIndex];
//                 const updatedImportLine = existingImportLine.replace(
//                     /import\s*{([^}]*)}\s*from\s*['"]${path}['"]/,
//                     (match, p1) => `import { ${p1.trim()}, ${type} } from '${path}'`
//                 );
//                 lines[importLineIndex] = updatedImportLine;
//                 const updatedText = lines.join('\n');

//                 editor.executeEdits(null, [
//                     {
//                         range: createRange(1, 1, lines.length, 1),
//                         text: updatedText,
//                         forceMoveMarkers: true,
//                     }
//                 ]);
//             } else {
//                 // If no imports exist, insert the import at the top
//                 const importStatement = `import { ${type} } from '${path}';\n`;
//                 editor.executeEdits(null, [
//                     {
//                         range: createRange(1, 1, 1, 1), // Insert at the top
//                         text: importStatement + fullText,
//                         forceMoveMarkers: true,
//                     }
//                 ]);
//             }
//         }
//     });
// }

function createRange(startLineNumber: Nullable<number>, startColumn: Nullable<number>, endLineNumber: Nullable<number>, endColumn: Nullable<number>) {
    startLineNumber ??= 0;
    startColumn ??= 0;
    endLineNumber ??= 0;
    endColumn ??= 0;
    return { startLineNumber, startColumn, endLineNumber, endColumn };
}
