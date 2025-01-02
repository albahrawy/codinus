import { Directive, inject, input, TemplateRef } from '@angular/core';

@Directive({
    selector: 'ng-template[name]'
})
export class CSNamedTemplate {
    name = input.required<string>();
    template = inject(TemplateRef, { self: true });
}