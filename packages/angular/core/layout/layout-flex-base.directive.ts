import { Directive, input } from "@angular/core";
import { Nullable } from "@codinus/types";

@Directive()
export abstract class LayoutFlexContainerBaseDirective {
    flexLayout = input('row wrap', { alias: 'layout-flex', transform: (v: Nullable<string>) => v ?? 'row wrap' });
    flexAlign = input('start start', { alias: 'layout-flex-align', transform: (v: Nullable<string>) => v ?? 'start start' });
    flexgap = input<Nullable<string>>(null, { alias: 'flex-gap' });
}