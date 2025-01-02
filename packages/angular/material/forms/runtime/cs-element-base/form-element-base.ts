import { computed, Directive, ElementRef, inject, input, viewChild } from "@angular/core";
import { MatFormFieldControl } from "@angular/material/form-field";
import { CODINUS_FORM_SECTION, CSAbstractFormControlName } from "@ngx-codinus/core/forms";
import {
    FunctionReturn, signalFunctionOf, signalFunctionValueOf, signalItemGetter
} from "@ngx-codinus/core/shared";
import {
    ICSRuntimeFormElement, ICSRuntimeFormFieldBase, ICSRunTimeFormRenderer, IHasRenderState
} from "./types";

@Directive({ host: { '[class]': 'cssClass()' } })
export abstract class CSRunTimeFormElementBase<TConfig extends ICSRuntimeFormFieldBase, TValue>
    implements ICSRuntimeFormElement<TConfig, TValue> {

    protected readonly parentSection = inject(CODINUS_FORM_SECTION, { optional: true });
    protected readonly elementRef = inject(ElementRef);
    readonly csFormControl = viewChild(CSAbstractFormControlName);

    readonly config = input.required<TConfig & IHasRenderState>();
    readonly formRenderer = input.required<ICSRunTimeFormRenderer>();
    readonly matFormFieldControl = viewChild(MatFormFieldControl);

    protected readonly templates = computed(() => this.formRenderer().templates());
    protected readonly cssClass = computed(() => [
        this.elementRef.nativeElement.tagName.toLowerCase(),
        `${this.config().name}_element`
    ]);
    protected readonly events = computed(() => this.formRenderer()?.events());
    protected readonly prefix = computed(() => this.formRenderer()?.prefix());

    protected signalFunctionOf<T extends FunctionReturn>(key: string) {
        return signalFunctionOf<T>(this.events, this.config, key, this.prefix);
    }

    protected signalItemGetter<R>(key: keyof TConfig & string) {
        return signalItemGetter<R, TConfig>(this.events, this.config, key, this.prefix);
    }

    protected signalFunctionValueOf<R>(key: string) {
        return signalFunctionValueOf<R | null>(this.events, this.config, key, this.prefix);
    }
}