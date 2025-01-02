import { ChangeDetectionStrategy, Component, computed, effect, forwardRef, inject, input, OnChanges, Pipe, PipeTransform } from "@angular/core";
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldAppearance, MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import { arrayToObject } from "@codinus/js-extensions";
import { IStringRecord, Nullable } from "@codinus/types";
import { CODINUS_LOCALIZER_CONFIG, CSTranslatePipe, DEFAULT_LANGUAGE_EN } from "@ngx-codinus/cdk/localization";
import {
    CODINUS_DEFAULT_VALUE_ACCESSORS, CODINUS_FORM_SECTION,
    CODINUS_FORM_VALIDATOR_DIRECTIVES, CODINUS_RUNTIME_CONTROL_CONTAINER, CSFormControlName
} from "@ngx-codinus/core/forms";
import { CODINUS_CDK_FLEX_DIRECTIVES, createFlexPropertyFromColumns } from "@ngx-codinus/core/layout";
import { CSFormSection } from "../cs-form-section";

@Pipe({ name: 'localizableKey' })

export class CSLocalizableKeyPipe implements PipeTransform {
    transform(lang: string, prefix: string | undefined, hasNgControl: boolean): string {
        return !hasNgControl && prefix
            ? `${prefix}_${lang}`
            : lang;
    }
}

@Component({
    selector: 'cs-localizable-input',
    templateUrl: './cs-localizable-input.html',
    styleUrl: './cs-localizable-input.scss',
    imports: [ReactiveFormsModule, CODINUS_CDK_FLEX_DIRECTIVES, CODINUS_DEFAULT_VALUE_ACCESSORS,
        CODINUS_FORM_VALIDATOR_DIRECTIVES, CSTranslatePipe,
        CSFormControlName, MatFormFieldModule, MatInputModule, CSLocalizableKeyPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: ControlContainer, useExisting: forwardRef(() => CSLocalizableInput) },
        { provide: FormGroupDirective, useExisting: forwardRef(() => CSLocalizableInput) },
        { provide: CODINUS_FORM_SECTION, useExisting: forwardRef(() => CSLocalizableInput) },
        { provide: CODINUS_RUNTIME_CONTROL_CONTAINER, useExisting: forwardRef(() => CSLocalizableInput) },
    ]
})
export class CSLocalizableInput extends CSFormSection<IStringRecord> implements OnChanges {

    protected _languages = inject(CODINUS_LOCALIZER_CONFIG, { optional: true })?.languages ?? [DEFAULT_LANGUAGE_EN];

    prefix = input('');
    columns = input<Nullable<string | number>>(null, { alias: 'flex-columns' });
    appearance = input('fill', { transform: (v: MatFormFieldAppearance | 'none') => v ?? 'fill' });
    requiredLanguages = input<Nullable<boolean | string[]>>(null, { alias: 'required' });
    flexBasis = computed(() => createFlexPropertyFromColumns(this.columns()));

    protected _requiredLangs = computed(() => {
        const reqLangs = this.requiredLanguages();
        return new Set(!reqLangs
            ? []
            : reqLangs === true
                ? this._languages.map(l => l.symbol)
                : reqLangs);
    });

    private _effects = [effect(() => {
        this._mfc.required = this._requiredLangs().size > 0;
    })];

    protected get id() { return this._mfc.id; }

    protected override verifyWriteValue(value: IStringRecord): IStringRecord | null {
        return arrayToObject(this._languages, l => [l.symbol, value[l.symbol] ?? null]);
    }

    //#endregion

    //#region MatFormFieldControl

    onContainerClick(): void {
        if (!this._mfc.focused)
            this._elementRef.nativeElement.querySelector('input')?.focus();
    }

    //#endregion
}
