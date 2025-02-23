import { inject, signal, input, booleanAttribute, model, computed, effect, untracked, Directive } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup, FormControl } from "@angular/forms";
import { CSMatFormFieldControl } from "@ngx-codinus/material/inputs";

export const FlexPropertyKeys: Array<keyof FlexProeprty<unknown>> = ['def', 'xs', 'sm', 'md', 'lg', 'xl', 'sl'];
export const FlexPropertyLabels = [
    { label: 'Default', key: 'def' },
    { label: 'X-Small', key: 'xs' },
    { label: 'Small', key: 'sm' },
    { label: 'Medium', key: 'md' },
    { label: 'Large', key: 'lg' },
    { label: 'X-Large', key: 'xl' },
    { label: 'S-Large', key: 'sl' },
];

type FlexPropertyRecord<V> = Record<keyof FlexProeprty<unknown>, V>

interface FlexProeprty<T> {
    def: T;
    xs: T;
    sm: T;
    md: T;
    lg: T;
    xl: T;
    sl: T;
}

@Directive()
export abstract class FlexPropertyInputBase<T> {
    protected readonly _mfc = inject(CSMatFormFieldControl, { host: true }).setComponent(this);
    protected readonly parts: FormGroup<{
        def: FormControl<T>;
        xs: FormControl<T>;
        sm: FormControl<T>;
        md: FormControl<T>;
        lg: FormControl<T>;
        xl: FormControl<T>;
        sl: FormControl<T>;
    }>;

    readonly _disabledByInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
    readonly _value = model<string | null>(null, { alias: 'value' });

    private readonly _disabledByCva = signal(false);
    private readonly _disabled = computed(() => this._disabledByInput() || this._disabledByCva());

    get empty() { return !Object.values(this.parts.value).some(f => f !== this.getInitialValue()); }
    get shouldLabelFloat() { return true; }
    get disabled(): boolean { return this._disabled(); }
    get value(): string | null { return this._value(); }

    protected abstract getDefaultValue(): T;
    protected abstract getInitialValue(): T;

    protected abstract convert(partValue: string | undefined): T;
    protected properties = FlexPropertyLabels;

    constructor() {
        const controls = FlexPropertyKeys.reduce((prev, key) => {
            prev[key] = new FormControl<T>(this.getDefaultValue(), { nonNullable: true });
            return prev;
        }, {} as FlexPropertyRecord<FormControl<T>>);
        this.parts = new FormGroup(controls);

        effect(() => {
            if (this._disabled()) {
                untracked(() => this.parts.disable());
            } else {
                untracked(() => this.parts.enable());
            }
        });

        effect(() => {
            const value = this._parse(this._value());
            untracked(() => this.parts.setValue(value));
        });

        this.parts.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => {
            this._mfc.changeState();
        });

        this.parts.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
            this._value.set(this.getRawValue(this.parts.getRawValue()));
            this._mfc.notifyChange(this.value);
        });
    }

    onFocusIn() {
        this._mfc.setFocused(true);
    }

    onFocusOut(event: FocusEvent) {
        if (!this._mfc._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
            this._mfc.setFocused(false);
        }
    }

    onContainerClick() {
        this._mfc.focusElement();
    }

    writeValue(flex: string | null): void {
        this._value.set(flex);
    }

    setDisabledState(isDisabled: boolean): void {
        this._disabledByCva.set(isDisabled);
    }

    private _parse(stringValue: string | null) {
        const parts = (stringValue ?? '').split(',');
        return FlexPropertyKeys.reduce((prev, key, index) => {
            prev[key] = this.convert(parts.at(index));
            return prev;
        }, {} as FlexPropertyRecord<T>);
    }

    private getRawValue(value: FlexProeprty<T | null> | null) {
        if (value)
            return Object.values(value).map(v => !v ? this.getInitialValue() : v).join(',');
        return null;
    }
}