import { computed, Directive, inject, input, signal } from "@angular/core";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import { MatDatepickerInput, MatEndDate, MatStartDate } from "@angular/material/datepicker";
import { isDate, numberBetween } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { CSMaskInputBase } from "../base/mask-base.directive";
import { Caret } from "../base/mask-handler";
import { getDateFormatMask } from "../internal";

type DatePart = { start: number; end: number; separator: number; };
@Directive({
    selector: `input:[inputType=date][dateFormat][type=text],
               input:[inputType=date][dateFormat]:not([type]),
               input:[matDatepicker][dateFormat],
               input:[matEndDate][dateFormat],input:[matStartDate][dateFormat]`,
})
export class CSDateMaskInput<D> extends CSMaskInputBase {

    private dateAdapter = inject(DateAdapter<D>, { optional: true });
    private _datePickerInput = inject(MatDatepickerInput<D>, { optional: true });
    private _dateRangeStartInput = inject(MatStartDate<D>, { optional: true });
    private _dateRangeEndInput = inject(MatEndDate<D>, { optional: true });
    private _dateFormats = inject(MAT_DATE_FORMATS, { optional: true });

    private dateFormatInfo = computed(() => getDateFormatMask(this.dateFormat(), this._dateFormats?.display.dateInput));
    private dateParts = computed(() => this.dateFormatInfo()?.parts);

    protected override mask = computed(() => this.dateFormatInfo()?.mask);
    protected override clearOnInvalid = signal(false);
    protected override useUnmaskValue = signal(false);

    dateFormat = input<Nullable<string>>(null);

    protected override maskChanged(): void {
        const _picker = this._datePickerInput ?? this._dateRangeStartInput ?? this._dateRangeEndInput;
        const value = _picker ? _picker.value : this.value;
        setTimeout(() => this.writeValue(value));
    }

    protected override onKeyDown(event: KeyboardEvent, position?: Caret | undefined): void {
        const dateParts = this.dateParts();
        if (!position || position.begin == null || !dateParts)
            return;
        let step = 0;
        switch (event.key) {
            case 'ArrowUp':
                step = 1;
                event.preventDefault();
                break;
            case 'ArrowDown':
                step = -1;
                event.preventDefault();
                break;
        }
        if (step == 0)
            return;
        let stepChanged = this._changeStep(dateParts.day, position.begin, event, step, 31);
        if (!stepChanged)
            stepChanged = this._changeStep(dateParts.month, position.begin, event, step, 12);
        if (!stepChanged)
            stepChanged = this._changeStep(dateParts.year, position.begin, event, step, 9999, 4);
    }

    override writeValue(value: unknown): void {
        if (isDate(value) && this.dateAdapter && this._dateFormats)
            value = this.dateAdapter.format(value, this._dateFormats.display.dateInput);
        super.writeValue(value);
    }

    protected override changeModel(value: unknown, raiseInputEvent: boolean): void {
        if (value && this.dateAdapter && this._dateFormats) {
            const parseFormat = this._dateFormats.parse.dateInput;
            // if (typeof value === 'string')
            //     value = value.replace(new RegExp(this.placeHolderChar(), 'g'), '');
            value = this.dateAdapter.parse(value, parseFormat);
        }
        super.changeModel(value, raiseInputEvent);
    }

    private _changeStep(part: DatePart | undefined, position: number, event: Event, step: number, max: number, partLength = 2) {
        if (!this.buffer)
            return;
        if (part && numberBetween(position, part.start, part.end + part.separator)) {
            const value = this.buffer.slice(part.start, part.end + 1).map(p => p.replace(this.placeHolderChar(), '')).join('');
            let v = +value;
            v += step;
            if (numberBetween(v, 1, max)) {
                const parts = (v + '').padStart(partLength, '0').split('');
                let partIndex = 0;
                for (let i = part.start; i <= part.end && partIndex <= parts.length; i++) {
                    this.buffer[i] = parts[partIndex];
                    partIndex++;
                }
                this.writeBuffer();
                this.caret(part.start, part.end + 1);
                this.update(event);
            }
            return true;
        }
        return false;
    }
}

