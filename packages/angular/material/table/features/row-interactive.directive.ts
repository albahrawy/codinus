import { Directive, ElementRef, computed, effect, inject } from "@angular/core";
import { createEventManager } from "@ngx-codinus/core/events";
import { KeyboardNavigationType } from "../api";
import { CSRowDataContextBase } from "../data/data-context.directive";
import { CSInteractiveTableDirective } from "./table-interactive.directive";
import { preventEvent } from "@codinus/dom";

@Directive({
    selector: "cdk-row, mat-row",
    host: {
        '[class.cs-table-row-selected]': 'isSelected()',
    },
})
export class CSInteractiveRowDirective<T> extends CSRowDataContextBase<T> {
    private _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
    private _interactiveTable = inject(CSInteractiveTableDirective, { optional: true });
    private _eventManager = createEventManager();
    private _binded = false;

    constructor() {
        super();
        effect(() => this._setupSelection(this.selectionEnabled()));
        effect(() => this._setupKeyboardNavigation(this._interactiveTable?.navigationMode()));
    }

    isSelected = computed(() => {
        return this.selectionEnabled() && (this._interactiveTable?.isSelected(this.rowData) ?? false);
    });

    _toggle() {
        if (this.selectionEnabled()) {
            this._interactiveTable?.toggle(this.rowData);
        }
    }

    protected selectionEnabled = computed(() =>
        this._interactiveTable?.selectable() != 'none' && this.rowData != null);

    private _setupSelection(enabled: boolean): void {
        if (!enabled)
            this._eventManager.unRegister('select');
        else if (!this._eventManager.has('select'))
            this._eventManager.listenAndRegister('select', this._elementRef.nativeElement,
                ['click', 'keydown.space'], e => this._selectFromEvent(e));
    }

    private _setupKeyboardNavigation(type: KeyboardNavigationType | undefined): void {
        if (type !== 'row') {
            if (this._binded) {
                this._elementRef.nativeElement.removeAttribute('tabindex');
                this._eventManager.unRegister('keyboard');
            }
            return;
        }
        const rowElement = this._elementRef.nativeElement;
        rowElement.tabIndex = 0;
        this._eventManager.listenAndRegister<KeyboardEvent>('keyboard', rowElement, 'keydown',
            e => this._interactiveTable?.moveByRow(e, rowElement));
    }

    //TODO:re-think about why we need to check children
    private _selectFromEvent(e: Event): void {
        if ((e as PointerEvent).detail === 2 || this._interactiveTable?.inEditMode)
            return;
        let shouldToggle = this._elementRef.nativeElement === e.target;
        if (!shouldToggle) {
            const rowCells = Array.from(this._elementRef.nativeElement.children);
            shouldToggle = rowCells.includes(e.target as HTMLElement) ||
                rowCells.find(r => r.contains(e.target as HTMLElement)) != null;
        }
        if (shouldToggle) {
            preventEvent(e);
            this._toggle();
        }

    }
}
