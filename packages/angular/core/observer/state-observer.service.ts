import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";
import { SMOOTH_SCHEDULER } from "@ngx-codinus/core/shared";
import { asyncScheduler, auditTime, Observable, throttleTime } from "rxjs";
import { ICSElementStateObserver, InputStateEntry } from "./types";

@Injectable({ providedIn: 'root' })
export class CSElementStateObserverService implements ICSElementStateObserver {

    private _document = inject(DOCUMENT);

    watchState(element: HTMLInputElement): Observable<InputStateEntry> {
        const newObserverCandidate = new Observable<InputStateEntry>(subscriber => {
            const mutationObserver = new MutationObserver(() => {
                subscriber.next({ disabled: element.disabled, readonly: element.readOnly, subscriber });
            });
            mutationObserver.observe(element, { attributes: true, attributeFilter: ['readonly', 'disabled'] });
            return () => mutationObserver.disconnect();
        });

        return newObserverCandidate.pipe(
            auditTime(0, SMOOTH_SCHEDULER),
            throttleTime(20, asyncScheduler, { trailing: true })
        );
    }

    watchParent(element: HTMLInputElement): Observable<HTMLElement | null> {
        const newObserverCandidate = new Observable<HTMLElement>(subscriber => {
            const mutationObserver = new MutationObserver(() => {
                if (element.parentElement) {
                    subscriber.next(element.parentElement);
                }
            });
            mutationObserver.observe(this._document.body, { childList: true, subtree: true });
            return () => mutationObserver.disconnect();
        });

        return newObserverCandidate.pipe(
            auditTime(0, SMOOTH_SCHEDULER),
            throttleTime(20, asyncScheduler, { trailing: true })
        );
    }
}