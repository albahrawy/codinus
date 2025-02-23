import { NgTemplateOutlet } from "@angular/common";
import {
    ChangeDetectionStrategy, Component, computed, effect, forwardRef, inject, INJECTOR,
    Injector, input, OnChanges, Pipe, PipeTransform, TemplateRef, viewChild
} from "@angular/core";
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldAppearance, MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import { arrayToObject } from "@codinus/js-extensions";
import { IStringRecord, Nullable } from "@codinus/types";
import { CODINUS_LOCALIZER_CONFIG, CSTranslatePipe, DEFAULT_LANGUAGE_EN } from "@ngx-codinus/cdk/localization";
import { CODINUS_FORM_SECTION, CODINUS_RUNTIME_CONTROL_CONTAINER, CodinusFormsModule } from "@ngx-codinus/core/forms";
import { CSGridFlexContainer } from "@ngx-codinus/core/layout";
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
    imports: [ReactiveFormsModule, CodinusFormsModule, NgTemplateOutlet, CSGridFlexContainer,
        CSTranslatePipe, MatFormFieldModule, MatInputModule, CSLocalizableKeyPipe],
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
    appearance = input('fill', { transform: (v: MatFormFieldAppearance | 'none') => v ?? 'fill' });
    requiredLanguages = input<Nullable<boolean | "true" | "false" | string[]>>(null, { alias: 'required' });

    private _nonFormFieldTemplate = viewChild('nonFormField', { read: TemplateRef });
    private _formFieldTemplate = viewChild('formField', { read: TemplateRef });

    protected langTemplate = computed(() => this.appearance() === 'none' ? this._nonFormFieldTemplate() : this._formFieldTemplate());

    protected _localizeInjector = this._createInjector(inject(INJECTOR));

    protected formFieldAppearance = computed(() => {
        const appearance = this.appearance();
        return appearance !== 'none' ? appearance : 'fill';
    });

    protected _requiredLangs = computed(() => {
        const reqLangs = this.requiredLanguages();
        return new Set(!reqLangs
            ? []
            : reqLangs === true || reqLangs === 'true'
                ? this._languages.map(l => l.symbol)
                : reqLangs);
    });

    override _setupEffects() {
        effect(() => {
            this._mfc.required = this._requiredLangs().size > 0;
        })
    }

    protected get id() { return this._mfc.id; }

    protected override verifyWriteValue(value: IStringRecord): IStringRecord | null {
        return arrayToObject(this._languages, l => [l.symbol, value[l.symbol] ?? null]);
    }

    private _createInjector(injector: Injector) {
        const providers = [
            { provide: ControlContainer, useValue: this },
            { provide: FormGroupDirective, useValue: this },
        ];
        const parentInjector = Injector.create({ providers, parent: injector });
        return Injector.create({ providers: [], parent: parentInjector });
    }

    //#endregion

    //#region MatFormFieldControl

    onContainerClick(): void {
        if (!this._mfc.focused)
            this._mfc._elementRef.nativeElement.querySelector('input')?.focus();
    }

    //#endregion
}

