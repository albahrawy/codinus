import { MatButtonModule } from '@angular/material/button';
import { CSMaskInput } from './directives/mask.directive';
import { CSNumericInput } from './directives/numeric.directive';
import { CSInputClearButton } from './directives/clear.directive';
import { CSDateInput } from './directives/date.directive';
import { CSDateFormatDirective } from './directives/date-format.directive';
import { CSDateMaskInput } from './directives/date-mask.directive';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CSDateRangeInput } from './date-range-input/date-range-input';
import { CSPasswordReveal } from './directives/password.directive';

export * from './base/mask-base.directive';
export * from './directives/mask.directive';
export * from './directives/numeric.directive';
export * from './directives/clear.directive';
export * from './directives/date.directive';
export * from './directives/date-format.directive';
export * from './directives/date-mask.directive';
export * from './date-range-input/date-range-input';
export * from './directives/password.directive';
export * from './base/types';
export * from './cs-mat-form-field-control';

export const CODINUS_MATERIAL_INPUTS = [
    CSMaskInput, CSInputClearButton, CSNumericInput, CSDateInput, CSDateFormatDirective, CSDateMaskInput, CSDateRangeInput,
    MatButtonModule, MatDatepickerModule, CSPasswordReveal
    //    NovaUploadInput
] as const;