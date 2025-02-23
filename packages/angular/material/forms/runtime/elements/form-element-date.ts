import { Component } from '@angular/core';
import { DateFilterFn, MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { toDate } from '@codinus/js-extensions';
import { IArglessFunc } from '@codinus/types';
import { CSDateFormatDirective, CSDateInput, CSDateMaskInput } from '@ngx-codinus/material/inputs';
import { CSRunTimeFormValidableElementBase } from '../cs-element-base/form-element-validable-base';
import { ELEMENT_IMPORTS } from './_internal';
import { ICSRuntimeFormFieldDate } from './_types';

@Component({
    selector: 'cs-runtime-form-element-date',
    template: `
            <input matInput [readonly]="config().readOnly" inputType="date" 
            [min]="config().min!" [max]="config().max!" 
            [required]="!!config().required" [allowClear]="config().allowClear" 
            [csFormControlName]="config().dataKey" [defaultValue]="defaultValue()" 
            [asyncValidators]="asyncValidator()" [validators]="validator()"  
            [startView]="config().startView" [dateFormat]="config().dateFormat" 
            [matDatepickerFilter]="dateFilter()!" [dateClass]="dateClass()"/>
    `,
    imports: [...ELEMENT_IMPORTS, CSDateMaskInput, CSDateFormatDirective, CSDateInput],
})

export class CSFormElementDate extends CSRunTimeFormValidableElementBase<ICSRuntimeFormFieldDate, Date> {

    protected dateFilter = this.signalFunctionOf<DateFilterFn<Date | null>>('DateFilter');
    protected dateClass = this.signalFunctionOf<MatCalendarCellClassFunction<Date>>('DateClass');

    private defaultValueFn = this.signalFunctionOf<IArglessFunc<Date | null>>('DateDefaultValue');

    protected override getDefaultValue() {
        const defFn = this.defaultValueFn();
        if (defFn)
            return defFn();

        const config = this.config();
        return config.defaultValue
            ? config.defaultValue === 'Today'
                ? new Date()
                : toDate(config.defaultValue)
            : null;
    }
}