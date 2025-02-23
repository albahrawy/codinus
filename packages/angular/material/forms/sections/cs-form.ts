import { Component, forwardRef } from '@angular/core';
import { ControlContainer, FormGroupDirective } from '@angular/forms';
import { CODINUS_UPLOAD_MANAGER } from '@ngx-codinus/core/shared';
import { CSFormBase } from './cs-form-base';

@Component({
    selector: 'cs-form',
    exportAs: 'csForm',
    template: '<ng-content/>',
    providers: [
        { provide: CODINUS_UPLOAD_MANAGER, useExisting: CSForm },
        { provide: ControlContainer, useExisting: forwardRef(() => CSForm) },
        { provide: FormGroupDirective, useExisting: forwardRef(() => CSForm) }
    ]
})
export class CSForm extends CSFormBase { }
