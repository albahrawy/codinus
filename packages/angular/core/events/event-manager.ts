import { DestroyRef, inject, Renderer2 } from "@angular/core";
import { fromEvent, OperatorFunction } from "rxjs";

type CallbackType = () => void;
interface HasEventTargetAddRemove<E> {
    addEventListener(
        type: string,
        listener: ((evt: E) => void) | null,
        options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
        type: string,
        listener: ((evt: E) => void) | null,
        options?: EventListenerOptions | boolean
    ): void;
}

export class CSEventManager {
    private _registery = new Map<string, CallbackType>();
    constructor(private renderer: Renderer2) {
    }

    listenAndRegister<E extends Event>(key: string, target: 'window' | 'document' | 'body' | unknown, eventName: string | string[], callback: (event: E) => boolean | void) {
        const listener = this.listen(target, eventName, callback);
        this.register(key, listener);
        return listener;
    }

    listenAndRegisterFrom<E extends Event>(key: string, target: 'window' | 'document' | 'body' | HasEventTargetAddRemove<E>,
        eventName: string, callback: (event: E) => boolean | void, pipe?: OperatorFunction<E, E>) {
        const listener = this.listenFrom(target, eventName, callback, pipe);
        this.register(key, listener);
        return listener;
    }

    listenFrom<E extends Event>(target: 'window' | 'document' | 'body' | HasEventTargetAddRemove<E>,
        eventName: string, callback: (event: E) => boolean | void, pipe?: OperatorFunction<E, E>): CallbackType {
        target = target === 'window'
            ? window
            : target === 'document'
                ? document
                : target === 'body'
                    ? document.body
                    : target;
        let observ = fromEvent<E>(target, eventName);
        if (pipe)
            observ = observ.pipe(pipe);
        const subscription = observ.subscribe(e => callback(e));
        return () => subscription.unsubscribe();
    }

    listen<E extends Event>(target: 'window' | 'document' | 'body' | unknown, eventName: string | string[], callback: (event: E) => boolean | void): CallbackType {
        if (typeof eventName === 'string')
            return this.renderer.listen(target, eventName, callback)

        const unRegister = eventName.map(e => this.renderer.listen(target, e, callback));
        return () => unRegister.forEach(r => r());
    }

    register(key: string, events: Array<CallbackType> | CallbackType) {
        const newRegisterFn = Array.isArray(events) ? () => events.forEach(r => r()) : events;
        const registered = this._registery.get(key);
        let addedRegisterFn = newRegisterFn;
        if (registered) {
            addedRegisterFn = () => {
                newRegisterFn();
                registered();
            };
        }
        this._registery.set(key, addedRegisterFn);
    }

    unRegister(key: string) {
        const registered = this._registery.get(key);
        if (registered) {
            registered();
            this._registery.delete(key);
        }
    }

    unRegisterAll() {
        this._registery.forEach(r => r());
        this._registery.clear();
    }
    has(key: string) {
        return this._registery.has(key);
    }
}

export function createEventManager() {
    const destroyRef = inject(DestroyRef);
    const eventManager = new CSEventManager(inject(Renderer2))
    destroyRef.onDestroy(() => eventManager.unRegisterAll());
    return eventManager;
}