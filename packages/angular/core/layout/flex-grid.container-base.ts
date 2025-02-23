import { Directive, input } from "@angular/core";
import { Nullable } from "@codinus/types";

@Directive()
export abstract class GridFlexContainerBase {
    flexAlign = input('start', { alias: 'flex-grid-align', transform: (v: Nullable<'start' | 'end' | 'center'>) => v ?? 'start' });
    flexGap = input<Nullable<string>>(null, { alias: 'flex-grid-gap' });
    flexColumns = input<Nullable<string | number[]>>(null, { alias: 'flex-grid-columns' });
}
