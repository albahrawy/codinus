import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CSMatFormFieldControl, CSNumericInput } from "@ngx-codinus/material/inputs";
import { FlexPropertyInputBase } from "./flex-proeprty-base";
import { toNumber } from "@codinus/js-extensions";

@Component({
    selector: 'cs-flex-column-input',
    templateUrl: './flex-column-input.html',
    styleUrl: './flex-proeprty-input.scss',
    hostDirectives: [CSMatFormFieldControl],
    imports: [FormsModule, ReactiveFormsModule, CSNumericInput],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexColumnInput extends FlexPropertyInputBase<number> {

    protected override getInitialValue(): number { return 0; }
    protected override getDefaultValue(): number { return 0; }
    protected override convert(partValue: string | undefined): number { return toNumber(partValue, 0); }
}