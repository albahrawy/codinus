import {
    computed, Directive, effect, inject, Injector, input, OnDestroy, OnInit,
    Provider, Signal, signal, ViewContainerRef
} from "@angular/core";
import { ControlContainer, FormGroupDirective } from "@angular/forms";
import { MAT_FORM_FIELD, MatFormField } from "@angular/material/form-field";
import { formatStringBy } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { CODINUS_LOCALIZER } from "@ngx-codinus/cdk/localization";
import {
    CODINUS_FORM_SECTION, CODINUS_RUNTIME_CONTROL_CONTAINER,
    CSFormGroupDirective, isFormSection
} from "@ngx-codinus/core/forms";
import {
    RUNTIME_MAT_FORM_FIELD, signalActionFromFunctionOrConfig,
    signalConditionFromFunctionOrConfig, signalFunctionValueOf
} from "@ngx-codinus/core/shared";
import { isCSRuntimeFormArea, isCSRuntimeFormFieldContainer } from "./functions";
import {
    CODINUS_RUNTIME_FORM, CODINUS_RUNTIME_FORM_COMPONENT_FACTORY, CSFormElementRenderState, FormErrorMessages,
    ICSRuntimeFormElement, ICSRuntimeFormFieldBase, ICSRunTimeFormRenderer, IHasRenderState
} from "./cs-element-base/types";

type ConfigWithHint = Signal<ICSRuntimeFormFieldBase & { leftHint?: string; rightHint?: string, type: string; }>;
const DefaultControlErrors = "DefaultControlErrors";

@Directive({
    selector: ':not([hints]):not([errors])[cs-form-portal]',
    exportAs: 'csFormPortal'
})
export class CSFormPortal implements OnDestroy, OnInit {

    private readonly formComponentFactory = inject(CODINUS_RUNTIME_FORM_COMPONENT_FACTORY);
    private readonly _runtimeForm = inject(CODINUS_RUNTIME_FORM);
    private readonly _formField = inject(MatFormField, { optional: true, host: true });
    private readonly _viewContainerRef = inject(ViewContainerRef);

    private readonly _element = signal<Nullable<ICSRuntimeFormElement>>(null);
    private readonly _initialized = signal(false);
    private _attachedType?: string;

    protected csFormControl = computed(() => this._element()?.csFormControl());
    private runTimeFormRenderer = this._runtimeForm.runTimeFormRenderer;
    protected events = this.runTimeFormRenderer.events;
    protected formPrifix = this.runTimeFormRenderer.prefix;

    config = input.required<ICSRuntimeFormFieldBase & { type: string; }>({ alias: 'cs-form-portal' });
    parentFormGroup = input<Nullable<CSFormGroupDirective>>();
    readonly isValid = computed(() => this.csFormControl()?.signalValid() ?? true);
    readonly value = computed(() => this.csFormControl()?.signalValue());

    constructor() {
        effect(() => {
            const _csFormControl = this.csFormControl();
            if (_csFormControl && !_csFormControl.boundConfig)
                _csFormControl.boundConfig = this.config();
        });

        effect(() => {
            if (!this._initialized())
                return;
            this._attachComponent(this.config());
        });
    }

    ngOnInit(): void {
        this._attachComponent(this.config());
        this._initialized.set(true);
    }

    ngOnDestroy(): void {
        this._viewContainerRef.clear();
    }

    private _attachComponent(newConfig: ICSRuntimeFormFieldBase & { type: string; }) {
        if (newConfig.type == this._attachedType)
            return;

        this._attachedType = newConfig.type;
        this._viewContainerRef.clear();
        const component = this.formComponentFactory.getComponent(newConfig);
        if (!component)
            return;

        ElementRenderState.register(newConfig, this._runtimeForm.runTimeFormRenderer);
        const ref = this._viewContainerRef.createComponent(component, { injector: this._createInjector() });
        ref.setInput('config', newConfig);
        ref.setInput('runTimeFormRenderer', this.runTimeFormRenderer);
        this._element.set(ref.instance);
        if (this._formField) {
            const matFormControl = ref.instance.matFormFieldControl();
            if (matFormControl)
                this._formField._control = matFormControl;
        }
    }

    private _createInjector() {
        const parentGroup = this.parentFormGroup();
        const parentFormGroup = parentGroup ?? this._runtimeForm;
        const providers: Provider[] = [
            { provide: ControlContainer, useValue: parentFormGroup },
            { provide: FormGroupDirective, useValue: parentFormGroup },
            { provide: CODINUS_RUNTIME_CONTROL_CONTAINER, useValue: parentFormGroup },
        ];

        if (this._formField) {
            providers.push({ provide: MAT_FORM_FIELD, useValue: this._formField });
            providers.push({ provide: RUNTIME_MAT_FORM_FIELD, useValue: this._formField });
        }

        if (isFormSection(parentGroup))
            providers.push({ provide: CODINUS_FORM_SECTION, useValue: parentGroup });
        return Injector.create({ providers, parent: this.runTimeFormRenderer.injector });
    }
}


@Directive({
    selector: ':not([hints])[cs-form-portal][errors]',
    exportAs: 'csFormPortal'
})
export class CSFormPortalWithErrors extends CSFormPortal implements OnDestroy {

    private localizer = inject(CODINUS_LOCALIZER, { optional: true });

    private readonly errorMessages
        = signalFunctionValueOf<FormErrorMessages | null>(this.events, this.config, "ErrorMessages", this.formPrifix);

    readonly firstError = computed(() => {
        if (this.isValid())
            return;
        const errors = this.csFormControl()?.errors;
        if (!errors)
            return null;

        const errorKey = Object.keys(errors).at(0);
        if (!errorKey || !this.localizer)
            return errorKey;

        this.localizer.currentLang();

        const translatedError = this.localizer.translate(this.errorMessages()?.[errorKey]
            ?? `${DefaultControlErrors}.${errorKey}`, true);
        return formatStringBy(translatedError, errors[errorKey]);
    });

}

@Directive({
    selector: '[cs-form-portal][hints]',
    exportAs: 'csFormPortal'
})
export class CSFormPortalWithHints extends CSFormPortalWithErrors implements OnDestroy {

    readonly rightHint = signalActionFromFunctionOrConfig(this.events, <ConfigWithHint>this.config, "rightHint", this.formPrifix,
        this.value, fn => {
            const control = this.csFormControl()?.control;
            return control ? fn(control) : null;
        });

    readonly leftHint = signalActionFromFunctionOrConfig(this.events, <ConfigWithHint>this.config, "leftHint", this.formPrifix,
        this.value, fn => {
            const control = this.csFormControl()?.control;
            return control ? fn(control) : null;
        });
}


class ElementRenderState implements CSFormElementRenderState {
    constructor(config: ICSRuntimeFormFieldBase & IHasRenderState, renderer: ICSRunTimeFormRenderer) {
        config.renderState = this;
        this.hidden = signalConditionFromFunctionOrConfig(renderer.events, config, 'hidden', renderer.prefix(), renderer.signalValue);
        this.invisible = signalConditionFromFunctionOrConfig(renderer.events, config, 'invisible', renderer.prefix(), renderer.signalValue);
    }

    readonly hidden: Signal<boolean>;
    readonly invisible: Signal<boolean>;

    static register(config: ICSRuntimeFormFieldBase & IHasRenderState, renderer: ICSRunTimeFormRenderer) {
        if (isCSRuntimeFormFieldContainer(config))
            config.children?.forEach(c => ElementRenderState.register(c, renderer));
        else if (isCSRuntimeFormArea(config))
            config.panels?.forEach(p => {
                ElementRenderState.register(p, renderer)
                p.children?.forEach(c => ElementRenderState.register(c, renderer));
            });
    }
}