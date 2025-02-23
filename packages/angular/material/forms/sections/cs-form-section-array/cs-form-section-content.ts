import { Directive, TemplateRef, inject, input } from "@angular/core";
import { Nullable } from "@codinus/types";

@Directive({
    selector: '[csformSectionArrayContent]',
})
export class CSFormSectionArrayContent<T = unknown> {
    templateRef = inject(TemplateRef);
    when = input(undefined, {
        alias: 'csformSectionArrayContent',
        transform: (value: Nullable<(id: Nullable<string>, rowData: T) => boolean> | "") => (typeof value === 'function' ? value : undefined),
    });
    id = input<string>();
}