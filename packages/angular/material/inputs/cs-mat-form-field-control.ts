import { _IdGenerator } from '@angular/cdk/a11y';
import { booleanAttribute, Directive, DoCheck, effect, ElementRef, inject, input, Input, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroupDirective, NgControl, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { noopFn } from '@codinus/types';
import { Subject } from 'rxjs';
import { IMatFormFieldSupport } from './base/types';

@Directive({
    selector: '[csMatFormFieldControl]',
    host: {
        '[class]': 'controlType',
        '[attr.aria-required]': 'required.toString()',
        '[attr.aria-disabled]': 'disabled.toString()',
        '[attr.aria-invalid]': 'errorState',
        '[attr.id]': 'id',
    },
    providers: [{ provide: MatFormFieldControl, useExisting: CSMatFormFieldControl }]
})
export class CSMatFormFieldControl<TValue> implements MatFormFieldControl<TValue | null>, OnDestroy, DoCheck {

    readonly _elementRef = inject(ElementRef, { self: true });
    private readonly parentFrom = inject(FormGroupDirective, { optional: true, skipSelf: true }) ??
        inject(NgForm, { optional: true, skipSelf: true });

    private readonly _defaultErrorStateMatcher = inject(ErrorStateMatcher);

    private _component?: IMatFormFieldSupport<TValue>;
    private _placeholder!: string;
    private _required?: boolean;
    private _focused = false;
    private _id: string;
    private _uid: string;

    readonly disableAutomaticLabeling = true;
    readonly controlType = this._elementRef.nativeElement.tagName.toLowerCase();
    ngControl = inject(NgControl, { optional: true, self: true });
    readonly stateChanges = new Subject<void>();
    readonly changeState = () => this.stateChanges.next();
    errorState = false;

    floatLabel = input(false, { transform: booleanAttribute });

    constructor() {
        this._id = this._uid = inject(_IdGenerator).getId(this.controlType);
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    setComponent(component: IMatFormFieldSupport<TValue>) {
        this._component = component;
        return this;
    }

    setNgControl(control?: NgControl | null) {
        this.ngControl = control ?? null;
    }

    get value() { return this._component?.value ?? null; }
    get disabled() { return this._component?.disabled ?? false; }
    get focused(): boolean { return this._focused || !!this._component?.specialFocusState; }
    get shouldLabelFloat(): boolean { return this._component?.shouldLabelFloat ?? this.floatLabel(); }
    get empty(): boolean { return this._component?.empty ?? false; }
    get autofilled(): boolean { return this._component?.autofilled ?? false; }

    @Input()
    get id(): string { return this._id; }
    set id(value: string) {
        this._id = value || this._uid;
        this.stateChanges.next();
    }

    @Input() errorStateMatcher: ErrorStateMatcher | undefined;

    @Input()
    get placeholder(): string { return this._placeholder; }
    set placeholder(value: string) {
        this._placeholder = value;
        this.changeState();
    }

    @Input()
    get required(): boolean {
        return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
    }
    set required(value: boolean) {
        this._required = value;
        this.changeState();
    }


    setFocused(value: boolean) {
        if (this._focused != value) {
            this._focused = value;
            this.changeState();
        }
    }

    setDescribedByIds(ids: string[]) {
        if (ids.length)
            this._elementRef.nativeElement.setAttribute('aria-describedby', ids.join(' '));
        else
            this._elementRef.nativeElement.removeAttribute('aria-describedby');
    }

    onContainerClick(event: MouseEvent): void {
        if (!this.focused) {
            this._component?.focus?.();
        }
        this._component?.onContainerClick?.(event);
        this.changeState();
    }

    focusElement() {
        this._elementRef.nativeElement.focus?.();
    }

    updateErrorState(): void {
        if (!this.ngControl)
            return;

        const oldState = this.errorState;
        const matcher = this.errorStateMatcher || this._defaultErrorStateMatcher;
        const control = this.ngControl ? (this.ngControl.control as AbstractControl) : null;
        const newState = matcher.isErrorState(control, this.parentFrom);

        if (newState !== oldState) {
            this.errorState = newState;
            this.changeState();
        }
    }

    ngDoCheck(): void {
        this.updateErrorState();
    }

    ngOnDestroy(): void {
        this.stateChanges.complete();
    }


    //#region value accessor

    private _touched = false;
    private _onTouched: () => void = noopFn;
    private _onChange: (value: TValue) => void = noopFn;


    notifyChange(value: TValue): void {
        this._onChange(value);
        this.changeState();
    }

    writeValue(value: TValue): void {
        this._component?.writeValue(value);
    }

    notifyTouched() {
        if (!this._touched) {
            this._touched = true;
            this._onTouched();
            this.changeState();
        }
    }

    setDisabledState(isDisabled: boolean): void {
        this._component?.setDisabledState(isDisabled);
    }

    registerOnChange(fn: (value: unknown) => void): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    //#endregion

}