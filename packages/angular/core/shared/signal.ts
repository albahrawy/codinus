/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, effect, InputSignal, isSignal, linkedSignal, signal, Signal, untracked, ValueEqualityFn, WritableSignal } from "@angular/core";
import { SIGNAL } from "@angular/core/primitives/signals";
import { getFunction, toFirstUpperCase } from "@codinus/js-extensions";
import { IFunc, IGenericRecord, Nullable, ValueGetter } from "@codinus/types";

type FunctionKeyPrefix = Nullable<string> | (() => Nullable<string>);
type Config = { name: string; } | Signal<{ name: string; }>;
type ComputationFn<S, D> = (source: S, previous?: { source: S; value: D }) => D;

export type FunctionReturn<R = any> = ((...args: any[]) => R) | null;
export type CSLinkedSignal<D> = WritableSignal<D> & { reset(): void; }
export type CSVersionSignal = Signal<number> & { refresh(): void; }

export function signalPropertyOf<O, K extends keyof O>(obj: Signal<O> | O, key: K, initialValue?: O[K]): Signal<O[K] | undefined> {
    const signalObj = isSignal(obj) ? obj : () => obj;
    const signalGetter = signal<() => O[K] | undefined>(() => initialValue)
    const _effRef = effect(() => {
        const instanceObj = signalObj();
        if (instanceObj) {
            const bindedKey = `__${String(key)}__`;
            const bindedInternal = (instanceObj as IGenericRecord)[bindedKey];
            if (isSignal(bindedInternal))
                signalGetter.set(bindedInternal as Signal<O[K] | undefined>);
            else
                signalGetter.set((instanceObj as IGenericRecord)[bindedKey] = generateSignalFromProperty(instanceObj, key, initialValue));
            _effRef.destroy();
        }
    }, { manualCleanup: true });

    return computed(() => signalGetter()());
}

export function signalFunctionOf<T extends FunctionReturn>(obj: () => Nullable<object>,
    functionName: string): Signal<T | null>;
export function signalFunctionOf<T extends FunctionReturn>(obj: () => Nullable<object>,
    configName: string, eventName?: string, prefix?: FunctionKeyPrefix): Signal<T | null>;
export function signalFunctionOf<T extends FunctionReturn>(obj: () => Nullable<object>,
    config: Config, eventName?: string, prefix?: FunctionKeyPrefix): Signal<T | null>;
export function signalFunctionOf<T extends FunctionReturn>(obj: () => Nullable<object>,
    config: string | Config, eventName?: string, prefix?: FunctionKeyPrefix): Signal<T | null> {

    const prefixGetter = typeof prefix === 'string'
        ? () => prefix
        : isSignal(prefix)
            ? prefix
            : () => null;

    const funNameGetter = () => _getFunctionName(config, eventName, prefixGetter());

    return computed(() => {
        const functionName = funNameGetter();
        if (functionName == null)
            return null;
        return getFunction<T>(obj(), functionName);
    });
}

export function signalFunctionValueOf<T>(codeClass: () => Nullable<object>,
    config: Signal<Config>, eventName?: string, prefix?: FunctionKeyPrefix, action?: (fn: FunctionReturn<T>) => T): Signal<T | null> {
    const fn = signalFunctionOf<(...args: unknown[]) => T>(codeClass, config, eventName, prefix);
    if (action)
        return computed(() => action(fn()));
    return computed(() => fn()?.() ?? null);
}

export function signalItemGetter<R, O extends Config>(
    obj: Signal<object | undefined | null>, config: Signal<O>, key: keyof O & string, prefix?:
        FunctionKeyPrefix): Signal<ValueGetter<unknown, R>> {
    return signalFromFunctionOrConfigCore(obj, config, key, prefix);
}

export function signalFromFunctionOrConfig<O extends Config, K extends keyof O & string>(
    obj: Signal<Nullable<object>>, config: Signal<O> | O, key: K, prefix?: FunctionKeyPrefix,
    trigger?: Signal<unknown>): Signal<Nullable<O[K]>> {
    return signalFromFunctionOrConfigCore(obj, config, key, prefix, trigger);
}

export function signalActionFromFunctionOrConfig<O extends Config, K extends keyof O & string>(
    obj: () => Nullable<object>,
    config: Signal<O> | O,
    key: K,
    prefix?: FunctionKeyPrefix,
    trigger?: Signal<unknown>,
    action?: (fn: Exclude<FunctionReturn<O[K]>, null>) => O[K]
): Signal<O[K] | null> {
    const _fromConfig = signalPropertyOf(config, key);
    const singalFn = signalFunctionOf<FunctionReturn<O[K]>>(obj, config, toFirstUpperCase(key), prefix);
    return computed(() => {
        const fn = singalFn();
        trigger?.();
        if (typeof fn === 'function') {
            if (action)
                return action(fn);
            return fn();
        }
        const fromConfig = _fromConfig();
        if (fromConfig)
            return fromConfig
        return null;
    });
}

export function signalConditionFromFunctionOrConfig<O extends Config>(
    obj: () => Nullable<object>, config: Signal<O> | O, key: keyof O & string, prefix?: FunctionKeyPrefix,
    trigger?: () => unknown): Signal<boolean> {
    const _fromConfig = signalPropertyOf(config, key);
    const signalFn = signalFunctionOf<IFunc<unknown, boolean>>(obj, config, toFirstUpperCase(key), prefix);
    return computed(() => {
        const fn = signalFn();
        const fromFunc = (typeof fn !== 'function') ? false : fn(trigger?.());
        return fromFunc === true || _fromConfig() === true;
    });
}

export function forceInputSet<R, I extends Signal<R>>(input: I | null, value: R) {
    if (!input)
        return;
    const node = (input as unknown as InputSignal<R>)?.[SIGNAL];
    if (node?.applyValueToInputSignal == null)
        throw new Error("input is not a valid InsputSignal");

    node.applyValueToInputSignal(node, value);
}

export function signalVersion(): CSVersionSignal {
    const _dataVersion = signal(0);
    const refresh = () =>
        _dataVersion.update(v => {
            v++;
            if (v >= Number.MAX_VALUE)
                v = 0;
            return v;
        });

    const signalVersion = _dataVersion.asReadonly() as CSVersionSignal;
    signalVersion.refresh = refresh;
    return signalVersion;
}

export function debouncedSignal<T>(input: Signal<T>, timeOutMs = 0): Signal<T> {
    const debounceSignal = signal(input());
    effect((onCleanup) => {
        const value = input();
        const timeout = setTimeout(() => {
            debounceSignal.set(value);
        }, timeOutMs);
        onCleanup(() => clearTimeout(timeout));
    });
    return debounceSignal;
}


export function csLinkedSignal<D>(
    computation: () => D,
    options?: { equal?: ValueEqualityFn<NoInfer<D>> },
): CSLinkedSignal<D>;
export function csLinkedSignal<S, D>(options: {
    source: () => S;
    computation: (source: NoInfer<S>, previous?: { source: NoInfer<S>; value: NoInfer<D> }) => D;
    equal?: ValueEqualityFn<NoInfer<D>>;
}): CSLinkedSignal<D>;
export function csLinkedSignal<S, D>(
    optionsOrComputation:
        | {
            source: () => S;
            computation: ComputationFn<S, D>;
            equal?: ValueEqualityFn<D>;
        }
        | (() => D),
    options?: { equal?: ValueEqualityFn<D> },
): CSLinkedSignal<D> {
    const inner = ((typeof optionsOrComputation === 'function')
        ? linkedSignal(optionsOrComputation, options)
        : linkedSignal(optionsOrComputation)) as CSLinkedSignal<D>;

    inner.reset = function () {
        untracked(() => inner.set((this[SIGNAL] as any).source()));
    }
    return inner;
}

function signalFromFunctionOrConfigCore<O extends Config, R>(
    obj: Signal<Nullable<object>>, config: Signal<O> | O, key: keyof O & string,
    prefix?: FunctionKeyPrefix, trigger?: Signal<unknown>): Signal<Nullable<R>> {
    const _fromConfig = signalPropertyOf(config, key);
    const signalFn = signalFunctionOf<IFunc<unknown, R>>(obj, config, toFirstUpperCase(key), prefix);
    return computed(() => {
        const fn = signalFn();
        if (typeof fn === 'function')
            return fn(trigger?.());
        const fromConfig = _fromConfig();
        if (fromConfig)
            return fromConfig as R;
        return null;
    });
}

function _getFunctionName(config: Config | string, eventName?: string, prefix?: string | null) {
    const name = typeof config === 'string'
        ? config
        : isSignal(config)
            ? (config() as Config)?.name
            : config.name;
    if (!name)
        return null;
    const parts: string[] = [];
    if (prefix)
        parts.push(prefix);
    parts.push(name);
    if (eventName)
        parts.push(eventName);
    return parts.join('_');
}

function generateSignalFromProperty<O, K extends keyof O>(obj: O, key: K, initialValue: O[K] | undefined): Signal<O[K] | undefined> {
    const internal = signal(initialValue);
    const setInternal = internal.set;
    if (obj && !Object.getOwnPropertyDescriptor(obj, key)?.set) {
        setInternal(obj[key]);
        Object.defineProperty(obj, key, {
            get() { return untracked(() => internal()); },
            set(newValue) { setInternal(newValue); },
            enumerable: true,
            configurable: true,
        });
    }
    return internal;
}
