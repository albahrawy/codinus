import { InjectionToken } from "@angular/core";
import { ControlContainer, Form, FormGroup, FormGroupDirective, ValidationErrors } from "@angular/forms";
import { CSAbstractFormControlName } from "./form-control-name";

export const CODINUS_FORM_SECTION = new InjectionToken<ICSFormSection>('codinus-form-section');
export const CODINUS_RUNTIME_CONTROL_CONTAINER = new InjectionToken<ControlContainer>('cs-runtime-control-container');

export const CODINUS_FORM_VALIDATOR = new InjectionToken<ICSFormValidator>('codinus-form-validator');
// export const CODINUS_FORM = new InjectionToken<ICSForm>('codinus-form');

export interface ICSFormSection {
    readonly formDirective: Form | null;
    readonly form: FormGroup;
    readonly parentCSFormGroupDirective: FormGroupDirective | null;
    readonly hasNgControl: boolean;
    // readonly isFormSection: boolean;
    refreshRegistrations(): void;
    registerDir(dir: CSAbstractFormControlName): void;
    unRegisterDir(dir: CSAbstractFormControlName): void;
}

export interface ICSFormValidator {
    validate(): ValidationErrors | null;
}

// export interface ICSForm {
//     /** */
// }