import { Directive, OnInit, forwardRef, output } from "@angular/core";
import { ControlContainer, FormGroupDirective } from "@angular/forms";
import { CSFormGroup } from "../models/form-group";
import { CSFormGroupDirectiveBase } from "./form-group-directive-base";

@Directive({
    selector: '[csAutoForm]',
    providers: [
        { provide: ControlContainer, useExisting: forwardRef(() => CSFormGroupDirective) },
        { provide: FormGroupDirective, useExisting: forwardRef(() => CSFormGroupDirective) }
    ],
    exportAs: 'csAutoForm',
})
export class CSFormGroupDirective extends CSFormGroupDirectiveBase implements OnInit {

    initialized = output<CSFormGroup>();

    ngOnInit(): void {
        this.initialized.emit(this.form);
    }
}
