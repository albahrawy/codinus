import { toNumber } from "@codinus/js-extensions";

const FlEX_MEDIA_INITIALS = {
    'default': 'initial',
    'xs': 'initial',
    'sm': 'initial',
    'md': 'initial',
    'lg': 'initial',
    'xl': 'initial',
    'sl': 'initial'
};

export function createFlexPropertyFromColumns(value: string | null | number | undefined) {
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

export function createFlexMediaInfo(value: string | null | undefined, getter: (v: string | undefined) => string) {
    const flexInputs = value?.split(',') ?? [];
    const flex = { ...FlEX_MEDIA_INITIALS };
    const length = flexInputs.length;
    if (length == 0)
        return flex;

    flex.default = getter(flexInputs[0]);

    if (length == 2 || length == 3)
        flex.sm = getter(flexInputs[1]);

    if (length == 3)
        flex.lg = getter(flexInputs[2]);

    if (length > 3) {
        flex.xs = getter(flexInputs[1]);
        flex.sm = getter(flexInputs[2]);
        flex.md = getter(flexInputs[3]);
        flex.lg = getter(flexInputs.at(4));
        flex.xl = getter(flexInputs.at(5));
        flex.sl = getter(flexInputs.at(6));
    }
    return flex;
}