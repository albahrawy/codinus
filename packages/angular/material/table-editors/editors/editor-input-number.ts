import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CSNumericInput } from '@ngx-codinus/material/inputs';
import { CSTableEditorElementBase } from '@ngx-codinus/material/table';
import { ICSTableNumberEditOptions } from '../shared/element-args-types';

@Component({
    selector: 'cs-table-editor-number',
    template: `
        <input #_inputElement matInput inputType="numeric" class="cs-table-editor-inner-input" 
        [mode]="options().mode" [allowArrowKeys]="options().allowArrowKeys" [currency]="options().currency" 
        [step]="options().step" [min]="options().min" [max]="options().max" [locale]="options().locale"
        [thousandSeparator]="options().thousandSeparator" [percentage]="options().percentage" 
        [decimalDigits]="options().decimalDigits" [showButtons]="options().showButton"
        (keydown.escape)="undo()" (keydown.enter)="commit()" 
        [(ngModel)]="bindingValue" />
        `,
    imports: [MatInputModule, FormsModule, CSNumericInput],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CSTableEditorNumber extends CSTableEditorElementBase<number | bigint, ICSTableNumberEditOptions> {

    private _inputElement = viewChild<ElementRef<HTMLInputElement>>("_inputElement");

    override initialize(): void {
        super.initialize();
        this._inputElement()?.nativeElement.select();
    }
}