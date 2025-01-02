// import { ConnectedPosition, Overlay, OverlayConfig, OverlayRef, OverlaySizeConfig } from '@angular/cdk/overlay';
// import { CdkPortal } from '@angular/cdk/portal';
// import { ViewportRuler } from '@angular/cdk/scrolling';
// import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostAttributeToken, Input, Output, booleanAttribute, inject, numberAttribute } from '@angular/core';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { MAT_FORM_FIELD } from '@angular/material/form-field';
// import { Subject, distinctUntilChanged, take } from 'rxjs';
// import { RUNTIME_MAT_FORM_FIELD } from '../types/common-injector-token';

// export type CloseReson = 'Escape' | 'BackDrop' | 'Toggle' | 'Value' | 'Manual';

// @Directive()
// export abstract class NovaDropdownOverlayBase {

//     private _panelOpen = false;
//     private _overlayRef?: OverlayRef;
//     private _lastAttached?: HTMLElement;

//     private _injectedTabIndex = inject(new HostAttributeToken('tabindex'), { optional: true }) ?? "";

//     readonly _elementRef = inject(ElementRef);
//     protected readonly _viewportRuler = inject(ViewportRuler);
//     protected readonly _changeDetectorRef = inject(ChangeDetectorRef);
//     protected readonly _parentFormField = inject(MAT_FORM_FIELD, { optional: true, host: true })
//         ?? inject(RUNTIME_MAT_FORM_FIELD, { optional: true });

//     protected readonly _overlay = inject(Overlay);

//     protected readonly _panelDoneAnimatingStream = new Subject<string>();

//     get panelOpen(): boolean { return this._panelOpen; }
//     get panelTheme(): string { return this._parentFormField ? `mat-${this._parentFormField.color}` : ''; }

//     @Input({ transform: (value: unknown) => numberAttribute(value, 0) }) tabIndex = parseInt(this._injectedTabIndex) || 0;
//     @Input() panelClass?: string | string[];
//     @Input() panelWidth: string | number | null | undefined = 'auto';
//     @Input({ transform: booleanAttribute }) isDialog = false;
//     @Input({ transform: booleanAttribute }) isModal = false;

//     @Output() readonly stateChange = new EventEmitter<boolean>();

//     protected abstract disabled: boolean;
//     protected abstract portalTemplate: CdkPortal;
//     protected abstract toggleTrigger: ElementRef;

//     protected connectedPosition: ConnectedPosition[] = [
//         { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
//         { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
//         { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', panelClass: 'mat-mdc-select-panel-above' },
//         { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', panelClass: 'mat-mdc-select-panel-above' },
//     ];

//     protected _preferredOverlayOrigin?: ElementRef;

//     constructor() {
//         this._panelDoneAnimatingStream
//             .pipe(distinctUntilChanged(), takeUntilDestroyed())
//             .subscribe(() => {
//                 this.stateChange.emit(this.panelOpen);
//                 if (this.panelOpen) {
//                     this.panelStateChanged();
//                     this.onOpened();
//                 }
//             });

//         this._viewportRuler
//             .change()
//             .pipe(takeUntilDestroyed())
//             .subscribe(() => {
//                 if (this.panelOpen) {
//                     this._syncOverlaySize();
//                     this._changeDetectorRef.detectChanges();
//                 }
//             });
//     }

//     toggle(): void {
//         this.panelOpen ? this.close('Toggle') : this.open();
//     }

//     open(): void {
//         if (this._parentFormField) {
//             this._preferredOverlayOrigin = this._parentFormField.getConnectedOverlayOrigin();
//         }

//         if (this._canOpen()) {
//             this.openCore();
//             this._changeDetectorRef.markForCheck();
//         }
//     }

//     close(reason: CloseReson): void {
//         if (this._panelOpen) {
//             this.onDetaching(this._lastAttached);
//             this._overlayRef?.detach();
//             this._lastAttached = undefined;
//             this._panelOpen = false;
//             this._changeDetectorRef.markForCheck();
//             this.onClosed(reason);
//         }
//         this.panelStateChanged();
//     }


//     focus(options?: FocusOptions): void {
//         this._elementRef.nativeElement.focus(options);
//     }

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     protected onClosed(reason: CloseReson) { /* */ }
//     protected onOpened() { /* */ }
//     protected panelStateChanged() {/* */ }
//     protected positioningSettled() {/* */ }

//     protected openCore() {
//         this._panelOpen = true;
//         this._overlayRef ??= this._overlay.create(this.isDialog ? this._getOverlayDialogConfig() : this._getOverlayPopupConfig());
//         const portalRef = this._overlayRef.attach(this.portalTemplate);
//         this.onAttached(this._lastAttached = portalRef.rootNodes.at(0));

//         this._syncOverlaySize();
//         if (!this.isModal)
//             this._overlayRef.backdropClick().pipe(take(1)).subscribe(() => { this.close('BackDrop'); });
//     }

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     protected onAttached(element: HTMLElement) { /** */ }
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     protected onDetaching(element?: HTMLElement) { /** */ }

//     protected _syncOverlaySize() {
//         if (!this._overlayRef) {
//             return;
//         }

//         this._overlayRef.updateSize(this._getOverlaySize());
//     }

//     protected _canOpen(): boolean {
//         return !this._panelOpen && !this.disabled;
//     }

//     protected _handleKeydown(event: KeyboardEvent): void {
//         if (!this.disabled) {
//             const keyCode = event.code;
//             if (this.panelOpen) {
//                 if (keyCode === 'Escape' || keyCode === 'Esc') {
//                     this.close('Escape');
//                 }
//             } else {
//                 const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'].some(v => v === keyCode);
//                 const isOpenKey = keyCode === 'Enter' || keyCode === 'Space';
//                 const hasModifierKey = event.altKey || event.shiftKey || event.ctrlKey || event.metaKey;
//                 if ((isOpenKey && !hasModifierKey) || (event.altKey && isArrowKey)) {
//                     event.preventDefault();
//                     this.open();
//                 }
//             }
//         }
//     }

//     protected _getOverlaySize(): OverlaySizeConfig {
//         let width: string | number;
//         if (!this.panelWidth || this.panelWidth === 'auto') {
//             const refToMeasure = this._preferredOverlayOrigin ?? this.toggleTrigger;
//             width = refToMeasure.nativeElement.getBoundingClientRect().width;
//         } else {
//             width = this.panelWidth;
//         }
//         return { width };
//     }

//     private _getOverlayPopupConfig(): OverlayConfig {
//         const positionStrategy = this._overlay.position()
//             .flexibleConnectedTo(this._preferredOverlayOrigin ?? this.toggleTrigger)
//             .withPush(false)
//             .withViewportMargin(8)
//             .withPositions(this.connectedPosition);

//         const scrollStrategy = this._overlay.scrollStrategies.reposition();

//         const panelClass = ['nova-drop-down-popup'];
//         if (typeof this.panelClass === 'string')
//             panelClass.push(this.panelClass);
//         else if (Array.isArray(this.panelClass))
//             panelClass.push(...this.panelClass);
//         return new OverlayConfig({
//             positionStrategy,
//             scrollStrategy,
//             hasBackdrop: true,
//             panelClass,
//             backdropClass: 'cdk-overlay-transparent-backdrop'
//         });
//     }

//     private _getOverlayDialogConfig(): OverlayConfig {
//         const positionStrategy = this._overlay.position().global().centerHorizontally().centerVertically();
//         const scrollStrategy = this._overlay.scrollStrategies.block();
//         const panelClass = ['nova-drop-down-dialog'];
//         if (typeof this.panelClass === 'string')
//             panelClass.push(this.panelClass);
//         else if (Array.isArray(this.panelClass))
//             panelClass.push(...this.panelClass);
//         return new OverlayConfig({
//             positionStrategy,
//             scrollStrategy,
//             hasBackdrop: true,
//             panelClass,
//             backdropClass: 'cdk-overlay-dark-backdrop'
//         });
//     }
// }