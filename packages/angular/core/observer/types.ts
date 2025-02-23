import { InjectionToken } from "@angular/core";
import { Subscriber, Observable } from "rxjs";

export const CODINUS_ELEMENT_RESIZE_OBSERVER = new InjectionToken<ICSElementResizeObserver>('cs-element_resize_observer');
export const CODINUS_ELEMENT_STATE_OBSERVER = new InjectionToken<ICSElementStateObserver>('cs-element_state_observer');

export type InputStateEntry = {
    disabled: boolean;
    readonly: boolean;
    subscriber: Subscriber<InputStateEntry>
}

export interface ICSElementResizeObserver {

    resizeObservable(elem: Element): Observable<ResizeObserverEntry>;

    widthResizeObservable(elem: Element): Observable<number>;

    heightResizeObservable(elem: Element): Observable<number>;
}

export interface ICSElementStateObserver {
    watchState(elem: HTMLInputElement): Observable<InputStateEntry>;
    watchParent(element: HTMLInputElement): Observable<HTMLElement | null>;
}