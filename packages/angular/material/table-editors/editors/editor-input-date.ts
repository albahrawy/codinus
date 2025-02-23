import { Component, ElementRef, viewChild } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { MatInputModule } from '@angular/material/input';
import { CSDateFormatDirective, CSDateInput, CSDateMaskInput } from '@ngx-codinus/material/inputs';
import { CSTableEditorElementBase } from '@ngx-codinus/material/table';
import { ICSTableDateEditOptions } from '../shared/element-args-types';

@Component({
    selector: 'cs-table-editor-date',
    template: `
        <input #_inputElement class="cs-table-editor-inner-input" inputType="date" [min]="options().min!" 
        [max]="options().max!" [dateFormat]="options().dateFormat" [(ngModel)]="bindingValue"
        [matDatepickerFilter]="dateFilter()!" matInput color="primary" 
        [dateClass]="dateClass()" [startView]="options().startView" 
        (keydown.escape)="undo()" (keydown.enter)="commit(true)" />
        `,
    imports: [MatInputModule, CSDateMaskInput, CSDateFormatDirective, CSDateInput, FormsModule],
})

export class CSTableEditorDate extends CSTableEditorElementBase<Date, ICSTableDateEditOptions> {

    private _inputElement = viewChild<ElementRef<HTMLInputElement>>("_inputElement");
    private _csDateInput = viewChild(CSDateInput);

    protected dateClass = this.signalActionFromFunctionOrConfig('dateClass');
    protected dateFilter = this.signalActionFromFunctionOrConfig('dateFilter');

    override initialize(): void {
        super.initialize();
        setTimeout(() => {
            this._inputElement()?.nativeElement.select();
            this._csDateInput()?.open();
        }, 10);
    }
}