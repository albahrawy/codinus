import { Directive, Provider, forwardRef } from "@angular/core";
import {
    CheckboxControlValueAccessor, NG_VALUE_ACCESSOR, RadioControlValueAccessor, RangeValueAccessor,
    SelectControlValueAccessor, SelectMultipleControlValueAccessor, DefaultValueAccessor
} from "@angular/forms";

const CHECKBOX_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CSCheckboxControlValueAccessor),
    multi: true,
};

const RADIO_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CSRadioControlValueAccessor),
    multi: true,
};

const RANGE_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CSRangeValueAccessor),
    multi: true,
};

const SELECT_MULTIPLE_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CSSelectMultipleControlValueAccessor),
    multi: true,
};

const SELECT_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CSSelectControlValueAccessor),
    multi: true,
};

const DEFAULT_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CSDefaultValueAccessor),
    multi: true,
};

@Directive({
    selector: 'input[type=checkbox][csFormControlName]',
    providers: [CHECKBOX_VALUE_ACCESSOR],
})
export class CSCheckboxControlValueAccessor extends CheckboxControlValueAccessor { }

@Directive({
    selector:
        'input[type=radio][csFormControlName]',
    providers: [RADIO_VALUE_ACCESSOR],
})
export class CSRadioControlValueAccessor extends RadioControlValueAccessor { }

@Directive({
    selector: 'input[type=range][csFormControlName]',
    providers: [RANGE_VALUE_ACCESSOR],
})
export class CSRangeValueAccessor extends RangeValueAccessor { }

@Directive({
    selector: 'select[multiple][csFormControlName]',
    providers: [SELECT_MULTIPLE_VALUE_ACCESSOR],
})
export class CSSelectMultipleControlValueAccessor extends SelectMultipleControlValueAccessor { }

@Directive({
    selector: 'select:not([multiple])[csFormControlName]',
    providers: [SELECT_VALUE_ACCESSOR],
})
export class CSSelectControlValueAccessor extends SelectControlValueAccessor { }

@Directive({
    selector: 'input:not([type=checkbox])[csFormControlName],textarea[csFormControlName]',
    providers: [DEFAULT_VALUE_ACCESSOR],
})
export class CSDefaultValueAccessor extends DefaultValueAccessor { }
