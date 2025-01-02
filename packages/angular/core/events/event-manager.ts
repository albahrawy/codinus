import { Renderer2 } from "@angular/core";

type CallbackType = () => void;

export class CSEventManager {
    private _registery = new Map<string, CallbackType>();
    constructor(private renderer: Renderer2) {
    }

    listenAndRegister<E extends Event>(key: string, target: 'window' | 'document' | 'body' | unknown, eventName: string | string[], callback: (event: E) => boolean | void) {
        this.register(key, this.listen(target, eventName, callback));
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
}

export function createEventManager(renderer: Renderer2) {
    return new CSEventManager(renderer);
}