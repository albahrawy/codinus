import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";
import { SMOOTH_SCHEDULER } from "@ngx-codinus/core/shared";
import { asyncScheduler, auditTime, distinctUntilChanged, Observable, Subscriber, throttleTime } from "rxjs";
import { ICSElementStateObserver, InputStateEntry } from "./types";

@Injectable({ providedIn: 'root' })
export class CSElementStateObserverService implements ICSElementStateObserver {


    private _document = inject(DOCUMENT);

    watchEnabled(element: HTMLInputElement): Observable<InputStateEntry> {
        return this.watchState(element, { attributes: true, attributeFilter: ['readonly', 'disabled'] },
            (el, subscriber) => ({ disabled: el.disabled, readonly: element.readOnly, subscriber }))
    }

    watchParent(element: HTMLInputElement): Observable<HTMLElement | null> {
        return this.watchState(this._document.body, { childList: true, subtree: true }, () => element.parentElement)
    }

    watchCssVariable(element: HTMLElement, cssVariable: string): Observable<string> {
        return this.watchState(element, { attributes: true, attributeFilter: ['style'] },
            (el) => el.style.getPropertyValue(`--${cssVariable}`))
    }

    watchState<TElement extends HTMLElement, TResult>
        (element: TElement, options: MutationObserverInit,
            callBack: (el: TElement, subscriber: Subscriber<TResult>) => TResult): Observable<TResult> {
        const newObserverCandidate = new Observable<TResult>(subscriber => {
            const mutationObserver = new MutationObserver(() => {
                subscriber.next(callBack(element, subscriber));
            });
            mutationObserver.observe(element, options);
            return () => mutationObserver.disconnect();
        });

        return newObserverCandidate.pipe(
            auditTime(0, SMOOTH_SCHEDULER),
            throttleTime(20, asyncScheduler, { trailing: true }),
            distinctUntilChanged()
        );
    }
}