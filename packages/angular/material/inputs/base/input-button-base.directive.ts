import {
    AfterViewChecked, booleanAttribute, computed, Directive, effect, ElementRef, inject, Injector,
    input, OnDestroy, output, OutputRefSubscription, Renderer2, Signal, Type, ViewContainerRef
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MAT_FORM_FIELD } from "@angular/material/form-field";
import { noopFn, Nullable } from "@codinus/types";
import { CODINUS_ELEMENT_STATE_OBSERVER, CSElementStateObserverService } from "@ngx-codinus/core/observer";
import { CompositeComponentWrapper, RUNTIME_MAT_FORM_FIELD } from "@ngx-codinus/core/shared";
import { noop } from "rxjs";
import { DEFAULT_INPUT_BUTTONS_WRAPPER_KEYS, enforceFormFieldSuffix } from "../internal";

@Directive({
    host: {
        'class': 'cs-input-button',
        '[class.cs-input-button-without-mat-field]': '!_hasMatField',
        '[class.cs-input-read-only]': 'readonly()'
    },
})
export abstract class CSInputButtonElementBase<TValue> {
    buttonClick = output<Nullable<TValue>>();
    _hasMatField = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
    readonly = input(false, { transform: booleanAttribute });
    onButtonClick(event: Event, value?: TValue) {
        event.stopPropagation();
        event.preventDefault();
        if (!this.disabled())
            this.buttonClick.emit(value);
    }
}

@Directive()
export abstract class CSInputButtonDirectiveBase<TValue, TElement extends CSInputButtonElementBase<TValue>> implements OnDestroy, AfterViewChecked {

    protected abstract componentType: Type<TElement>;
    protected abstract showButton: Signal<boolean>;
    protected abstract onbuttonClick(e: Nullable<TValue>): void;
    protected setupComponent(): void {/** */ }

    protected elementRef: ElementRef<HTMLInputElement> = inject(ElementRef);
    protected _renderer = inject(Renderer2);

    private _formField = inject(MAT_FORM_FIELD, { optional: true, host: true }) ?? inject(RUNTIME_MAT_FORM_FIELD, { optional: true });
    private _viewContainerRef = inject(ViewContainerRef);
    private _stateObserverService = inject(CODINUS_ELEMENT_STATE_OBSERVER, { optional: true }) ?? inject(CSElementStateObserverService);

    private _stateObserverRef = toSignal(this._stateObserverService.watchState(this.elementRef.nativeElement));

    private _removeElement = noopFn;
    private _matFormFieldFlex: HTMLElement | null = null;
    private _clickSubscription: OutputRefSubscription | null = null;

    protected readonly = computed(() => this._stateObserverRef?.()?.readonly ?? false);
    protected disabled = computed(() => this._stateObserverRef?.()?.disabled ?? false);

    protected noneMatFieldCssClass = 'cs-input-with-button-no-mat-field';
    protected get wrapperKeys(): Array<keyof TElement & string> {
        return DEFAULT_INPUT_BUTTONS_WRAPPER_KEYS;
    }
    protected buttonWrapper = new CompositeComponentWrapper<TElement>(this, inject(Injector), this.wrapperKeys);

    protected _hasMatField = this._formField != null;
    protected buttonContainerClass = '';


    constructor() {
        enforceFormFieldSuffix(this._formField);
        effect(() => {
            if (this.showButton())
                this._createButton();
            else
                this._destoryButton();
        });
    }

    ngOnDestroy(): void {
        this._destoryButton();
    }

    ngAfterViewChecked() {
        if (!this._matFormFieldFlex || !this.buttonWrapper.component)
            return;
        const suffixElement = this._matFormFieldFlex.querySelector('.mat-mdc-form-field-icon-suffix');
        if (suffixElement) {
            //if (this.isLastButton)
            this._renderer.appendChild(suffixElement, this.buttonWrapper.htmlElement);
            // else
            //     this._renderer.insertBefore(suffixElement, this.buttonWrapper.htmlElement, suffixElement.firstChild);
            this._matFormFieldFlex = null;
        }
    }


    private _createButton(): void {
        if (this.buttonWrapper.component)
            return;

        const nextElement = this.elementRef.nativeElement.nextElementSibling;
        const componentRef = this._viewContainerRef.createComponent(this.componentType);
        this.buttonWrapper.attach(componentRef);
        this._clickSubscription = componentRef.instance.buttonClick.subscribe(e => this.onbuttonClick(e));
        this.setupComponent();
        if (this._formField) {
            this._matFormFieldFlex = this._formField._elementRef.nativeElement.querySelector('.mat-mdc-form-field-flex');
            const wrapperElement = this._formField._elementRef.nativeElement.querySelector('.mat-mdc-text-field-wrapper');
            if (wrapperElement)
                this._renderer.addClass(wrapperElement, '--has-suffix-button');
        }
        else {
            const containerElement = this.elementRef.nativeElement.parentElement;
            if (containerElement && containerElement.classList.contains('cs-input-button-container')) {
                if (this.buttonWrapper.htmlElement) {
                    this._renderer.appendChild(containerElement, this.buttonWrapper.htmlElement);

                    this._removeElement = () => {
                        if (this.buttonWrapper.htmlElement)
                            this._renderer.removeChild(containerElement, this.buttonWrapper.htmlElement);
                    }
                }
                return;
            }

            const element = this._renderer.createElement('div');
            this._renderer.addClass(element, 'cs-input-button-container');
            const parentElement = this.elementRef.nativeElement.parentElement;

            if (this.noneMatFieldCssClass)
                this._renderer.addClass(element, this.noneMatFieldCssClass);
            if (this.buttonContainerClass)
                this._renderer.addClass(element, this.buttonContainerClass);
            this._renderer.insertBefore(parentElement, element, this.elementRef.nativeElement);
            this._renderer.appendChild(element, this.elementRef.nativeElement);
            this._removeElement = () => {
                this._renderer.removeChild(parentElement, element);
                this._renderer.insertBefore(parentElement, this.elementRef.nativeElement, nextElement);
            }
            if (this.buttonWrapper.htmlElement)
                this._renderer.appendChild(element, this.buttonWrapper.htmlElement);
        }
    }

    private _destoryButton(): void {
        this._clickSubscription?.unsubscribe();
        this._clickSubscription = null;
        this.buttonWrapper.detach();
        this._matFormFieldFlex = null;
        this._removeElement();
        this._removeElement = noop;
    }
}