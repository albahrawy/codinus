import { Nullable } from "@codinus/types";

export type PasswordRevealMode = 'click' | 'hover';
export type PasswordRevealButtonMode = Nullable<'always' | 'value' | 'none' | ''>;

export type CSCalendarView = 'month' | 'year' | 'multi-year';
export type CSDateRangeRequired = Nullable<"start" | "end" | boolean | ''>;
export interface ICSDateRange<D> {
    start?: D | string | null,
    end?: D | string | null;
}

export interface IMatFormFieldSupport<TValue> {
    disabled: boolean;
    value: TValue;
    readonly shouldLabelFloat: boolean;
    readonly empty: boolean;
    readonly autofilled?: boolean;
    readonly specialFocusState?: boolean;
    focus(): void;
    writeValue(value: TValue): void;
    setDisabledState(isDisabled: boolean): void;
    onContainerClick?: (event: MouseEvent) => void;
}