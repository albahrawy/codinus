import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CSTableEditorElementBase } from '@ngx-codinus/material/table';

@Component({
    selector: 'cs-table-editor-text',
    template: `
        <input #_inputElement matInput class="cs-table-editor-inner-input" 
        (keydown.escape)="undo()" (keydown.enter)="commit()" [(ngModel)]="bindingValue" />
        `,
    imports: [MatInputModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class CSTableEditorText extends CSTableEditorElementBase<string> {

    private _inputElement = viewChild<ElementRef<HTMLInputElement>>("_inputElement");

    override initialize(): void {
        super.initialize();
        this._inputElement()?.nativeElement.select();
    }
}