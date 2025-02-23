import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { Nullable } from '@codinus/types';
import { CSNumericInput } from '@ngx-codinus/material/inputs';
import { CSTableFilterElementBase } from '@ngx-codinus/material/table';
import { ICSTableNumberFilterOptions } from '../shared/element-args-types';
import { NumberFilterPredicates } from './_filter-options';

@Component({
    selector: 'cs-table-filter-number',
    host: { 'class': 'cs-table-filter-number' },
    template: `
        <input matInput inputType="numeric" class="cs-table-filter-inner-input" [mode]="options().mode" 
        [allowArrowKeys]="options().allowArrowKeys" [currency]="options().currency" 
        [step]="options().step" [min]="options().min" [max]="options().max" [locale]="options().locale"
        [thousandSeparator]="options().thousandSeparator" [percentage]="options().percentage" 
        [decimalDigits]="options().decimalDigits" (valueChanged)="onValueChange($event)" />
        `,
    imports: [MatInputModule, CSNumericInput],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class CSTableFilterNumber extends CSTableFilterElementBase<number | bigint, ICSTableNumberFilterOptions> {

    override readonly defaultOperation = 'equals'
    override readonly predicates = NumberFilterPredicates;
    protected override isValueEmpty(value: Nullable<number | bigint>): boolean {
        return value == null;
    }
}