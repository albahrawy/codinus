import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Directive, effect, inject, input, model, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { preventEvent } from '@codinus/dom';
import { IArglessFunc, Nullable } from '@codinus/types';
import { createEventManager } from '@ngx-codinus/core/events';
import { delay, filter, ReplaySubject } from 'rxjs';

const DefaultPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
];

@Directive({
    selector: '[csHoverOverlay]',
})
export class CSHoverOverlay {

    private overlay = inject(Overlay);
    private viewContainer = inject(ViewContainerRef);

    private portal: TemplatePortal<unknown> | null = null;
    private overlayRef: OverlayRef | null = null;
    private _eventManager = createEventManager();
    private _isOpen = signal(false);
    private _mouseIn = false;
    private _mouseEnterSubject = new ReplaySubject<MouseEvent>();
    private _overlayContextFn: IArglessFunc<unknown> | null = null;
    private _hasMenuOpened = false;

    csHoverOverlay = model.required<TemplateRef<unknown>>();
    overlayPositions = model<Nullable<ConnectedPosition[]>>(DefaultPositions);
    overlayContext = input<unknown>();

    setOverlayContextGenerator(fn: IArglessFunc<unknown>) {
        this._overlayContextFn = fn;
    }

    get hasMenuOpened() { return this._hasMenuOpened; }
    set hasMenuOpened(value: boolean) {
        this._hasMenuOpened = value;
        if (!value)
            this._detachCore();
    }

    constructor() {
        const el = this.viewContainer.element.nativeElement;
        this._eventManager.listenAndRegister<MouseEvent>('element', el, 'mouseenter', e => this.attachPending(e));
        this._eventManager.listenAndRegister<MouseEvent>('element', el, 'mouseleave', e => this.detach(e));

        effect(() => {
            const isOpen = this._isOpen();
            const el = this.viewContainer.element.nativeElement as HTMLElement;
            if (isOpen)
                el.classList.add('cs-hover-overlay-active');
            else
                el.classList.remove('cs-hover-overlay-active');
        });

        this._mouseEnterSubject.pipe(takeUntilDestroyed(), delay(100), filter(() => this._mouseIn))
            .subscribe(e => this.attach(e));
    }

    private attachPending(e: MouseEvent): void {
        this._mouseIn = true;
        this._mouseEnterSubject.next(e);
    }

    private attach(event: MouseEvent) {
        preventEvent(event);
        if (!this.overlayRef) {
            const positionStrategy = this.overlay
                .position()
                .flexibleConnectedTo(this.viewContainer.element)
                .withPositions(this.overlayPositions() ?? DefaultPositions);

            this.overlayRef = this.overlay.create({
                positionStrategy,
                hasBackdrop: false,
                scrollStrategy: this.overlay.scrollStrategies.reposition(),
            });
        }

        if (!this.overlayRef.hasAttached()) {
            this.portal ??= new TemplatePortal(this.csHoverOverlay(), this.viewContainer);
            this.portal.context = this.overlayContext() ?? this._overlayContextFn?.();
            this.overlayRef.attach(this.portal);
            this._isOpen.set(true);
            this._eventManager.listenAndRegister<MouseEvent>('overlayEvents', this.overlayRef.hostElement, 'mouseleave', e => this.detach(e));
        }
    }

    private detach(event: MouseEvent) {
        this._mouseIn = false;
        if (!this.overlayRef?.hasAttached() || this.hasMenuOpened)
            return;

        if (!this.overlayRef?.hostElement.contains(event.relatedTarget as HTMLElement)
            && !this.viewContainer.element.nativeElement.contains(event.relatedTarget)) {
            this._detachCore();
        }
    }

    private _detachCore() {
        if (!this.overlayRef?.hasAttached())
            return;
        this.overlayRef.detach();
        this._eventManager.unRegister('overlayEvents');
        this._isOpen.set(false);
    }
}
