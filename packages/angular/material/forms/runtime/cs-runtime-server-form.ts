import { Component, forwardRef, input, ViewEncapsulation } from '@angular/core';
import { ControlContainer, FormGroupDirective } from '@angular/forms';
import { Nullable } from '@codinus/types';
import { CODINUS_UPLOAD_MANAGER } from '@ngx-codinus/core/shared';
import { ICSRuntimeFormConfig, ICSRuntimeFormFieldBase } from './cs-element-base/types';
import { CSFormPortal } from './cs-form-portal';
import { CSRuntimeFormBase } from './cs-runtime-form-base';
import { CODINUS_RUNTIME_FORM_HANDLER, ICSRuntimeFormEvents } from './injection-tokens';

@Component({
    selector: 'cs-runtime-server-form',
    template: `
    <ng-content select="[before]" />
        <ng-container [cs-form-portal]="rootArea()"></ng-container>
    <ng-content />
    `,
    encapsulation: ViewEncapsulation.None,
    imports: [CSFormPortal],
    providers: [
        {
            provide: CODINUS_RUNTIME_FORM_HANDLER,
            useFactory: (csForm: CSRuntimeServerForm) => csForm._formHandler,
            deps: [forwardRef(() => CSRuntimeServerForm)],
        },
        { provide: CODINUS_UPLOAD_MANAGER, useExisting: CSRuntimeServerForm },
        { provide: ControlContainer, useExisting: forwardRef(() => CSRuntimeServerForm) },
        { provide: FormGroupDirective, useExisting: forwardRef(() => CSRuntimeServerForm) }
    ]
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class CSRuntimeServerForm<TField extends ICSRuntimeFormFieldBase = any> extends CSRuntimeFormBase<TField> {
    override events = input<Nullable<ICSRuntimeFormEvents<TField>>>(null);
    override config = input.required<ICSRuntimeFormConfig>();
    override prefix = input<Nullable<string>>();
}
