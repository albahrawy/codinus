/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/albahrawy/ngx-codinus/blob/main/LICENSE
 */
import { CollectionViewer, ListRange } from "@angular/cdk/collections";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { CDK_TABLE } from "@angular/cdk/table";
import { AfterViewInit, DestroyRef, Directive, NgZone, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, combineLatest, distinctUntilChanged, shareReplay, startWith, switchMap, tap } from "rxjs";
import { ICSTableVirtualScrollDataHandler } from "./types";

@Directive()
export abstract class CSTableVirtualScrollDataHandlerBase<T>
    implements ICSTableVirtualScrollDataHandler<T>, CollectionViewer, AfterViewInit {

    private readonly _cdkTable = inject(CDK_TABLE, { self: true });
    private readonly _ngZone = inject(NgZone);
    private readonly _destroyRef = inject(DestroyRef);

    protected _cdkTableDataSource: Observable<readonly T[] | null> | null = null;

    readonly viewChange = new Subject<ListRange>();
    readonly viewChangeSignal = signal<ListRange>({ start: 0, end: 0 },
        { equal: (a, b) => a.start === b.start && a.end === b.end });
    abstract readonly dataStream: Observable<readonly T[]>;
    abstract fetchNextData(range: ListRange): Observable<readonly T[] | null>;

    attach(viewport: CdkVirtualScrollViewport): void {
        this._ngZone.runOutsideAngular(() => {
            this._cdkTable.dataSource = this._cdkTableDataSource =
                combineLatest([
                    viewport.renderedRangeStream.pipe(startWith({ start: 0, end: 0 })),
                    this.dataStream])
                    .pipe(
                        distinctUntilChanged(([pRange, pData], [cRange, cData]) =>
                            (pData === cData || (pData?.length === 0 && cData?.length === 0))
                            && pRange.start === cRange.start && pRange.end === cRange.end
                        ),
                        tap(([range]) => {
                            this.viewChangeSignal.set(range);
                            if (this.viewChange.observed) {
                                this._ngZone.run(() => {
                                    this.viewChange.next(range)
                                });
                            }
                        }),
                        shareReplay(1),
                        switchMap(([range]) => this.fetchNextData(range)),
                        takeUntilDestroyed(this._destroyRef));

            viewport.attach(this);
        });
    }

    measureRangeSize(range: ListRange, orientation: 'horizontal' | 'vertical'): number {
        return 0;
    }

    ngAfterViewInit(): void {
        if (this._cdkTable.dataSource != this._cdkTableDataSource) {
            this._cdkTable.dataSource = this._cdkTableDataSource;
            throw new Error('Error: Cdk Table datasource can not set. on virtual scrolling mode');
        }
    }
}
