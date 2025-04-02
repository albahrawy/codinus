import {
    computed, Directive, effect, inject, Injector, input, OnDestroy, OnInit,
    Provider, runInInjectionContext, Signal, signal, ViewContainerRef
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
import { FormErrorMessages, ICSRuntimeFormFieldBase, IHasRenderState } from "./cs-element-base/types";
import { isCSRuntimeFormArea, isCSRuntimeFormFieldContainer } from "./functions";
import { CODINUS_RUNTIME_FORM_COMPONENT_FACTORY, CODINUS_RUNTIME_FORM_HANDLER, ICSRuntimeFormElement, ICSRuntimeFormHandler } from "./injection-tokens";

type ConfigWithHint = Signal<ICSRuntimeFormFieldBase & { leftHint?: Nullable<string>; rightHint?: Nullable<string>, type: string; }>;
const DefaultControlErrors = "DefaultControlErrors";

@Directive({
    selector: ':not([hints]):not([errors])[cs-form-portal]',
    exportAs: 'csFormPortal'
})
export class CSFormPortal implements OnDestroy, OnInit {

    private readonly formComponentFactory = inject(CODINUS_RUNTIME_FORM_COMPONENT_FACTORY);
    private readonly _runtimeFormHandler = inject(CODINUS_RUNTIME_FORM_HANDLER);
    private readonly _formField = inject(MatFormField, { optional: true, host: true });
    private readonly _viewContainerRef = inject(ViewContainerRef);

    private readonly _element = signal<Nullable<ICSRuntimeFormElement>>(null);
    private readonly _initialized = signal(false);
    private _attachedType?: string;

    protected csFormControl = computed(() => this._element()?.csFormControl());
    protected events = this._runtimeFormHandler.events;
    protected formPrifix = this._runtimeFormHandler.prefix;

    readonly isValid = computed(() => this.csFormControl()?.signalValid() ?? true);
    readonly value = computed(() => this.csFormControl()?.signalValue());

    config = input.required<ICSRuntimeFormFieldBase & { type: string; }>({ alias: 'cs-form-portal' });
    parentFormGroup = input<Nullable<CSFormGroupDirective>>();

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

        registerElementRenderState(newConfig, this._runtimeFormHandler);
        const ref = this._viewContainerRef.createComponent(component, { injector: this._createInjector() });
        ref.setInput('config', newConfig);
       // ref.setInput('formHandler', this._runtimeFormHandler);
        this._element.set(ref.instance);
        if (this._formField) {
            const matFormControl = ref.instance.matFormFieldControl();
            if (matFormControl)
                this._formField._control = matFormControl;
        }
    }

    private _createInjector() {
        const parentGroup = this.parentFormGroup();
        const parentFormGroup = parentGroup ?? this._runtimeFormHandler.formGroupDirective;
        const providers: Provider[] = [
            { provide: ControlContainer, useValue: parentFormGroup },
            { provide: FormGroupDirective, useValue: parentFormGroup },
            { provide: CODINUS_RUNTIME_FORM_HANDLER, useValue: this._runtimeFormHandler },
            { provide: CODINUS_RUNTIME_CONTROL_CONTAINER, useValue: parentFormGroup },
        ];

        if (this._formField) {
            providers.push({ provide: MAT_FORM_FIELD, useValue: this._formField });
            providers.push({ provide: RUNTIME_MAT_FORM_FIELD, useValue: this._formField });
        }

        if (isFormSection(parentGroup))
            providers.push({ provide: CODINUS_FORM_SECTION, useValue: parentGroup });
        return Injector.create({ providers, parent: this._runtimeFormHandler.injector });
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


function registerElementRenderState(config: ICSRuntimeFormFieldBase & IHasRenderState, handler: ICSRuntimeFormHandler) {
    if (isCSRuntimeFormFieldContainer(config))
        config.children?.forEach(c => registerElementRenderState(c, handler));
    else if (isCSRuntimeFormArea(config))
        config.panels?.forEach(p => registerElementRenderState(p, handler));
    else
        runInInjectionContext(handler.injector, () => {
            config.renderState = {
                hidden: signalConditionFromFunctionOrConfig(handler.events, config, 'hidden', handler.prefix(), handler.signalValue),
                invisible: signalConditionFromFunctionOrConfig(handler.events, config, 'invisible', handler.prefix(), handler.signalValue)
            }
        });
}