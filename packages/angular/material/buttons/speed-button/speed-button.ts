import { ConnectedPosition, Overlay, OverlayConfig, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import {
    Component, ElementRef, EventEmitter, Output, ViewEncapsulation, computed, effect, inject,
    input, signal, viewChild, viewChildren
} from '@angular/core';
import { MatButtonModule, MatMiniFabButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { booleanTrueAttribute } from '@ngx-codinus/core/shared';
import { Subscription, forkJoin, fromEvent, take } from 'rxjs';
import { CSButtonContainerBase } from '../base/button-container-base';
import {
    CSSpeedButtonAnimation,
    CSSpeedButtonDirection, CSSpeedButtonMode,
    ICSFabButton, ICSSpeedButtonArgs, ICSSpeedButtonConfig
} from '../types/types';



interface CSFabButtonItem {
    args: ICSFabButton;
    key: string;
}

const connectedPosition: Record<CSSpeedButtonDirection, ConnectedPosition> = {
    'right': { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', panelClass: '--direction-right' }, //-- right
    'left': { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', panelClass: '--direction-left' }, //--left
    'up': { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', panelClass: '--direction-up' }, // up
    'down': { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', panelClass: '--direction-down' }, // --bottom
};

const connectedPositions: Record<string, ConnectedPosition[]> = {
    'right': [connectedPosition.right, connectedPosition.left],
    'left': [connectedPosition.left, connectedPosition.right],
    'up': [connectedPosition.up, connectedPosition.down],
    'down': [connectedPosition.down, connectedPosition.up]
};

@Component({
    selector: 'cs-speed-button',
    templateUrl: './speed-button.html',
    styleUrl: './speed-button.scss',
    encapsulation: ViewEncapsulation.None,
    imports: [MatButtonModule, MatIconModule, OverlayModule, PortalModule, MatTooltipModule],
    host: {
        'class': 'cs-speed-button',
        '[class.--opened]': '_panelOpened()',
        '[class.--static-buttons]': 'static()',
        '[class]': '"--position-" + position()',
        '[style.--speed-button-spin-deg]': 'spinDegree()',
    }
})
export class CSSpeedButton
    extends CSButtonContainerBase<ICSFabButton, CSFabButtonItem, ICSSpeedButtonArgs, ICSSpeedButtonConfig> {

    protected _panelOpened = signal(false);

    @Output() readonly stateChanged = new EventEmitter<boolean>();

    mode = input<CSSpeedButtonMode, CSSpeedButtonMode | undefined>('hover', { transform: v => v ?? 'hover' });
    mini = input(true, { transform: booleanTrueAttribute });
    lazyEvent = input(true, { transform: booleanTrueAttribute });
    triggerIcon = input('more_vert');
    spin = input<false | number>(90);
    direction = input<CSSpeedButtonDirection>('down');
    animationMode = input<CSSpeedButtonAnimation>('scale');
    position = input<CSSpeedButtonDirection>('right');

    static = computed(() => this.mode() === 'static');
    hoverEnabled = computed(() => this.mode() === 'hover');
    spinDegree = computed(() => {
        let spin = this.spin();
        if (!spin)
            return undefined;
        if (spin < -360 || spin > 360)
            spin = 90;

        return `rotate(${spin}deg)`;
    });

    constructor() {
        super();
        effect(() => {
            this.stateChanged.emit(this._panelOpened());
        });

        effect(() => setTimeout(() => this._toggleOpen(this.static())));
    }

    //#region creating buttons

    protected override createUIArgs(value: ICSFabButton, key: string, index: number): CSFabButtonItem {
        const args = { ...value };
        args.order ??= index;
        return { args, key };
    }

    protected override sort(uiArray: CSFabButtonItem[]): CSFabButtonItem[] {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return uiArray.sort((a, b) => a.args.order! - b.args.order!);
    }
    protected override btnClicked(button: CSFabButtonItem): void {
        this.close();
        if (this.lazyEvent())
            setTimeout(() => super.btnClicked(button), 0);
        else
            super.btnClicked(button);
    }

    //#endregion

    private _overlayRef?: OverlayRef;
    protected readonly _overlay = inject(Overlay);
    private _portalTemplate = viewChild(CdkPortal);
    private _toggleTrigger = viewChild<ElementRef<HTMLElement>>('toggleTrigger');
    private _renderedButtons = viewChildren(MatMiniFabButton);

    protected _toggle(event: MouseEvent, state?: boolean) {
        event.stopPropagation();
        event.preventDefault();
        if (this.static())
            return;
        if (state == null) {
            if (!this.hoverEnabled())
                this._toggleOpen(!this._panelOpened());
        } else if (this.hoverEnabled()) {
            this._toggleOpen(state);
        }
    }

    _toggleOpen(reqState: boolean): void {
        if (reqState)
            this.open();
        else
            this.close();
    }

    open() {
        if (this._overlayRef?.hasAttached() || this._panelOpened())
            return;
        this._overlayRef ??= this._overlay.create(this._getOverlayPopupConfig());
        this._overlayRef.attach(this._portalTemplate());
        this._overlayRef.backdropClick().pipe(take(1)).subscribe(() => { this.close(); });
        setTimeout(() => this._panelOpened.set(true), 200);
    }

    close(): void {
        if (this._overlayRef?.hasAttached() && this._panelOpened() && !this.static()) {
            const _buttons = this._renderedButtons();
            const obs = _buttons.map(b => fromEvent<TransitionEvent>(b._elementRef.nativeElement, 'transitionend').pipe(take(1)));
            const animationHide: Subscription = forkJoin(obs).subscribe(() => {
                animationHide?.unsubscribe();
                this._overlayRef?.detach();
                this._overlayRef = undefined;
            });
            this._panelOpened.set(false);
        }
    }

    renderedButton = viewChildren('renderedBtn', { read: ElementRef });

    handleLeaveTrigger(event: MouseEvent, isTrigger: boolean) {
        if (!this.hoverEnabled)
            return;
        const target = event.relatedTarget;
        const trigger = this._toggleTrigger()?.nativeElement as unknown as HTMLElement;
        if (isTrigger && !this.renderedButton().some(b => b.nativeElement === target || b.nativeElement.contains(target)))
            this._toggle(event, false);
        else if (!isTrigger && target !== trigger && !trigger.contains(target as HTMLElement))
            this._toggle(event, false);
    }

    private _getOverlayPopupConfig(): OverlayConfig {
        const positionStrategy = this._overlay.position()
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .flexibleConnectedTo(this._toggleTrigger()!)
            .withPush(false)
            .withViewportMargin(8)
            .withPositions(connectedPositions[this.direction()]);
        const scrollStrategy = this._overlay.scrollStrategies.reposition();
        return new OverlayConfig({
            positionStrategy,
            scrollStrategy,
            hasBackdrop: false, // !this.static(),
            panelClass: `--animation-${this.animationMode()}`,
            backdropClass: 'cdk-overlay-transparent-backdrop'
        });
    }
}
