import { Directive, ElementRef, computed, effect, inject } from "@angular/core";
import { CSRowDataDirective } from "../data/row-data.directive";
import { CSInteractiveTableDirective } from "./table-interactive.directive";
import { createEventManager } from "@ngx-codinus/core/events";
import { KeyboardNavigationType } from "../api";

@Directive({
    selector: "mat-row, cdk-row",
    host: {
        '[class.cs-table-row-selected]': 'isSelected()',
    },
    hostDirectives: [CSRowDataDirective],
})
export class CSInteractiveRowDirective {

    private _rowDataDirective = inject(CSRowDataDirective, { self: true });
    private _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
    private _interactiveTable = inject(CSInteractiveTableDirective, { optional: true });
    private _eventManager = createEventManager();

    constructor() {
        effect(() => this._setupSelection(this.selectionEnabled()));
        effect(() => this._setupKeyboardNavigation(this._interactiveTable?.navigationMode()));
    }

    isSelected = computed(() => {
        return this.selectionEnabled() && (this._interactiveTable?.isSelected(this._rowDataDirective.data) ?? false);
    });

    _toggle() {
        if (this.selectionEnabled()) {
            this._interactiveTable?.toggle(this._rowDataDirective.data);
        }

    }

    protected selectionEnabled = computed(() => this._interactiveTable?.selectable() != 'none' && this._rowDataDirective.data);

    private _setupSelection(enabled: boolean): void {
        if (!enabled)
            this._eventManager.unRegister('select');
        else if (!this._eventManager.has('select'))
            this._eventManager.listenAndRegister('select', this._elementRef.nativeElement,
                ['click', 'keydown.space'], e => this._selectFromEvent(e));
    }

    private _setupKeyboardNavigation(type: KeyboardNavigationType | undefined): void {
        const rowElement = this._elementRef.nativeElement;
        if (type === 'row') {
            rowElement.tabIndex = 0;
            this._eventManager.listenAndRegister<KeyboardEvent>('keyboard', rowElement, 'keydown',
                e => this._interactiveTable?.moveByRow(e, rowElement));
        } else {
            rowElement.tabIndex = -1;
            this._eventManager.unRegister('keyboard');
        }
    }

    //TODO:re-think about why we need to check children
    private _selectFromEvent(e: Event): void {
        if ((e as PointerEvent).detail === 2)
            return;
        let shouldToggle = this._elementRef.nativeElement === e.target;
        if (!shouldToggle) {
            const rowCells = Array.from(this._elementRef.nativeElement.children);
            shouldToggle = rowCells.includes(e.target as HTMLElement) ||
                rowCells.find(r => r.contains(e.target as HTMLElement)) != null;
        }
        if (shouldToggle)
            this._toggle();
    }
}
