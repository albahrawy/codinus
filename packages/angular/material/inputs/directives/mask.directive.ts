import { booleanAttribute, Directive, input } from "@angular/core";
import { Nullable } from "@codinus/types";
import { CSMaskInputBase } from "../base/mask-base.directive";

@Directive({

    selector: `input[mask][type=text]:not([inputType=numeric]):not([inputType=date]),
    input[mask]:not([type]):not([inputType=numeric]):not([inputType=date])`,
    exportAs: 'csMask',
})
export class CSMaskInput extends CSMaskInputBase {
    override mask = input<Nullable<string>>();
    override useUnmaskValue = input(false, { transform: booleanAttribute });
    override clearOnInvalid = input(false, { transform: booleanAttribute });
}