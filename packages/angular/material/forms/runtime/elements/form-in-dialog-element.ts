import { NgTemplateOutlet } from '@angular/common';
import { Component, effect, ElementRef, viewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LayoutFlexDirective } from '@ngx-codinus/core/layout';
import { CSRuntimeFormDialogElementHostBase } from '../cs-element-base/dialog-container-base';
import { CSMatFormFieldControl } from '@ngx-codinus/material/inputs';
import { CSRunTimeFormTemplate } from '../cs-form-template.pipe';

@Component({
    selector: 'cs-runtime-form-element-dialog',
    template: `
            <button csMatFormFieldControl mat-icon-button class="button-open" (click)="openDialog($event)">
                <mat-icon>grid_view</mat-icon>
            </button>
            <div #container style="display: none;">
                <div layout-flex="row wrap">
                    <ng-container *ngTemplateOutlet="templates()|csFormTemplate:dialogConfig().templateName:dialogConfig().type; 
                        context: {$implicit:dialogConfig(),parentSection}">
                    </ng-container>
                </div>
            </div>
    `,
    styles: [`
        :host{
            display:flex;
        }
        .button-open {
            position: absolute;
            top: 0%;
            bottom: 0;
            right: 0;
            margin-top: auto;
            margin-bottom: auto;
        }
        .form-dialog-panel .cs-dialog-content-area{
            padding:0 !important;
        }
        `],
    encapsulation: ViewEncapsulation.None,
    imports: [CSMatFormFieldControl, MatButtonModule, MatIconModule, NgTemplateOutlet,
        CSRunTimeFormTemplate, LayoutFlexDirective],
})

export class CSFormElementDialog extends CSRuntimeFormDialogElementHostBase {

    private _mfc = viewChild(CSMatFormFieldControl);
    private _elementRef = viewChild('container', { read: ElementRef });

    protected override getComponent() {
        return this._elementRef()?.nativeElement.firstChild;
    }

    constructor() {
        super();
        effect(() => {
            this._mfc()?.setNgControl(this.csFormControl());
        });

    }
}