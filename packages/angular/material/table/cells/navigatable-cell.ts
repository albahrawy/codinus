import { Directive, effect, ElementRef, inject, OnDestroy } from "@angular/core";
import { createEventManager } from "@ngx-codinus/core/events";
import { KeyboardNavigationType } from "../api";
import { CSInteractiveTableDirective } from "../features";

@Directive({
    selector: 'mat-cell,cdk-cell',
})
export class CSTableNavigatableCell implements OnDestroy {

    protected _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
    protected _interactiveTable = inject(CSInteractiveTableDirective, { optional: true });

    protected _eventManager = createEventManager();
    private _binded = false;

    constructor() {
        effect(() => this._setupKeyboardNavigation(this._interactiveTable?.navigationMode()));
    }

    private _setupKeyboardNavigation(type: KeyboardNavigationType | undefined): void {
        if (!type?.includes('cell')) {
            if (this._binded) {
                this._elementRef.nativeElement.removeAttribute('tabindex');
                this._eventManager.unRegister('keyboard');
            }
            return;
        }
        this._binded = true;
        const cellElement = this._elementRef.nativeElement;
        cellElement.tabIndex = 0;
        this._eventManager.listenAndRegister<KeyboardEvent>('keyboard', cellElement, 'keydown',
            e => this._interactiveTable?.moveByCell(e, cellElement));
    }

    ngOnDestroy(): void {
        this._eventManager.unRegisterAll();
    }
}