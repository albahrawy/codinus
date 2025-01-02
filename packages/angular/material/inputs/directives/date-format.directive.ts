import { Directive, ElementRef, effect, inject, input } from "@angular/core";
import { MAT_DATE_FORMATS } from "@angular/material/core";
import { Nullable } from "@codinus/types";
import { addMissingDateComponents } from "../internal";

@Directive({
    selector: `input:[inputType=date][dateFormat][type=text],
               input:[inputType=date][dateFormat]:not([type]),
               input:[matDatepicker][dateFormat],
               input:[matEndDate][dateFormat],input:[matStartDate][dateFormat]`,
    providers: [{ provide: MAT_DATE_FORMATS, useExisting: CSDateFormatDirective }],
})
export class CSDateFormatDirective {

    private _baseDateFormats = inject(MAT_DATE_FORMATS, { skipSelf: true });
    private _elementRef = inject(ElementRef<HTMLInputElement>);

    private readonly _blurEvent = new Event('blur', { bubbles: true, cancelable: false });

    dateFormat = input(null, { transform: (v: Nullable<string>) => addMissingDateComponents(v) });

    constructor() {
        effect(() => {
            this.dateFormat();
            setTimeout(() => this._elementRef.nativeElement.dispatchEvent(this._blurEvent));
        });

    }

    get parse() {
        const format = this.dateFormat();
        if (format)
            return { dateInput: format };
        else
            return this._baseDateFormats?.parse;
    }

    get display() {
        const format = this.dateFormat();
        if (format)
            return { ...this._baseDateFormats?.display || {}, dateInput: format };
        return this._baseDateFormats?.display;
    }
}
