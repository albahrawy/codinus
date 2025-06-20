import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CSTableEditorElementBase } from '@ngx-codinus/material/table';

@Component({
    selector: 'cs-table-editor-checkbox',
    template: `
        <div class="mdc-checkbox" [class.mdc-checkbox--disabled]="!canEdit()" 
            (click)="commitValue(_input.checked)">
            <input type="checkbox" #_input class="mdc-checkbox__native-control" 
            [checked]="editHandler().value()"   />
            <div class="mdc-checkbox__background" >
            <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24" aria-hidden="true">
                <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
            </svg>
            </div>
        </div>
    `,
    encapsulation: ViewEncapsulation.None,
    imports: [MatInputModule, FormsModule]
})

export class CSTableEditorCheckBox extends CSTableEditorElementBase<boolean> {

    static isSelfViewHandled = true;
}