import { toNumber } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";

interface IFlexMediaColumnInitials<T> {
    default: T,
    xs: T,
    sm: T,
    md: T,
    lg: T,
    xl: T,
    sl: T
};

const FlEX_MEDIA_INITIALS = {
    'default': 'unset',
    'xs': 'unset',
    'sm': 'unset',
    'md': 'unset',
    'lg': 'unset',
    'xl': 'unset',
    'sl': 'unset'
};

const FlEX_MEDIA_COLUMN_INITIALS = {
    'default': null,
    'xs': null,
    'sm': null,
    'md': null,
    'lg': null,
    'xl': null,
    'sl': null
};

export function createMediaColumnProperty(value: Nullable<string | number | number[]>) {
    const inputs = typeof value === 'number'
        ? [value]
        : typeof value === 'string'
            ? value.split(',').map(v => toNumber(v, 0))
            : value;
    return createFlexMediaInfoCore(inputs ?? [], v => v ?? 0, FlEX_MEDIA_COLUMN_INITIALS);
}

export function createFlexPropertyFromColumns(value: Nullable<string | number>) {
    if (typeof value === 'number')
        value = `${value}`;
    return (value?.split(',') ?? [])
        .map(f => {
            if (!f)
                return null;
            let columnCount = toNumber(f, 1);
            columnCount = columnCount <= 0 ? 1 : columnCount;
            return 100 / columnCount;
        }).join(',');
}

export function createFlexMediaInfo(value: Nullable<string>, getter: (v: Nullable<string>) => string) {
    return createFlexMediaInfoCore(value?.split(',') ?? [], getter, FlEX_MEDIA_INITIALS);
}

function createFlexMediaInfoCore<T>(inputs: Array<T>, getter: (v: Nullable<T>) => T, initials: IFlexMediaColumnInitials<T>) {
    const result = { ...initials };
    const length = inputs.length;
    if (length == 0)
        return result;

    result.default = getter(inputs[0]);

    if (length == 2 || length == 3)
        result.sm = getter(inputs[1]);

    if (length == 3)
        result.lg = getter(inputs[2]);

    if (length > 3) {
        result.xs = getter(inputs[1]);
        result.sm = getter(inputs[2]);
        result.md = getter(inputs[3]);
        result.lg = getter(inputs.at(4));
        result.xl = getter(inputs.at(5));
        result.sl = getter(inputs.at(6));
    }
    return result;
}