import { ControlValueAccessor } from "@angular/forms";
import { isArray } from "@codinus/js-extensions";
import { IAction, noopFn, Nullable } from "@codinus/types";

interface ValueAccessors { default?: ControlValueAccessor, builtIn?: ControlValueAccessor, custom?: ControlValueAccessor }

export function createValueAccessorInterceptor(
    valueAccessor: Nullable<ControlValueAccessor | readonly ControlValueAccessor[]>, onWriteValue: IAction<unknown>) {
    const _valueAccessor = selectValidControlAccessor(valueAccessor);
    if (_valueAccessor) {
        const _origAccessorWriteValue = _valueAccessor.writeValue.bind(_valueAccessor);
        _valueAccessor.writeValue = (value: unknown) => {
            _origAccessorWriteValue(value);
            onWriteValue(value);
        }

        const _origAccessorRegisterChange = _valueAccessor.registerOnChange.bind(_valueAccessor);
        const proxy = { change: noopFn };
        _valueAccessor.registerOnChange = (fn: () => void) => {
            _origAccessorRegisterChange(fn);
            proxy.change = fn;
        }
        return proxy;
    }
    return null;
}

export function selectValidControlAccessor(valueAccessor: ControlValueAccessor | readonly ControlValueAccessor[] | undefined | null, throwErrors = false)
    : ControlValueAccessor | null {
    if (isArray(valueAccessor)) {
        if (valueAccessor.length == 1)
            return valueAccessor[0];
        else if (valueAccessor.length > 1) {
            const accessors: ValueAccessors = {};
            valueAccessor.forEach(a => {
                if (isDefaultAccessor(a))
                    setValueAccessor(accessors, a, 'default', throwErrors);
                else if (isBuiltInAccessor(a))
                    setValueAccessor(accessors, a, 'builtIn', throwErrors);
                else if (!accessors.custom)
                    setValueAccessor(accessors, a, 'custom', throwErrors);
            });
            return accessors.custom ?? accessors.builtIn ?? accessors.default ?? null;
        }
    } else if (valueAccessor) {
        return valueAccessor;
    }
    return null;
}

function isDefaultAccessor(accessor: ControlValueAccessor) {
    return accessor.constructor.name === "_DefaultValueAccessor" || accessor.constructor.name === "_CodinusValueAccessor";
}

function isBuiltInAccessor(accessor: ControlValueAccessor) {
    return Object.getPrototypeOf(accessor.constructor).name === '_BuiltInControlValueAccessor' ||
        Object.getPrototypeOf(Object.getPrototypeOf(accessor.constructor)).name === '_BuiltInControlValueAccessor';
}

function setValueAccessor(accessorsList: ValueAccessors, accessor: ControlValueAccessor, key: keyof ValueAccessors, throwErrors = false) {
    if (!accessorsList[key])
        accessorsList[key] = accessor;
    else if (throwErrors)
        throw new Error(`More than one ${key} accessor matches form control with`);

}