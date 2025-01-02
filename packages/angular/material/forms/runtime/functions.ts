/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICSRuntimeFormAreaBase, ICSRuntimeFormConfig, ICSRuntimeFormFieldBase, ICSRuntimeFormFieldContainer } from "./cs-element-base/types";

export function isCSRuntimeFormFieldContainer(element: any): element is ICSRuntimeFormFieldContainer {
    return !!element?.children;
}

export function isCSRuntimeFormArea(element: any): element is ICSRuntimeFormAreaBase {
    return !!element?.panels;
}

export function generateFormRenderConfig(config?: ICSRuntimeFormConfig): ICSRuntimeFormAreaBase {
    return isCSRuntimeFormFieldContainer(config)
        ? { panels: [config], type: 'area', name: 'root' }
        : config
            ? { ...config, type: 'area', name: 'root' }
            : { panels: [], type: 'area', name: 'root' };
}

export function getFormFieldChildrenByKey(element: unknown, key: string): ICSRuntimeFormFieldBase[] | undefined {
    if (isCSRuntimeFormArea(element))
        return element.panels.find(p => p.name == key)?.children;
    else if (isCSRuntimeFormFieldContainer(element))
        return element.children;
    return undefined;
}


// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { IRuntimeFormFieldBase, IRuntimeFormAreaBase, IRuntimeFormFieldContainer, IRuntimeFormConfig } from './types';



// export function getFormFieldChildren(element: unknown) {
//     if (isNovaRuntimeFormArea(element))
//         return element.panels;
//     else if (isNovaRuntimeFormFieldContainer(element))
//         return element.children;
//     return undefined;
// }


// export function getFormConfigPanels(config?: IRuntimeFormConfig) {
//     return isNovaRuntimeFormFieldContainer(config)
//         ? [config]
//         : config
//             ? config.panels
//             : [];
// }