import { inject, Pipe, PipeTransform, TemplateRef } from '@angular/core';
import { Nullable } from '@codinus/types';
import { CSNamedTemplate } from '@ngx-codinus/core/outlet';
import { CODINUS_RUNTIME_FORM_OPTIONS, DefaultRuntimeFormOptions } from './injection-tokens';


@Pipe({
    name: 'csFormTemplate',
})
export class CSRunTimeFormTemplate implements PipeTransform {
    private _options = inject(CODINUS_RUNTIME_FORM_OPTIONS, { optional: true }) ?? DefaultRuntimeFormOptions;

    transform(templates: readonly CSNamedTemplate[], templeteName?: Nullable<string>, type?: string): TemplateRef<unknown> | null {
        if (!templeteName && type)
            templeteName = this._options.templateMaps?.[type] ?? this._options.templateMaps?.['default'] ?? 'default';

        if (!templeteName)
            return null;
        return templates.find(t => t.name() === templeteName)?.template ?? null;
    }
}