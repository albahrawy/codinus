import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy, Component, computed, ElementRef, inject,
    input, output, viewChild, ViewEncapsulation
} from '@angular/core';
import { MAT_SELECT_SCROLL_STRATEGY, MAT_SELECT_TRIGGER, matSelectAnimations } from '@angular/material/select';
import { IGenericRecord } from '@codinus/types';
import { CODINUS_OVERLAY_HOST } from '@ngx-codinus/cdk/overlays';
import { take } from 'rxjs';

@Component({
    selector: 'cs-overlay-host',
    templateUrl: './overlay-host.html',
    imports: [CdkConnectedOverlay, NgClass, CdkOverlayOrigin],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [matSelectAnimations.transformPanel],
    providers: [{ provide: CODINUS_OVERLAY_HOST, useExisting: CSOverlayHost }]
})

export class CSOverlayHost {

    private _scrollStrategyFactory = inject(MAT_SELECT_SCROLL_STRATEGY);
    preferredOverlayOrigin = input<CdkOverlayOrigin | ElementRef>();
    overlayPanelClass = input<string | string[]>('');
    isOpen = input(false);
    overlayWidth = input<string | number>('');
    maxHeight = input<number>();
    suggestedHeight = input<number>();
    id = input<string>('');
    multiple = input(false);
    canClear = input(false);
    panelClass = input<string | string[] | Set<string> | IGenericRecord>('');

    valueId = input('');
    empty = input(true);
    placeholder = input('');
    triggerValue = input('');
    triggerValueMore = input('');

    private _panel = viewChild('panel', { read: ElementRef });
    protected _customTrigger = viewChild(MAT_SELECT_TRIGGER);
    hasCustomTrigger = computed(() => this._customTrigger() != null);

    private _panelPadding = computed(() => {
        const panel = this._panel()?.nativeElement;
        if (panel) {
            const computedStyle = getComputedStyle(panel);
            return parseFloat(computedStyle.paddingBottom) + parseFloat(computedStyle.paddingTop);
        }
        return 0;
    });

    protected _suggestedHeight = computed(() => (this.suggestedHeight() ?? 0) + this._panelPadding());

    readonly backdropClick = output<MouseEvent>();
    readonly clear = output<MouseEvent>();
    readonly attach = output();
    readonly detach = output();
    readonly positioningSettled = output();
    readonly animationDone = output<string>();
    readonly triggerClicked = output();

    /**
     * This position config ensures that the top "start" corner of the overlay
     * is aligned with with the top "start" of the origin by default (overlapping
     * the trigger completely). If the panel cannot fit below the trigger, it
     * will fall back to a position above the trigger.
     */
    protected _positions: ConnectedPosition[] = [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', panelClass: 'mat-mdc-select-panel-above' },
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', panelClass: 'mat-mdc-select-panel-above' },
    ];

    protected _scrollStrategy = this._scrollStrategyFactory();

    protected _overlayDir = viewChild(CdkConnectedOverlay);

    protected _onAttached(): void {
        this.attach.emit();
        this._overlayDir()?.positionChange.pipe(take(1)).subscribe(() => this.positioningSettled.emit());
    }
}

