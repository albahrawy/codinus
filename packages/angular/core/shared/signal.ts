/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, effect, isSignal, signal, Signal, untracked } from "@angular/core";
import { getFunction, toFirstUpperCase } from "@codinus/js-extensions";
import { IFunc, Nullable, ObjectGetter } from "@codinus/types";

type FunctionKeyPrefix = Nullable<string> | Signal<Nullable<string>>;
export type FunctionReturn<R = any> = ((...args: any[]) => R) | null;
type Config = { name: string; } | Signal<{ name: string; }>;

export function signalPropertyOf<O, K extends keyof O>(obj: Signal<O> | O, key: K, initialValue?: O[K]): Signal<O[K] | undefined> {
    const internal = signal(initialValue);
    const setInternal = internal.set;
    const setProtoType = (objInstance: O) => {
        if (objInstance && !Object.getOwnPropertyDescriptor(objInstance, key)?.set) {
            setInternal(objInstance[key]);
            Object.defineProperty(objInstance, key, {
                get() { return untracked(() => internal()); },
                set(newValue) { setInternal(newValue); },
                enumerable: true,
                configurable: true,
            });
        }
    }
    if (isSignal(obj)) {
        const _effRef = effect(() => {
            setProtoType(obj());
            _effRef.destroy();
        }, { manualCleanup: true });
    } else {
        setProtoType(obj);
    }
    return internal.asReadonly();
}

export function signalFunctionOf<T extends FunctionReturn>(obj: Signal<Nullable<object>>,
    functionName: string): Signal<T | null>;
export function signalFunctionOf<T extends FunctionReturn>(obj: Signal<Nullable<object>>,
    configName: string, eventName?: string, prefix?: FunctionKeyPrefix): Signal<T | null>;
export function signalFunctionOf<T extends FunctionReturn>(obj: Signal<object | undefined | null>,
    config: Config, eventName?: string, prefix?: FunctionKeyPrefix): Signal<T | null>;
export function signalFunctionOf<T extends FunctionReturn>(obj: Signal<Nullable<object>>,
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

export function signalFunctionValueOf<T>(codeClass: Signal<Nullable<object>>,
    config: Signal<Config>, eventName?: string, prefix?: FunctionKeyPrefix, action?: (fn: FunctionReturn<T>) => T): Signal<T | null> {
    const fn = signalFunctionOf<(...args: unknown[]) => T>(codeClass, config, eventName, prefix);
    if (action)
        return computed(() => action(fn()));
    return computed(() => fn()?.() ?? null);
}

export function signalItemGetter<R, O extends Config>(
    obj: Signal<object | undefined | null>, config: Signal<O>, key: keyof O & string, prefix?:
        FunctionKeyPrefix): Signal<ObjectGetter<unknown, R>> {
    return signalFromFunctionOrConfigCore(obj, config, key, prefix);
}

export function signalFromFunctionOrConfig<O extends Config>(
    obj: Signal<Nullable<object>>, config: Signal<O> | O, key: keyof O & string, prefix?: FunctionKeyPrefix,
    trigger?: Signal<unknown>): Signal<Nullable<O[keyof O & string]>> {
    return signalFromFunctionOrConfigCore(obj, config, key, prefix, trigger);
}

export function signalActionFromFunctionOrConfig<O extends Config, R = O[keyof O & string]>(
    obj: Signal<Nullable<object>>,
    config: Signal<O> | O,
    key: keyof O & string,
    prefix?: FunctionKeyPrefix,
    trigger?: Signal<unknown>,
    action?: (fn: Exclude<FunctionReturn<R>, null>) => R
): Signal<R | O[keyof O & string] | null> {
    const _fromConfig = signalPropertyOf(config, key);
    const singalFn = signalFunctionOf<FunctionReturn<R>>(obj, config, toFirstUpperCase(key), prefix);
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
    obj: Signal<Nullable<object>>, config: Signal<O> | O, key: keyof O & string, prefix?: FunctionKeyPrefix,
    trigger?: Signal<unknown>): Signal<boolean> {
    const _fromConfig = signalPropertyOf(config, key);
    const signalFn = signalFunctionOf<IFunc<unknown, boolean>>(obj, config, toFirstUpperCase(key), prefix);
    return computed(() => {
        const fn = signalFn();
        const fromFunc = (typeof fn !== 'function') ? false : fn(trigger?.());
        return fromFunc === true || _fromConfig() === true;
    });
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