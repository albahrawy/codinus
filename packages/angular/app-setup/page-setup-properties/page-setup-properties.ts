import { ChangeDetectionStrategy, Component, effect, forwardRef, inject, input, output, viewChild } from '@angular/core';
import { ControlContainer, FormGroupDirective, NgControl } from '@angular/forms';
import { MAT_FORM_FIELD, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CODINUS_FORM_SECTION, CodinusFormsModule } from '@ngx-codinus/core/forms';
import { CODINUS_CDK_FLEX_DIRECTIVES } from '@ngx-codinus/core/layout';
import { CSFormSection } from '@ngx-codinus/material/forms';
import { CSMatFormFieldControl } from '@ngx-codinus/material/inputs';
import { IAppPageInfo } from '../helper/types';
import { Nullable } from '@codinus/types';

@Component({
    selector: 'cs-page-setup-properties',
    templateUrl: './page-setup-properties.html',
    styleUrl: './page-setup-properties.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CODINUS_CDK_FLEX_DIRECTIVES, CSMatFormFieldControl, CSFormSection, MatFormFieldModule, MatInputModule, CodinusFormsModule],
    // providers: [
    //     { provide: MAT_FORM_FIELD, useValue: null },
    //     { provide: ControlContainer, useExisting: forwardRef(() => CSPageSetupProperties) },
    //     { provide: FormGroupDirective, useExisting: forwardRef(() => CSPageSetupProperties) },
    //     { provide: CODINUS_FORM_SECTION, useExisting: forwardRef(() => CSPageSetupProperties) },

    // ]
})

export class CSPageSetupProperties {

    needRefresh = output<string>();

    protected _onNameChanged(name: unknown) {
        this.needRefresh.emit(name as string);
    }

    protected normalFieldSpan = `1`;

    // private csFormSection = viewChild.required(CSMatFormFieldControl);
    // private ngControl = inject(NgControl, { optional: true, self: true });

    /**
     *
     */
    constructor() {
        // effect(() => {
        //     if (this.ngControl && this.csFormSection())
        //         this.ngControl.valueAccessor = this.csFormSection();
        // });

    }
}