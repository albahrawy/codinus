import { ComponentRef, effect, Injector, isSignal, signal } from "@angular/core";
import { arrayToObject, jsonForEach } from "@codinus/js-extensions";

export class CompositeComponentWrapper<TComponent> {
    private _data = {} as Record<string & keyof TComponent, unknown>;
    private componentRef = signal<ComponentRef<TComponent> | null>(null);
    attached = false;
    constructor(parent: unknown, injector: Injector, members?: Partial<TComponent> | Array<keyof TComponent & string> | (() => Array<keyof TComponent & string>)) {
        if (members) {
            setTimeout(() => {
                const properties = typeof members === 'function'
                    ? arrayToObject(members(), k => [k, (parent as Record<keyof TComponent, unknown>)[k]])
                    : Array.isArray(members)
                        ? arrayToObject(members, k => [k, (parent as Record<keyof TComponent, unknown>)[k]])
                        : members;

                jsonForEach(properties, (k, v) => {
                    this._data[k as string & keyof TComponent] = v;
                    if (isSignal(v))
                        effect(() => {
                            if (this.componentRef()?.instance)
                                this.componentRef()?.setInput(k, v());
                        }, { injector: injector });
                });
            });
        }
    }

    get component(): TComponent | undefined | null { return this.componentRef()?.instance; }
    get htmlElement(): HTMLElement | undefined | null { return this.componentRef()?.location.nativeElement; }

    attach(componentRef: ComponentRef<TComponent>): void {
        this.componentRef.set(componentRef);
        this.attached = true;
        jsonForEach(this._data, (key, value) => {
            if (isSignal(value))
                componentRef.setInput(key, value());
            else
                componentRef.setInput(key, value);
        });
    }

    detach() {
        this.attached = false;
        this.componentRef()?.destroy();
        this.componentRef.set(null);
    }

    get<K extends string & keyof TComponent>(key: K): TComponent[K] {
        const instance = this.componentRef()?.instance;
        if (instance)
            return instance[key];
        return this._data[key] as TComponent[K];
    }

    set<K extends string & keyof TComponent>(key: K, value: TComponent[K], setComponentValue = true) {
        this._data[key] = value;
        if (setComponentValue && this.componentRef()?.instance) {
            if (isSignal(value))
                this.componentRef()?.setInput(key, value());
            else
                this.componentRef()?.setInput(key, value);
        }
    }
} 