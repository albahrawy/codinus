import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { Nullable } from '@codinus/types';
import { CSDateFormatDirective, CSDateInput, CSDateMaskInput } from '@ngx-codinus/material/inputs';
import { CSTableFilterElementBase } from '@ngx-codinus/material/table';
import { ICSTableDateFilterOptions } from '../shared/element-args-types';
import { DateFilterPredicates } from './_filter-options';

@Component({
    selector: 'cs-table-filter-date',
    host: { 'class': 'cs-table-filter-date' },
    template: `
        <input class="cs-table-filter-inner-input" inputType="date" [min]="options().min!" [max]="options().max!" 
        [dateFormat]="options().dateFormat" [matDatepickerFilter]="options().dateFilter!" matInput
        [dateClass]="options().dateClass" [startView]="options().startView" 
        (dateChange)="onValueChange($event.value)"/>
        `,
    imports: [MatInputModule, CSDateMaskInput, CSDateFormatDirective, CSDateInput],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class CSTableFilterDate extends CSTableFilterElementBase<Date, ICSTableDateFilterOptions> {

    override readonly defaultOperation = 'equals'
    override readonly predicates = DateFilterPredicates;
    protected override isValueEmpty(value: Nullable<Date>): boolean {
        return value == null;
    }
}