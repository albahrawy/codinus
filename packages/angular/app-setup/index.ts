import { Type, Provider } from '@angular/core';
import { CSFormComponentFactory } from '@ngx-codinus/material/forms';
import { ICSFormComponentSetupFactory, CODINUS_FORM_COMPONENT_SETUP_FACTORY } from './helper/types';

export * from './page-setup-main/cs-page-setup'


export function provideCodinusRuntimeFormSetup(customFactory?: Type<ICSFormComponentSetupFactory>): Provider {
    return { provide: CODINUS_FORM_COMPONENT_SETUP_FACTORY, useExisting: customFactory ?? CSFormComponentFactory };
}