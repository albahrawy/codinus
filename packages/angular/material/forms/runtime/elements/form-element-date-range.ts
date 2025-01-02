import { Component, computed } from '@angular/core';
import { DateFilterFn, MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { isDate } from '@codinus/js-extensions';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { CSDateRangeInput } from '@ngx-codinus/material/inputs';
import { CSRunTimeFormValidableElementBase } from '../cs-element-base/form-element-validable-base';
import { ELEMENT_IMPORTS } from './_internal';
import { ICSRuntimeFormFieldDateRange } from './_types';

@Component({
    selector: 'cs-runtime-form-element-date-range',
    template: `
        <cs-date-range-input [readonly]="config().readOnly" [min]="config().min!" [max]="config().max!" 
        [startPlaceholder]="(config().startPlaceholder|csTranslate)()" 
        [endPlaceholder]="(config().endPlaceholder|csTranslate)()" 
        [startField]="config().startField" [endField]="config().endField" [required]="config().required" 
        [csFormControlName]="config().dataKey" [defaultValue]="defaultValue()" 
        [asyncValidators]="asyncValidator()" [validators]="validator()"  [startView]="config().startView"          
        [dateFormat]="config().dateFormat" [dateClass]="dateClass()" [dateFilter]="dateFilter()!">
        </cs-date-range-input>
    `,
    imports: [ELEMENT_IMPORTS, CSDateRangeInput, CSTranslatePipe],
})

export class CSFormElementDateRange extends CSRunTimeFormValidableElementBase<ICSRuntimeFormFieldDateRange, Date> {

    dateFilter = this.signalFunctionOf<DateFilterFn<Date | null>>('DateFilter');
    dateClass = this.signalFunctionOf<MatCalendarCellClassFunction<Date>>('DateClass');
    defaultValueFn = this.signalFunctionOf<() => [Date | string | null, Date | string | null]>('DateRangeDefaultValue');

    override defaultValue = computed(() => {
        const defFn = this.defaultValueFn();
        let defValue = defFn ? defFn() : this.config().defaultValue;
        if (typeof defValue === 'string') {
            if (defValue.startsWith('['))
                defValue.replace('[', '').replace(']', '');
            defValue = defValue.split(',');
        }
        if (Array.isArray(defValue))
            return defValue.map(d => d === 'Today'
                ? new Date()
                : typeof d === 'string' || isDate(d)
                    ? d
                    : null
            )
        return null;
    });
}