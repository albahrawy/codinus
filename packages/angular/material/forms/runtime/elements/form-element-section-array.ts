import { Component, computed, effect, viewChild } from '@angular/core';
import { getProperCssValue } from '@codinus/dom';
import { arrayToObject } from '@codinus/js-extensions';
import { IAction } from '@codinus/types';
import { CodinusFormsModule } from '@ngx-codinus/core/forms';
import { CODINUS_CDK_FLEX_DIRECTIVES } from '@ngx-codinus/core/layout';
import { CSButtonContainer, CSFormFieldToolBar, ICSButtonArgs, ICSButtonConfig } from '@ngx-codinus/material/buttons';
import {
    ConextMenuOpenArgs, CSContextMenuDirective,
    IContextMenuClickArgs, IContextMenuItem
} from '@ngx-codinus/material/context-menu';
import { CSFormSectionArray, CSFormSectionArrayContent } from '../../sections';
import { CSFormElementBindingBase } from '../cs-element-base/form-element-binding-base';
import { CSFormTemplateOutlet } from '../cs-form-template-outlet';
import { CODINUS_RUNTIME_FORM_SECTION } from '../injection-tokens';
import { ICSRuntimeFormFieldSectionArray } from './_types';

@Component({
    selector: 'cs-runtime-form-section-array',
    template: `
            <cs-button-container cs-form-field-bar [buttons]="speedButtons()" [absolute]="true"
             [disabled]="sectionArray.disabled" (buttonClicked)="onSpeedBtnClicked(sectionArray,$event)">
            </cs-button-container>
            <cs-form-section-array #sectionArray
            [required]="!!config().required" [displayMember]="displayMember()" [disableMember]="disableMember()"
            [iconMember]="iconMember()" style="display:block;" [style.height]= "height()"
            [multiple]="config().multiple" [showIndex]="config().showIndex" [showTitle]="config().showTitle!==false"
            [showSearch]="config().showSearch" [enableDrag]="config().enableDrag" [optionHeight]="config().optionHeight"
            [readOnly]="config().readOnly" [iconType]="config().iconType"
            [csContextMenu]="config().contextMenu" [contextMenuItems]="contextMenuItems()" 
            (contextMenuClick)="contextMenuClick()?.($event)" [contextMenuOpen]="contextMenuOpen()"
            [csFormControlName]="config().dataKey" [asyncValidators]="asyncValidator()" [validators]="validator()">
            <cs-flex-grid-container *csformSectionArrayContent [flex-grid-align]="config().flexAlign"
            [flex-grid-gap]="config().flexGap" [flex-grid-columns]="config().flexColumns">
                @for (element of config().children; track element) {
                    @if(!element.renderState?.hidden()){
                        <ng-container *csFormTemplateOutlet="element; section: sectionArray.groupDirective;"></ng-container>
                    }
                }
            </cs-flex-grid-container>
            </cs-form-section-array>
    `,
    imports: [
        CodinusFormsModule, CSFormSectionArray, CSFormSectionArrayContent,
        CSFormTemplateOutlet, CSContextMenuDirective, ...CODINUS_CDK_FLEX_DIRECTIVES, CSButtonContainer, CSFormFieldToolBar
    ],
    providers: [{ provide: CODINUS_RUNTIME_FORM_SECTION, useExisting: CSFormElementSectionArray }]
})

export class CSFormElementSectionArray extends CSFormElementBindingBase<ICSRuntimeFormFieldSectionArray> {

    protected height = computed(() => getProperCssValue(this.config().height) ?? 'auto');
    protected readonly contextMenuOpen = this.signalFunctionOf<IAction<ConextMenuOpenArgs>>("ContextMenuOpen");
    protected readonly contextMenuClick = this.signalFunctionOf<IAction<IContextMenuClickArgs>>("ContextMenuClick");
    protected readonly contextMenuItems = this.signalFunctionValueOf<IContextMenuItem[] | null>("ContextMenuItems");

    private _speedButtons = this.signalFunctionOf<(table: CSFormSectionArray, args: ICSButtonArgs) => void>('selectionChange');
    private _speedButton = viewChild(CSButtonContainer);
    private _sectionArray = viewChild(CSFormSectionArray);

    protected speedButtons = computed<ICSButtonConfig>(() => {
        const baseButtons = {
            add: { icon: 'add', disabled: false, isFab: true },
            remove: { icon: 'delete', disabled: true, isFab: true }
        };
        const customButtons = arrayToObject(this.config().buttons ?? [], v => [v.name, { icon: v.icon, disabled: v.disabled }]);
        return { ...baseButtons, ...customButtons };
    });

    constructor() {
        super();
        effect(() => this._speedButton()?.setButtonDisabledState('remove', !this._sectionArray()?.hasCurrent()));
    }


    protected onSpeedBtnClicked(sectionArray: CSFormSectionArray, args: ICSButtonArgs) {
        switch (args.key) {
            case 'add':
                sectionArray.addNew();
                break;
            case 'remove':
                sectionArray.remove();
                break;
            default:
                this._speedButtons?.()?.(sectionArray, args);
                break;
        }
    }
}
