import { Component, viewChildren } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { CODINUS_CDK_FLEX_DIRECTIVES } from '@ngx-codinus/core/layout';
import { CSNamedTemplate } from '@ngx-codinus/core/outlet';
import { CSImageIcon } from '@ngx-codinus/material/buttons';
import { CSFormPortal, CSFormPortalWithHints } from '../cs-form-portal';
import { ICSFormTemplateProviderComponent } from '../injection-tokens';

@Component({
    selector: 'cs-default-runtime-template',
    templateUrl: './runtime-form-templates.html',
    imports: [
        CSFormPortal, CSFormPortalWithHints, CSNamedTemplate, MatFormFieldModule, CSImageIcon, CSTranslatePipe,
        CODINUS_CDK_FLEX_DIRECTIVES, MatIconModule, MatButtonModule
    ],
})

export class CSDefaultRuntimeTemplateContainer implements ICSFormTemplateProviderComponent {
    templates = viewChildren(CSNamedTemplate);
}