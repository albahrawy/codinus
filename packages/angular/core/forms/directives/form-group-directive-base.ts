import { AfterViewInit, Directive, Input, inject, signal } from "@angular/core";
import { FormControl, FormControlName, FormGroupDirective } from "@angular/forms";
import { isString } from "@codinus/js-extensions";
import { CSFormGroup } from "../models/form-group";
import { CSAbstractFormControlName, CSFormControlName, CSSectionFormControlName } from "./form-control-name";
import { CSSectionFormControl } from "../models/section-form-control";

@Directive()
export abstract class CSFormGroupDirectiveBase extends FormGroupDirective implements AfterViewInit {

    private _initialized = false;

    parentCSFormGroupDirective = inject(FormGroupDirective, { optional: true, skipSelf: true });

    override readonly form = new CSFormGroup(false);
    directiveLength = signal(0);

    @Input()
    get formGroup() { return this.form; }
    set formGroup(value: CSFormGroup) { /** */ }

    ngAfterViewInit(): void {
        this._initialized = true;
        this.form.initialize();
    }

    override addControl(dir: FormControlName): FormControl {
        const ctrl: unknown = this.form.get(dir.path);
        if (!ctrl) {
            const ctrlName = dir.name as string;
            this.form.addControl(ctrlName, this._createFormControl(dir, ctrlName), { emitEvent: this._initialized });
        }
        const superControl = super.addControl(dir);
        this.directiveLength.set(this.directives.length);
        return superControl;
    }

    override removeControl(dir: FormControlName): void {
        if (dir instanceof CSAbstractFormControlName && isString(dir.name))
            this.form.removeControl(dir.name, { emitEvent: this._initialized });
        super.removeControl(dir);
    }


    private _createFormControl(dir: FormControlName, ctrlName: string) {
        if (dir.control)
            return dir.control;
        let control;
        if (dir instanceof CSSectionFormControlName) {
            control = new CSSectionFormControl(
                { value: dir.defaultValue, disabled: dir.initialDisableStatus() },
                { nonNullable: dir.defaultValue != null });
            control.setSectionFormName(dir);
        } else if (dir instanceof CSFormControlName) {
            control = new FormControl(
                { value: dir.defaultValue, disabled: dir.initialDisableStatus() },
                { nonNullable: dir.defaultValue != null });
        } else {
            control = new FormControl();
        }
        const _pendingValue = this.form.getPendingValue(ctrlName);
        if (_pendingValue != null)
            control.reset(_pendingValue, {
                emitEvent: this._initialized
            });
        return control;
    }
}
