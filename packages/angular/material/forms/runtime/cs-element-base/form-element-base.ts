import { computed, Directive, ElementRef, inject, INJECTOR, input, Signal, viewChild } from "@angular/core";
import { MatFormFieldControl } from "@angular/material/form-field";
import { Nullable } from '@codinus/types';
import { CODINUS_FORM_SECTION, CSAbstractFormControlName } from "@ngx-codinus/core/forms";
import {
    FunctionReturn, signalFromFunctionOrConfig,
    signalFunctionOf, signalFunctionValueOf, signalItemGetter
} from "@ngx-codinus/core/shared";
import { CODINUS_RUNTIME_FORM_HANDLER, ICSRuntimeFormElement } from "../injection-tokens";
import { ICSRuntimeFormFieldBase, IHasRenderState } from "./types";

@Directive({ host: { '[class]': 'cssClass()' } })
export abstract class CSRunTimeFormElementHostBase<TConfig extends ICSRuntimeFormFieldBase, TValue>
    implements ICSRuntimeFormElement<TConfig, TValue> {

    protected readonly parentSection = inject(CODINUS_FORM_SECTION, { optional: true });
    protected readonly injector = inject(INJECTOR);
    protected readonly formHandler = inject(CODINUS_RUNTIME_FORM_HANDLER);

    protected readonly elementRef = inject(ElementRef);

    readonly abstract csFormControl: Signal<Nullable<CSAbstractFormControlName>>;

    readonly config = input.required<TConfig & IHasRenderState>();
    //readonly formHandler = input.required<ICSRuntimeFormHandler>();
    readonly matFormFieldControl = viewChild(MatFormFieldControl);

    protected readonly templates = computed(() => this.formHandler.templates());
    protected readonly cssClass = computed(() => [
        this.elementRef.nativeElement.tagName.toLowerCase(),
        `cs-form-${this.config().name}_element`,
        this.config().cssClass || '',
    ]);
    protected readonly events = computed(() => this.formHandler.events());
    protected readonly prefix = computed(() => this.formHandler.prefix());

    protected signalFunctionOf<T extends FunctionReturn>(key: string) {
        return signalFunctionOf<T>(this.events, this.config, key, this.prefix);
    }

    protected signalItemGetter<R>(key: keyof TConfig & string) {
        return signalItemGetter<R, TConfig>(this.events, this.config, key, this.prefix);
    }

    protected signalFromFunctionOrConfig<K extends keyof TConfig & string>(key: K) {
        return signalFromFunctionOrConfig(this.events, this.config, key, this.prefix);
    }

    protected signalFunctionValueOf<R>(key: string) {
        return signalFunctionValueOf<R | null>(this.events, this.config, key, this.prefix);
    }
}

@Directive({ host: { '[class]': 'cssClass()' } })
export abstract class CSRunTimeFormElementBase<TConfig extends ICSRuntimeFormFieldBase, TValue>
    extends CSRunTimeFormElementHostBase<TConfig, TValue> {
    readonly csFormControl = viewChild(CSAbstractFormControlName);
}