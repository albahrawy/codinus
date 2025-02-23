import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CSMatFormFieldControl } from "@ngx-codinus/material/inputs";
import { FlexPropertyInputBase } from "./flex-proeprty-base";

@Component({
    selector: 'cs-flex-property-input',
    templateUrl: './flex-proeprty-input.html',
    styleUrl: './flex-proeprty-input.scss',
    hostDirectives: [CSMatFormFieldControl],
    imports: [ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexPropertyInput extends FlexPropertyInputBase<string> {

    protected override getInitialValue(): string { return 'unset'; }
    protected override getDefaultValue(): string { return ''; }
    protected override convert(partValue: string | undefined): string {
        return partValue === this.getInitialValue() || partValue == null ? this.getDefaultValue() : partValue;
    }
}