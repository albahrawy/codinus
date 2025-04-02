import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { computed, Directive, effect, inject, input, model, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { preventEvent } from '@codinus/dom';
import { IArglessFunc, Nullable } from '@codinus/types';
import { createEventManager } from '@ngx-codinus/core/events';
import { delay, fromEvent, of, switchMap, takeUntil } from 'rxjs';

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
    private _overlayContextFn: IArglessFunc<unknown> | null = null;
    private _hasMenuOpened = false;

    csHoverOverlay = model.required<TemplateRef<unknown>>();
    overlayPositions = model<Nullable<ConnectedPosition[]>>(DefaultPositions);
    overlayContext = input<unknown>();
    effectedElement = model<HTMLElement | string>();

    setOverlayContextGenerator(fn: IArglessFunc<unknown>) {
        this._overlayContextFn = fn;
    }

    get hasMenuOpened() { return this._hasMenuOpened; }
    set hasMenuOpened(value: boolean) {
        this._hasMenuOpened = value;
        if (!value)
            this._detachCore();
    }

    private _effectedElement = computed(() => {
        const el = this.viewContainer.element.nativeElement as HTMLElement;
        const effectedElement = this.effectedElement();
        const customElement = typeof effectedElement === 'string'
            ? el.querySelector(effectedElement)
            : effectedElement instanceof HTMLElement
                ? effectedElement
                : null;
        return customElement ?? el;
    });

    constructor() {
        effect(() => {
            const el = this._effectedElement();
            this._eventManager.unRegister('element');

            const _mouseEnter$ = fromEvent<MouseEvent>(el, 'mouseenter');
            const _mouseLeave$ = fromEvent<MouseEvent>(el, 'mouseleave');

            const enterSub = _mouseEnter$
                .pipe(switchMap(event => of(event).pipe(delay(300), takeUntil(_mouseLeave$))))
                .subscribe(e => this.attach(e));

            const leaveSub = _mouseLeave$
                .subscribe((e) => this.detach(e));

            this._eventManager.register('element', [() => enterSub.unsubscribe(), () => leaveSub.unsubscribe()]);
        });

        effect(() => {
            const isOpen = this._isOpen();
            const el = this._effectedElement();
            if (isOpen)
                el.classList.add('cs-hover-overlay-active');
            else
                el.classList.remove('cs-hover-overlay-active');
        });
    }

    private attach(event: MouseEvent) {
        preventEvent(event);
        if (!this.overlayRef) {
            const positionStrategy = this.overlay
                .position()
                .flexibleConnectedTo(this._effectedElement())
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
            const overlayElement = this.overlayRef.overlayElement;
            overlayElement.classList.add('cs-animation-scale-in');
            this.overlayRef.attach(this.portal);
          //  setTimeout(() => overlayElement.classList.remove('fade-in'), 200);

            this._isOpen.set(true);
            this._eventManager.listenAndRegister<MouseEvent>('overlayEvents', this.overlayRef.hostElement, 'mouseleave', e => this.detach(e));
        }
    }

    private detach(event: MouseEvent) {
        preventEvent(event);
        if (!this.overlayRef?.hasAttached() || this.hasMenuOpened)
            return;
        const el = this._effectedElement();
        const target = event.relatedTarget as HTMLElement;
        if (target && !this.overlayRef?.hostElement.contains(target) && !el.contains(target)) {
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
