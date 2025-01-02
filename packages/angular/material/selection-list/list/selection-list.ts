import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import {
    AfterViewChecked,
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, Injector, Input, OnChanges,
    OnDestroy, ViewEncapsulation,
    booleanAttribute,
    forwardRef,
    inject
} from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatList, MatListModule } from '@angular/material/list';
import { NOVA_CONTEXT_MENU_PARENT } from '@ngx-nova/cdk/directives';
import { EvaluatePipe } from '@ngx-nova/cdk/pipes';
import { createMFFCWrapper } from '@ngx-nova/cdk/shared';
import { NOVA_SELECTION_LIST, NovaListOption } from '../option/list-option';
import { NovaSelectionListPanel } from './selection-list-panel';


@Component({
    selector: 'nova-selection-list',
    exportAs: 'novaSelectionList',
    templateUrl: './selection-list.html',
    styleUrls: ['./selection-list.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, MatDividerModule, EvaluatePipe, NovaListOption,
        MatIconModule, MatListModule, ScrollingModule, NgTemplateOutlet, CdkDropList, CdkDrag],
    providers: [
        {
            provide: MatFormFieldControl,
            useFactory: (component: NovaSelectionList) => component._formFieldControlWrapper,
            deps: [forwardRef(() => NovaSelectionList)],
        },
        { provide: MatList, useExisting: NovaSelectionList },
        { provide: NOVA_SELECTION_LIST, useExisting: NovaSelectionList },
        { provide: NOVA_CONTEXT_MENU_PARENT, useExisting: NovaSelectionList },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovaSelectionList<TRow = unknown, TValue = unknown> extends NovaSelectionListPanel<TRow, TValue>
    implements AfterViewInit, AfterViewChecked, OnChanges, OnDestroy, DoCheck {

    private readonly _changeDetectorRef = inject(ChangeDetectorRef);
    private readonly _formFieldControlWrapper = createMFFCWrapper(this, inject(Injector));

    get shouldLabelFloat(): boolean { return true; }
    get empty(): boolean { return !this.value || (Array.isArray(this.value) && !this.value.length); }

    @Input() id: string = this._formFieldControlWrapper.id;

    @Input()
    get errorStateMatcher(): ErrorStateMatcher | undefined { return this._formFieldControlWrapper.errorStateMatcher; }
    set errorStateMatcher(value: ErrorStateMatcher | undefined) { this._formFieldControlWrapper.errorStateMatcher = value; }

    @Input()
    get placeholder(): string { return this._formFieldControlWrapper.placeholder; }
    set placeholder(value: string) { this._formFieldControlWrapper.placeholder = value; }

    @Input({ transform: booleanAttribute })
    get required(): boolean { return this._formFieldControlWrapper.required; }
    set required(value: boolean) { this._formFieldControlWrapper.required = value; }

    ngDoCheck(): void {
        this._formFieldControlWrapper.updateErrorState();
    }

    override ngOnDestroy() {
        super.ngOnDestroy();
        this._formFieldControlWrapper.destroy();
    }

    protected override notifyFocused(focused: boolean) {
        this._formFieldControlWrapper.setFocused(focused);
    }

    //#region ControlValueAccessor

    protected override _notifyValueChange() {
        this._formFieldControlWrapper.notifyChange(this.value);
    }

    override _notifyTouched() {
        this._formFieldControlWrapper.notifyTouched();
    }

    writeValue(value: TValue[] | TValue | null): void {
        this._setValue(value);
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this._markOptionsForCheck();
        this._changeDetectorRef.markForCheck();
        this._formFieldControlWrapper.changeState();
    }

    //#endregion
}