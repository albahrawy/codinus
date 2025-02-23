import { inject, Injectable, NgZone } from "@angular/core";
import { SMOOTH_SCHEDULER } from "@ngx-codinus/core/shared";
import { asyncScheduler, auditTime, filter, map, NextObserver, Observable, Subscriber, throttleTime } from "rxjs";
import { ICSElementResizeObserver } from "./types";

class FakeNgZone {
    run<T>(fn: (...args: unknown[]) => T): T {
        return fn();
    }
}

@Injectable({ providedIn: 'root' })
export class CSElementResizeObserverService implements ICSElementResizeObserver {
    private notifiers: NextObserver<ResizeObserverEntry[]>[] = [];
    private _ngZone = inject(NgZone, { optional: true }) ?? new FakeNgZone();
    private resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        this._ngZone.run(() => this.notifiers.forEach(obs => obs.next(entries)));
    });

    resizeObservable(elem: Element): Observable<ResizeObserverEntry> {
        this.resizeObserver.observe(elem, { box: 'border-box' });
        const newObserverCandidate = new Observable<ResizeObserverEntry[]>(
            (subscriber: Subscriber<ResizeObserverEntry[]>) => {
                this.notifiers.push(subscriber);
                return () => {
                    const idx = this.notifiers.findIndex(val => val === subscriber);
                    this.notifiers.splice(idx, 1);
                    this.resizeObserver.unobserve(elem);
                };
            }
        );

        return newObserverCandidate.pipe(
            map(entries => entries.find(entry => entry.target === elem)),
            filter(Boolean),
            auditTime(0, SMOOTH_SCHEDULER),
            throttleTime(20, asyncScheduler, { trailing: true })
        );
    }

    widthResizeObservable(elem: Element): Observable<number> {
        return this.resizeObservable(elem).pipe(
            map(entry => entry.borderBoxSize[0].inlineSize));
    }

    heightResizeObservable(elem: Element): Observable<number> {
        return this.resizeObservable(elem).pipe(
            map(entry => entry.borderBoxSize[0].blockSize),
        );
    }
}