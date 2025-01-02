import { inject, Pipe, PipeTransform, TemplateRef } from '@angular/core';
import { Nullable } from '@codinus/types';
import { CODINUS_RUNTIME_FORM_OPTIONS, DEFAULT_RUNTIME_FORM_OPTIONS } from './elements/_types';
import { ICSRuntimeFormTemplate } from './cs-element-base/types';

@Pipe({
    name: 'csFormTemplate',
})

export class CSRunTimeFormTemplate implements PipeTransform {
    private _options = inject(CODINUS_RUNTIME_FORM_OPTIONS, { optional: true }) ?? DEFAULT_RUNTIME_FORM_OPTIONS;


    transform(templates: readonly ICSRuntimeFormTemplate[], templeteName?: Nullable<string>, type?: string): TemplateRef<unknown> | null {
        if (!templeteName && type)
            templeteName = this._options.templateMaps?.[type] ?? this._options.templateMaps?.['default'] ?? 'default';

        if (!templeteName)
            return null;
        return templates.find(t => t.name() === templeteName)?.template ?? null;
    }
}