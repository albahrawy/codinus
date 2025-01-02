import { Injectable } from "@angular/core";
import { Observable, asyncScheduler, throttleTime } from "rxjs";
import { ICSElementStateObserver, InputStateEntry } from "@ngx-codinus/core/layout";

@Injectable({ providedIn: 'root' })
export class CSElementStateObserverService implements ICSElementStateObserver {

    stateObservable(elem: HTMLInputElement): Observable<InputStateEntry> {
        const newObserverCandidate = new Observable<InputStateEntry>(subscriber => {
            const mutationObserver = new MutationObserver(() => {
                subscriber.next({ disabled: elem.disabled, readonly: elem.readOnly, subscriber });
            });
            mutationObserver.observe(elem, { attributes: true, attributeFilter: ['readonly', 'disabled'] });
            return () => mutationObserver.disconnect();
        });

        return newObserverCandidate.pipe(
            throttleTime(20, asyncScheduler, { trailing: true })
        );
    }
}