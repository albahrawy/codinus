/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ChangeDetectionStrategy, Component, Directive, Input, ViewEncapsulation, booleanAttribute,
    computed, effect, forwardRef, input, numberAttribute, output
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { toStringValue } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { booleanTrueAttribute } from "@ngx-codinus/core/shared";
import { CSInputButtonDirectiveBase, CSInputButtonElementBase } from "../base/input-button-base.directive";

const INPUTNUMBER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CSNumericInput),
    multi: true
};

@Component({
    selector: 'cd-num-input-buttons',
    imports: [MatButtonModule, MatIconModule],
    host: {
        'class': 'cs-num-input-buttons',
        '[class.vertical-buttons]': 'verticalButton()'

    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
            <button class="cs-input-button-inline" [disabled]="disabled()" 
                (click)="onButtonClick($event,1)" mat-icon-button>
                <mat-icon  class="cs-input-button-icon">arrow_drop_up</mat-icon>
            </button>
            <button class="cs-input-button-inline" [disabled]="disabled()" 
                (click)="onButtonClick($event,-1)" mat-icon-button>
                <mat-icon  class="cs-input-button-icon">arrow_drop_down</mat-icon>
            </button>   
    `
})
class NumbericInputButtonsComponent extends CSInputButtonElementBase<number> {
    verticalButton = input(false, { transform: booleanAttribute });
}

@Directive({
    selector: 'input:not([type=number])[inputType=numeric]',
    exportAs: 'numberInput',
    providers: [INPUTNUMBER_VALUE_ACCESSOR],
    host: {
        '[disabled]': 'disabled()',
        '(input)': '_onInput($event)',
        '(blur)': '_onBlur()',
        '(focus)': '_onFocus()',
        '(keydown)': '_onKeyDown($event)',
        '(keypress)': '_onKeyPress($event)',
        '(paste)': '_onPaste($event)'
    }
})
export class CSNumericInput extends CSInputButtonDirectiveBase<number, NumbericInputButtonsComponent>
    implements ControlValueAccessor {

    private _numberValue?: number | bigint | null;
    private _value: Nullable<number | bigint>;
    protected override get wrapperKeys(): Array<keyof NumbericInputButtonsComponent & string> {
        return [...super.wrapperKeys, 'verticalButton'];
    }
    protected readonly componentType = NumbericInputButtonsComponent;
    protected override buttonContainerClass = 'cs-number-input-buttons-containers';
    //    protected override isLastButton = true;

    readonly valueChanged = output<Nullable<number | bigint>>();

    override showButton = input(false, { alias: 'showButtons', transform: booleanAttribute });
    step = input(1, { transform: (v: Nullable<string | number>) => numberAttribute(v, 1) });
    min = input(null, { transform: numberAttribute });
    max = input(null, { transform: numberAttribute });
    mode = input<'integer' | 'decimal', 'integer' | 'decimal' | undefined>('integer', { transform: v => v ?? 'integer' });
    locale = input<string | undefined>();
    thousandSeparator = input(false, { transform: booleanAttribute });
    allowArrowKeys = input(true, { transform: booleanTrueAttribute });
    percentage = input(false, { transform: booleanAttribute });
    currency = input<Nullable<string>>();
    decimalDigits = input<Nullable<number>>();
    verticalButton = input(false, { transform: booleanAttribute });
    @Input()
    get value(): Nullable<number | bigint> { return this._value; }
    set value(value: Nullable<number | bigint>) {
        if (this._parseValueAndValidate(value, true, false).changed) {
            this._value = value;
            this._updateInput(true);
        }
    }

    constructor() {
        super();
        effect(() => {
            this._formatter();
            this._updateInput(true);
        });
    }

    private _localeInfo = computed(() => {
        const parts = new Intl.NumberFormat(this.locale(), { style: 'percent', minimumFractionDigits: 1 }).formatToParts(-12345.6);
        const numerals = [...new Intl.NumberFormat(this.locale(), { useGrouping: false }).format(9876543210)].reverse();
        return {
            map: new Map(numerals.map((d, i) => [d, i])),
            exp: {
                numeral: new RegExp(`[${numerals.join('')}]`, "g"),
                group: new RegExp(`[${parts.find(d => d.type === "group")?.value}]`, "g"),
                percent: new RegExp(`[${parts.find(d => d.type === "percentSign")?.value}]`),
                decimal: new RegExp(`[${parts.find(d => d.type === "decimal")?.value}]`),
                minus: new RegExp(`[${parts.find(d => d.type === "minusSign")?.value}]`)
            }
        }
    });

    private _parser = computed(() => {
        const localeInfo = this._localeInfo();

        return (value: string) => {
            const currency = this.currency();
            let parsedValue = value.trim()
                .replace(/\s/g, '')
                .replace(localeInfo.exp.group, "")
                .replace(localeInfo.exp.decimal, ".")
                .replace(localeInfo.exp.percent, "")
                .replace(localeInfo.exp.numeral, d => toStringValue(localeInfo.map.get(d)));
            if (currency)
                parsedValue = parsedValue.replace(currency, '')
            let finalValue: number | null = +parsedValue;
            if (isNaN(finalValue))
                finalValue = null;
            if (finalValue && localeInfo.exp.percent.test(value))
                finalValue = finalValue / 100;
            return finalValue;
        };
    });

    private _isDecimalRelated = computed(() => {
        const decimalDigits = this.decimalDigits();
        return this.mode() === 'decimal' && decimalDigits && decimalDigits > 0;
    });

    private _formatter = computed(() => {
        const options: Intl.NumberFormatOptions = {};
        if (this._isDecimalRelated()) {
            options.minimumFractionDigits = this.decimalDigits() ?? 0;
            options.maximumFractionDigits = this.decimalDigits() ?? 0;
        }
        options.useGrouping = this.thousandSeparator();
        if (this.currency()) {
            options.style = 'currency';
            options.currency = this.currency() ?? undefined;
            options.currencyDisplay = 'narrowSymbol';
        } else if (this.percentage())
            options.style = 'percent';

        return new Intl.NumberFormat(this.locale(), options);
    });


    //#region input events

    _onBlur() {
        if (this.readonly())
            return;

        this._updateInput(true);
        this._onTouched();
    }

    _onFocus() {
        if (!this.readonly())
            this._updateInput();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _onInput(event: InputEvent) {
        if (this.readonly())
            return;

        if (this._parseValueAndValidate(this.elementRef.nativeElement.value).invalid)
            this.elementRef.nativeElement.value = `${this._numberValue}`;
    }

    _onKeyDown(event: KeyboardEvent) {
        if (this.readonly() || !event.target || this.allowArrowKeys() === false) {
            return;
        }
        if (event.altKey) {
            event.preventDefault();
        }

        switch (event.code) {
            //up
            case 'ArrowUp':
                this._spin(1);
                event.preventDefault();
                break;

            //down
            case 'ArrowDown':
                this._spin(-1);
                event.preventDefault();
                break;
        }
    }

    _onKeyPress(event: KeyboardEvent) {
        if (this.readonly()) {
            return;
        }

        if (!this._allowDegit(event.code, event.target)
            && !this._allowDecimal(event.key, event.target)
            && !this._allowMinus(event.key, event.target)
            && event.code != 'Enter')
            event.preventDefault();
    }

    _onPaste(event: ClipboardEvent) {
        if (!this.disabled() && !this.readonly()) {
            event.preventDefault();
            if (this._parseValueAndValidate(event.clipboardData?.getData("Text"), false).changed)
                this._updateInput();
        }
    }

    protected onbuttonClick(value: number): void {
        if (!this.readonly())
            this._spin(value, true);
    }

    //#endregion

    //#region tasks

    private _spin(dir: number, format = false) {
        const step = this.step() * dir;
        let newValue = this._numberValue ?? 0;
        if (typeof newValue === 'number')
            newValue += step;
        else
            newValue += BigInt(step);
        if (this._parseValueAndValidate(newValue).changed)
            this._updateInput(format);
    }

    private _updateInput(formatted = false) {
        const displayValue = formatted ? this._format(this._numberValue) : toStringValue(this._numberValue);
        this.elementRef.nativeElement.setAttribute('aria-valuenow', displayValue);
        this.elementRef.nativeElement.value = displayValue || '';
    }

    private _format(value?: number | bigint | null): string {
        if (!this._formatter)
            return toStringValue(value);
        if (value != null) {
            if (this._isDecimalRelated()) {
                const power10 = Math.pow(10, this.decimalDigits() ?? 0);
                if (typeof value !== 'number')
                    value = Number(value);
                value = Math.trunc(value * power10) / power10;
            }

            let currencyReplaced = false;
            return this._formatter().formatToParts(value)
                .map((item, idx, arr) => {
                    if ((item.type === "currency" || item.type === "literal") && currencyReplaced) return "";
                    const nextCurrency = arr[idx + 1] && arr[idx + 1].type === "currency" && arr[idx + 1].value;
                    if (item.type === "minusSign" && nextCurrency && !currencyReplaced) {
                        currencyReplaced = true;
                        return `${nextCurrency} ${item.value}`;
                    }
                    return `${item.value}`;
                })
                .join("");
        }

        return "";
    }

    private _parseValueAndValidate(value: number | bigint | null | string | undefined, applyForNull = true, raiseOnChange = true)
        : { changed: boolean, invalid: boolean } {
        const result = { changed: false, invalid: false };
        if (value === "")
            value = null;
        let _value =
            (value == null || typeof value === 'number' || typeof value === 'bigint')
                ? value
                : this._parser()(typeof value === 'string' ? value : toStringValue(value));

        if (_value != null) {
            const min = this.min();
            const max = this.max();
            if (min != null && _value < min) {
                result.invalid = true;
                _value = min;
            }

            if (max != null && _value > max) {
                result.invalid = true;
                _value = max;
            }
        }
        const _lastNumberValue = this._numberValue;
        if (_value != null || applyForNull)
            this._numberValue = _value;

        if (_lastNumberValue != this._numberValue) {
            if (raiseOnChange) {
                this._onChange(this._numberValue);
                this.valueChanged.emit(this._numberValue);
            }
            this._value = this._numberValue;
            result.changed = true;
        }
        return result;
    }

    //#endregion

    //#region char Regex Test

    //#endregion

    private _testChar(key: 'minus' | 'decimal', value: string) {
        const exp = this._localeInfo().exp[key];
        if (!exp.test(value))
            return false;

        exp.lastIndex = 0;
        return true;
    }

    private _allowDecimal(key: string, target: EventTarget | null): boolean {
        if (!this._isDecimalRelated())
            return false;
        const input = target as HTMLInputElement;
        if (this._testChar('decimal', key)) {
            const decimalIndex = (input.value.search(this._localeInfo().exp.decimal)) ?? -1;
            if (((input.selectionStart ?? 0) <= decimalIndex && (input.selectionEnd ?? 0) >= decimalIndex) ||
                (decimalIndex == -1 && input.value.length - (input.selectionEnd ?? 0) <= (this.decimalDigits() ?? 0))) {
                return true;
            }
        }
        return false;
    }

    private _allowDegit(code: string, target: EventTarget | null): boolean {
        if (!code.startsWith("Digit"))
            return false;
        if (this._isDecimalRelated()) {
            const input = target as HTMLInputElement;
            const decimalIndex = (input.value.search(this._localeInfo().exp.decimal)) ?? -1;
            if (decimalIndex != -1 && input.selectionStart && input.selectionEnd && input.selectionStart > decimalIndex) {
                return input.value.length - decimalIndex <= (this.decimalDigits() ?? 0);
            }
        }

        return true;
    }

    private _allowMinus(key: string, target: EventTarget | null): boolean {
        const min = this.min();
        if (min != null && min >= 0)
            return false;
        const input = target as HTMLInputElement;
        if (this._testChar('minus', key)) {
            if ((input.selectionStart == 0 && !this._testChar('minus', input.value)) ||
                (input.selectionStart == 0 && input.selectionEnd && input.selectionEnd > 0))
                return true;
        }
        return false;

    }


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _onChange = (value: unknown) => {/** */ };
    private _onTouched = () => {/** */ };

    writeValue(obj: any): void {
        this.value = obj;
    }
    registerOnChange(fn: any): void {
        this._onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }
    // setDisabledState?(isDisabled: boolean): void {
    //     this.disabled = isDisabled;
    // }
}
