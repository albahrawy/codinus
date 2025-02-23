import {
    AfterViewChecked, Component, ComponentRef, Directive, ElementRef, OnDestroy, Renderer2,
    ViewContainerRef, booleanAttribute, forwardRef, inject, input, output, viewChild
} from "@angular/core";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
    MatCalendarCellClassFunction, MatDatepicker, MatDatepickerInput,
    MatDatepickerModule, MatDatepickerToggle
} from "@angular/material/datepicker";
import { MAT_FORM_FIELD, MatFormField } from "@angular/material/form-field";
import { MAT_INPUT_VALUE_ACCESSOR } from "@angular/material/input";
import { Nullable } from "@codinus/types";
import { CODINUS_ELEMENT_STATE_OBSERVER, CSElementStateObserverService } from "@ngx-codinus/core/observer";
import { RUNTIME_MAT_FORM_FIELD } from "@ngx-codinus/core/shared";
import { CSCalendarView } from "../base/types";
import { enforceFormFieldSuffix } from "../internal";

//TODO: Add MatDatepickerActions
@Component({
    selector: 'cs-datepicker-control',
    host: { 'class': 'cs-datepicker-control' },
    imports: [MatDatepickerModule],
    template: `<mat-datepicker-toggle [for]="picker" [class.cs-datePicker-toggle-read-only]="readonly()"
    [disabled]="disabled()||readonly()||datePickerInput?.popupDisabled()"></mat-datepicker-toggle>
    <mat-datepicker [restoreFocus]="true" #picker [startView]="datePickerInput?.startView()!"
    [dateClass]="datePickerInput?.dateClass()!">
    <!-- <mat-datepicker-actions>
      <button mat-button matDatepickerCancel>Cancel</button>
      <button mat-raised-button matDatepickerApply>Apply</button>
    </mat-datepicker-actions> -->
    </mat-datepicker>`
})
class InternalMatDatePickerComponent<D> implements AfterViewChecked {

    private _renderer = inject(Renderer2);
    private _matFormFieldFlex?: HTMLElement;
    private _toggleHandled = false;

    protected datePickerInput?: CSDateInput<D>;

    toggle = viewChild(MatDatepickerToggle, { read: ElementRef });
    datePicker = viewChild(MatDatepicker<D>);

    readonly = input(false);
    disabled = input(false);

    attach(datePickerInput: CSDateInput<D>, inputElement: HTMLElement, matFormField: MatFormField | null) {
        const dataPicker = this.datePicker();
        const toggle = this.toggle();
        if (dataPicker)
            datePickerInput.matDatepicker = dataPicker;
        if (toggle)
            this.fixToggleLocaltion(toggle.nativeElement, inputElement, matFormField);
        this.datePickerInput = datePickerInput;
    }

    private fixToggleLocaltion(toggleElement: HTMLElement, inputElement: HTMLElement, matFormField: MatFormField | null) {
        if (matFormField) {
            const flexElement = matFormField._elementRef.nativeElement.querySelector('.mat-mdc-form-field-flex');
            this._matFormFieldFlex = flexElement;
        } else {
            const element = this._renderer.createElement('div');
            this._renderer.addClass(element, 'cs-date-picker-no-mat-field');
            this._renderer.addClass(element, 'cs-input-button-container');
            this._renderer.insertBefore(inputElement.parentElement, element, inputElement);
            this._renderer.appendChild(element, inputElement);
            this._renderer.appendChild(element, toggleElement);
            this._renderer.addClass(toggleElement, 'mat-mdc-form-field-icon-suffix');
        }
    }

    ngAfterViewChecked() {
        if (this._toggleHandled || !this._matFormFieldFlex)
            return;
        const suffixElement = this._matFormFieldFlex.querySelector('.mat-mdc-form-field-icon-suffix');
        if (suffixElement) {
            this._renderer.insertBefore(suffixElement, this.toggle()?.nativeElement, suffixElement.firstChild);
            this._toggleHandled = true;
        }
    }
}

@Directive({
    selector: `input:not([matDatepicker]):[type=text][inputType="date"], 
               input:not([matDatepicker]):not([type])[inputType="date"]`,
    exportAs: 'csDateInput',
    host: {
        'class': 'cs-input-button',
        // '(blur)': '_handleBlur($event)'
    },
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CSDateInput), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => CSDateInput), multi: true },
        { provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: CSDateInput },
        { provide: MatDatepickerInput, useExisting: CSDateInput }
    ]
})
export class CSDateInput<D> extends MatDatepickerInput<D> implements OnDestroy {

    private _viewContainerRef = inject(ViewContainerRef);
    private _stateObserverService = inject(CODINUS_ELEMENT_STATE_OBSERVER, { optional: true }) ?? inject(CSElementStateObserverService);
    private formField = inject(MAT_FORM_FIELD, { optional: true, host: true }) ?? inject(RUNTIME_MAT_FORM_FIELD, { optional: true });

    pickerControl: ComponentRef<InternalMatDatePickerComponent<D>>;
    leave = output<FocusEvent>();
    popupDisabled = input(false, { transform: booleanAttribute });
    inputDisabled = input(false, { transform: booleanAttribute });
    startView = input('month', { transform: (v: Nullable<CSCalendarView>) => v ?? 'month' });
    dateClass = input<Nullable<MatCalendarCellClassFunction<Date>>>();

    /**
     *
     */
    constructor() {
        super();
        enforceFormFieldSuffix(this.formField);
        const pickerControl = this._viewContainerRef.createComponent(InternalMatDatePickerComponent<D>);
        pickerControl.instance.attach(this, this._elementRef.nativeElement, this.formField);
        this._stateObserverService.watchState(this._elementRef.nativeElement)
            .pipe(takeUntilDestroyed())
            .subscribe(e => {
                pickerControl.setInput('disabled', e.disabled);
                pickerControl.setInput('readonly', e.readonly);
            });
        this.pickerControl = pickerControl;
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.pickerControl?.destroy();
    }

    open() {
        this._openPopup();
    }

    protected _handleBlur(event: FocusEvent) {
        const toggle = this.pickerControl?.instance.toggle();
        if (toggle && !toggle.nativeElement.contains(event.relatedTarget))
            this.leave.emit(event);
    }
}