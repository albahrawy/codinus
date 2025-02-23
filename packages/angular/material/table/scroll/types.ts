/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */
import { ListRange } from "@angular/cdk/collections";
import { CdkVirtualScrollRepeater, CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { InjectionToken, Signal } from "@angular/core";
import { Observable } from "rxjs";

export interface ICSTableVirtualScrollDataHandler<T> extends CdkVirtualScrollRepeater<T> {
    attach(viewport: CdkVirtualScrollViewport): void;
    readonly viewChange: Observable<ListRange>;
    readonly viewChangeSignal: Signal<ListRange>;
}

export const CODINUS_VIRTUAL_TABLE_DATA_HANDLER = new InjectionToken<ICSTableVirtualScrollDataHandler<unknown>>("cs-virtual_table_data_handler");