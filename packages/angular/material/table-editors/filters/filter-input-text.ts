import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { Nullable } from '@codinus/types';
import { CSTableFilterElementBase } from '@ngx-codinus/material/table';
import { StringFilterPredicates } from './_filter-options';

const StringLocalConverter = (value: string) => value.toLocaleLowerCase();

@Component({
    selector: 'cs-table-filter-text',
    host: { 'class': 'cs-table-filter-text' },
    template: `
        <input #_input matInput class="cs-table-filter-inner-input" (input)="onValueChange(_input.value)" />
        `,
    imports: [MatInputModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class CSTableFilterText extends CSTableFilterElementBase<string> {
    override valueConverterFactory = () => StringLocalConverter;
    override readonly defaultOperation = 'contains'
    override readonly predicates = StringFilterPredicates;

    protected override isValueEmpty(value: Nullable<string>): boolean {
        return !value || value.trim().length === 0;
    }
}