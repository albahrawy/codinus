import { Provider, Type } from '@angular/core';
import { CSFormComponentFactory } from './cs-form-component-factory';
import { CODINUS_RUNTIME_FORM_COMPONENT_FACTORY, ICSRuntimeFormComponentFactory } from './injection-tokens';

export * from './cs-element-base/dialog-element-host';
export * from './cs-element-base/form-element-base';
export * from './cs-element-base/form-element-binding-base';
export * from './cs-element-base/form-element-validable-base';
export * from './cs-element-base/types';
export * from './elements/_types';

export * from './cs-form-component-factory';
export * from './cs-form-portal';
export * from './cs-form-template-outlet';
export * from './cs-form-template-provider';
export * from './cs-form-template.pipe';
export * from './cs-runtime-form';
export * from './cs-runtime-form-base';
export * from './functions';
export * from './injection-tokens';
export * from './cs-runtime-from-handler';

export function provideCodinusRuntimeForms(customFactory?: Type<ICSRuntimeFormComponentFactory>): Provider {
    return { provide: CODINUS_RUNTIME_FORM_COMPONENT_FACTORY, useExisting: customFactory ?? CSFormComponentFactory };
}