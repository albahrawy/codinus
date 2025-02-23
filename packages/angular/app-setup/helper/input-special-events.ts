import { ICSFormComponentSetupEvent } from "./types";

export const FORM_COMPONENT_VALIDATORS: ICSFormComponentSetupEvent[] = [
    {
        name: 'AsyncValidator',
        codePattern: '(control: AbstractControl): Observable<ValidationErrors | null>',
        imports: [
            { type: 'AbstractControl', path: 'ng-core' },
            { type: 'ValidationErrors', path: 'ng-core' },
            { type: 'Observable', path: 'ng-observable' }
        ]
    },
    {
        name: 'Validator',
        codePattern: '(control: AbstractControl): ValidationErrors | null',
        imports: [
            { type: 'AbstractControl', path: 'ng-core' },
            { type: 'ValidationErrors', path: 'ng-core' },
        ]
    }
];