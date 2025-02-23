import { CdkMonitorFocus, FocusOrigin } from '@angular/cdk/a11y';
import {
    AfterContentInit, AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef,
    Input, Renderer2, ViewEncapsulation, booleanAttribute, computed, effect, forwardRef, inject, input, signal, viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
    ReactiveFormsModule, ValidationErrors, Validator
} from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import {
    DateRange, MatCalendarCellClassFunction, MatDateRangeInput, MatDateRangePicker, MatDatepickerModule,
    MatDatepickerToggle, MatEndDate, MatStartDate
} from '@angular/material/datepicker';
import { MAT_FORM_FIELD, MatFormFieldControl } from '@angular/material/form-field';
import { isDate, isObject, isString } from '@codinus/js-extensions';
import { Nullable, noopFn } from '@codinus/types';
import { RUNTIME_MAT_FORM_FIELD } from '@ngx-codinus/core/shared';
import { merge } from 'rxjs';
import { CSCalendarView, CSDateRangeRequired, ICSDateRange } from '../base/types';
import { CSDateFormatDirective } from '../directives/date-format.directive';
import { CSDateMaskInput } from '../directives/date-mask.directive';
import { enforceFormFieldSuffix } from '../internal';

@Component({
    selector: 'cs-date-range-input',
    templateUrl: 'date-range-input.html',
    styleUrls: ['./date-range-input.scss'],
    host: {
        '[class.--focused]': 'focused',
        '[class.datepicker-read-only]': 'readonly()'

    },
    imports: [MatDatepickerModule, CdkMonitorFocus, CSDateMaskInput, CSDateFormatDirective, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: MatFormFieldControl, useExisting: CSDateRangeInput },
        { provide: MatDateRangeInput, useExisting: CSDateRangeInput },
        { provide: NG_VALUE_ACCESSOR, useExisting: CSDateRangeInput, multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => CSDateRangeInput), multi: true },
    ],
})
export class CSDateRangeInput<D> extends MatDateRangeInput<D>
    implements ControlValueAccessor, Validator, AfterContentInit, AfterViewChecked {

    private _onTouched = noopFn;
    private _validatorOnChange = noopFn;
    private _cvaOnChange = noopFn;

    private _isTouched = false;
    readonly startCtrl = new FormControl<D | string | null>(null);
    readonly endCtrl = new FormControl<D | string | null>(null);

    private __dateAdapter = inject(DateAdapter<D>);
    private __elementRef = inject(ElementRef);
    private _dateFormats = inject(MAT_DATE_FORMATS, { optional: true });
    private formField = inject(MAT_FORM_FIELD, { optional: true, host: true }) ?? inject(RUNTIME_MAT_FORM_FIELD, { optional: true });
    private _renderer = inject(Renderer2);

    private _matFormFieldFlex?: HTMLElement;
    private _toggleHandled = false;
    private _rangeRequired = signal<CSDateRangeRequired>(null);
    private __startInput = viewChild.required(MatStartDate);
    private __endInput = viewChild.required(MatEndDate);
    private _toggle = viewChild(MatDatepickerToggle, { read: ElementRef });
    private _datePicker = viewChild.required(MatDateRangePicker);

    protected startReq = computed(() => this._rangeRequired() === true || this._rangeRequired() === 'true' || this._rangeRequired() === 'start');
    protected endReq = computed(() => this._rangeRequired() === true || this._rangeRequired() === 'true' || this._rangeRequired() === 'end');

    /**
     *
     */
    constructor() {
        super();
        enforceFormFieldSuffix(this.formField);
        effect(() => { this.rangePicker = this._datePicker(); });
        effect(() => {
            const toggle = this._toggle();
            if (toggle)
                this.fixToggleLocaltion(toggle.nativeElement);
        });
        merge(this.startCtrl.valueChanges, this.endCtrl.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this._onDateChange());
    }

    startPlaceholder = input('Start', { transform: (v: Nullable<string>) => v ?? 'Start' })
    endPlaceholder = input('End', { transform: (v: Nullable<string>) => v ?? 'End' })
    startField = input('start', { transform: (v: Nullable<string>) => v ?? 'start' })
    endField = input('end', { transform: (v: Nullable<string>) => v ?? 'end' })
    dateFormat = input<Nullable<string>>(null);
    startView = input('month', { transform: (v: Nullable<CSCalendarView>) => v ?? 'month' });
    dateClass = input<Nullable<MatCalendarCellClassFunction<Date>>>();
    readonly = input(false, { transform: booleanAttribute });

    @Input()
    override get required(): boolean { return super.required; }
    override set required(value: CSDateRangeRequired) {
        super.required = !!value;
        this._rangeRequired.set(value);
    }

    @Input()
    override get value(): DateRange<D> | null { return super.value; }
    override set value(value: ICSDateRange<D> | null) { this._setRangeValue(value); }

    override get errorState(): boolean {
        return this._isTouched && (!this.startCtrl.valid || !this.endCtrl.valid);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate(control: AbstractControl): ValidationErrors | null {
        if (this.errorState) {
            const errors: ValidationErrors = {};
            if (!this.startCtrl.valid)
                errors['start'] = this.startCtrl.errors;
            if (!this.endCtrl.valid)
                errors['end'] = this.endCtrl.errors;
            return errors;
        }
        return null;
    }

    override ngAfterContentInit() {
        this._startInput = this.__startInput();
        this._endInput = this.__endInput();
        super.ngAfterContentInit();
    }

    ngAfterViewChecked() {
        if (this._toggleHandled || !this._matFormFieldFlex)
            return;
        const suffixElement = this._matFormFieldFlex.querySelector('.mat-mdc-form-field-icon-suffix');
        if (suffixElement) {
            this._renderer.insertBefore(suffixElement, this._toggle()?.nativeElement, suffixElement.firstChild);
            this._toggleHandled = true;
        }
    }

    _focusChanged(origin: FocusOrigin) {
        const oldFocus = this.focused;
        this.focused = origin !== null;
        if (!this._isTouched && oldFocus && !this.focused) {
            this._isTouched = true;
            this._onTouched();
        }
        setTimeout(() => this.stateChanges.next());
    }

    private _onDateChange() {
        const value = {
            [this.startField()]: this.startCtrl.value,
            [this.endField()]: this.endCtrl.value
        };

        this._cvaOnChange(value);
        this._validatorOnChange();
        this.stateChanges.next();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeValue(obj: any): void {
        if (!obj) {
            this._setRangeValue(null);
            return;
        }

        const value: ICSDateRange<D> = {};
        if (isDate(obj))
            value.start = obj as D;
        else if (isString(obj))
            value.start = obj;
        else if (isObject(obj)) {
            value.start = obj[this.startField()];
            value.end = obj[this.endField()];
        } else if (Array.isArray(obj)) {
            value.start = obj.at(0);
            value.end = obj.at(1);
        }

        if (this.__dateAdapter && this._dateFormats) {
            let _updateModel = false;
            if (isString(value.start)) {
                value.start = this.__dateAdapter.parse(value.start, this._dateFormats.parse.dateInput);
                _updateModel = true;
            }
            if (isString(value.end)) {
                value.end = this.__dateAdapter.parse(value.end, this._dateFormats.parse.dateInput);
                _updateModel = true;
            }

            if (_updateModel) {
                setTimeout(() => this._cvaOnChange(value));
            }
        }

        this._setRangeValue(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerOnChange(fn: any): void {
        this._cvaOnChange = fn;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }

    registerOnValidatorChange?(fn: () => void): void {
        this._validatorOnChange = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        super.disabled = isDisabled;
        if (isDisabled) {
            if (this.startCtrl.disabled != isDisabled)
                this.startCtrl.disable();
            if (this.endCtrl.disabled != isDisabled)
                this.endCtrl.disable();
        }
        else {
            if (this.startCtrl.disabled != isDisabled)
                this.startCtrl.enable();
            if (this.endCtrl.disabled != isDisabled)
                this.endCtrl.enable();
        }
    }

    private _setRangeValue(value: ICSDateRange<D> | null) {
        setTimeout(() => {
            this.startCtrl.setValue(value?.start ?? null, { onlySelf: true, emitEvent: false });
            this.endCtrl.setValue(value?.end ?? null, { onlySelf: true, emitEvent: false });
        });
    }

    private fixToggleLocaltion(toggleElement: HTMLElement) {
        if (this.formField) {
            const flexElement = this.formField._elementRef.nativeElement.querySelector('.mat-mdc-form-field-flex');
            this._matFormFieldFlex = flexElement;
        } else {
            const inputElement = this.__elementRef.nativeElement;
            const element = this._renderer.createElement('div');
            this._renderer.addClass(element, 'date-range-picker-no-mat-field');
            this._renderer.addClass(element, 'cs-input-button-container');
            this._renderer.insertBefore(inputElement.parentElement, element, inputElement);
            this._renderer.appendChild(element, inputElement);
            this._renderer.appendChild(element, toggleElement);
            this._renderer.addClass(toggleElement, 'mat-mdc-form-field-icon-suffix');
        }
    }
}