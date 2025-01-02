import { InjectionToken } from "@angular/core";
import { Observable, Subscriber } from "rxjs";

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexPosition = 'end' | 'start' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch';

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
    stateObservable(elem: HTMLInputElement): Observable<InputStateEntry>;
}