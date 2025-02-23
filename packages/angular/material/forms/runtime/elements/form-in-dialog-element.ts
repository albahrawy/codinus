import { Component, effect, ElementRef, viewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CSMatFormFieldControl } from '@ngx-codinus/material/inputs';
import { CSRuntimeFormDialogElementHostBase } from '../cs-element-base/dialog-element-host';
import { CSFormTemplateOutlet } from '../cs-form-template-outlet';
import { CODINUS_RUNTIME_FORM_SECTION } from '../injection-tokens';

@Component({
    selector: 'cs-runtime-form-element-dialog',
    template: `
            <button csMatFormFieldControl mat-icon-button class="button-open" (click)="openDialog($event)">
                <mat-icon>grid_view</mat-icon>
            </button>
            <div style="display: none;">
                <div #container>
                    <ng-container *csFormTemplateOutlet="dialogConfig()">
                    </ng-container>
                </div>
            </div>
    `,
    styles: [`
        .cs-runtime-form-element-dialog{
            display:flex;
            .button-open {
                position: absolute;
                top: 0%;
                bottom: 0;
                right: 0;
                margin-top: auto;
                margin-bottom: auto;
                overflow:hidden;
            }
        }
        
        .cs-runtime-form-dialog-panel .cs-dialog-content-area{
            padding:0 !important;
        }
        `],
    encapsulation: ViewEncapsulation.None,
    imports: [CSMatFormFieldControl, MatButtonModule, MatIconModule, CSFormTemplateOutlet],
    providers: [{ provide: CODINUS_RUNTIME_FORM_SECTION, useExisting: CSFormElementDialog }]
})

export class CSFormElementDialog extends CSRuntimeFormDialogElementHostBase {

    private _mfc = viewChild(CSMatFormFieldControl);
    private _elementRef = viewChild('container', { read: ElementRef });

    protected override getComponent() {
        return this._elementRef()?.nativeElement;
    }

    constructor() {
        super();
        effect(() => {
            this._mfc()?.setNgControl(this.csFormControl());
        });

    }
}