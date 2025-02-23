import { Component, computed, effect, forwardRef, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { getValue, isEqual } from '@codinus/js-extensions';
import { noopFn, Nullable } from '@codinus/types';
import { CodinusFormsModule } from '@ngx-codinus/core/forms';
import { CODINUS_CDK_FLEX_DIRECTIVES } from '@ngx-codinus/core/layout';
import {
    CODINUS_FORM_AREA, CODINUS_RUNTIME_FORM_HANDLER, CODINUS_RUNTIME_FORM_SECTION, CSFormSectionArrayContent, CSFormSectionTree,
    CSFormTemplateOutlet, CSLocalizableInput, CSRuntimeFormHandler, ICSFormElementValueChange, ICSRuntimeFormAreaBase,
    ICSRuntimeFormFieldConfig, ICSRuntimeFormFieldNamelessConfig, ICSRuntimeFormHost
} from '@ngx-codinus/material/forms';
import { CSIconSelector } from '@ngx-codinus/material/icon-selector';
import { CSNumericInput } from '@ngx-codinus/material/inputs';
import { ChildrenAllowedListFn } from '@ngx-codinus/material/tree';
import { FlexColumnInput } from '../flex-proeprty/flex-column-input';
import { FlexPropertyInput } from '../flex-proeprty/flex-proeprty-input';
import { CSAppPagesSectionsHandler } from '../helper/cs-page-sections-handler';
import { ICSComponentSetupStandard, ICSRuntimeFormSetupFieldConfig } from '../helper/types';

interface ICSFormComponentSetupSpecialConfig {
    children?: ICSRuntimeFormSetupFieldConfig[],
    panelColumns?: string;
    mergeTabs?: boolean;
    standards: ICSComponentSetupStandard | false;
    hasToggles: boolean, displayType: 'tab' | 'flat'
}

const ROOT_NODE: ICSRuntimeFormAreaBase = {
    type: 'area', name: 'Root',
    panels: [{ type: 'panel', name: 'Main Panel', children: [] }]
};

@Component({
    selector: 'page-setup-sections',
    templateUrl: './page-setup-sections.html',
    styleUrl: './page-setup-sections.scss',
    imports: [
        CSFormSectionTree, FlexPropertyInput, FlexColumnInput, CSFormSectionArrayContent,
        CODINUS_FORM_AREA, CODINUS_CDK_FLEX_DIRECTIVES, CSIconSelector,
        CSNumericInput, CodinusFormsModule, CSLocalizableInput, CSFormTemplateOutlet,
        MatSelectModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, FormsModule
    ],
    providers: [
        {
            provide: CODINUS_RUNTIME_FORM_HANDLER,
            useFactory: (csForm: PageSetupSections) => csForm._formHandler,
            deps: [forwardRef(() => PageSetupSections)],
        },
        { provide: CODINUS_RUNTIME_FORM_SECTION, useExisting: PageSetupSections },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => PageSetupSections),
            multi: true
        },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PageSetupSections),
            multi: true
        }
    ]
})
export class PageSetupSections implements ICSRuntimeFormHost<ICSRuntimeFormFieldConfig>, ControlValueAccessor {

    private _formHandler = new CSRuntimeFormHandler<ICSRuntimeFormFieldConfig>(this,
        computed(() => this._treeArray().groupDirective));

    private _treeArray = viewChild.required(CSFormSectionTree<ICSRuntimeFormFieldConfig>);

    protected _showRootArea = signal(false);

    get parentSection() { return this._treeArray().groupDirective; }

    prefix = () => null;
    signalValue = computed(() => this._treeArray().formValueChanges());
    sectionHandler = input.required<CSAppPagesSectionsHandler>();
    events = computed(() => this.sectionHandler().events());
    rootArea = signal<ICSRuntimeFormAreaBase>(ROOT_NODE);

    /**
     *
     */
    constructor() {
        effect(() => {
            this._showRootArea();
            this._treeArray().refresh();
        })
    }


    protected sectionSource = computed(() => this.sectionHandler().normalizeSections(this.rootArea(), this._showRootArea()));

    protected templateList = computed(() => this._formHandler.templates().map(l => l.name()));

    protected flexGap = '2px';
    protected areaColumns = `3,1,1,2,3,4`;
    protected normalFieldSpan = `1`;

    protected allowedChildTypes: ChildrenAllowedListFn<ICSRuntimeFormFieldNamelessConfig> = (parent) => {
        if (parent == null && (this._showRootArea() || this.rootArea().panels.length > 1))
            return null;
        const rules = this.sectionHandler()._formComponentFactory.getComponentChildrenInfo(parent);
        return rules.allowedChildren;
    }

    protected isRemoveAllowed = (node: ICSRuntimeFormFieldNamelessConfig) => {
        if (node === this.rootArea() || node === this.rootArea().panels.at(0))
            return false;

        return true;
    };

    protected elementProperties = computed<ICSFormComponentSetupSpecialConfig | null>(() => {
        const currentItem = this._treeArray().currentItem();
        if (!currentItem || currentItem === this.rootArea())
            return null;
        const specialProperties = this.sectionHandler()._formComponentFactory.getComponentSpecialProperties(currentItem);
        if (!specialProperties)
            return null;

        const children = [...specialProperties.children ?? []];

        if (Array.isArray(specialProperties.conditional)) {
            const currentItemValue = this._treeArray().formValueChanges();
            const conditionalChildren = specialProperties.conditional
                .find(c => isMatch(currentItemValue, c.key, c.value))?.children;
            if (conditionalChildren)
                children.push(...conditionalChildren);
        }
        const standards = specialProperties.standards ?? {};
        return {
            children,
            standards,
            hasToggles: standards === false ? false : hasStandardToggle(standards),
            displayType: specialProperties.mergeTabs ? 'flat' : 'tab',
            panelColumns: specialProperties.panelColumns
        };

    }, { equal: (a, b) => isEqual(a, b) });

    protected _onFocusedChanged(isFocused: boolean) {
        if (!isFocused)
            this._onTouched();
    }

    protected _onValueChanged(args: ICSFormElementValueChange<Nullable<ICSRuntimeFormFieldNamelessConfig[]>>) {
        if (args.source === 'input') {
            this._onChange(args.value);
        }
    }

    private _onTouched: () => void = noopFn;
    private _onChange: (value: unknown) => void = noopFn;

    writeValue(obj: ICSRuntimeFormAreaBase): void {
        if (obj == null)
            this.rootArea.update(() => ({ ...ROOT_NODE }));
        else
            this.rootArea.set(obj);
    }

    validate(): ValidationErrors | null {
        return this._treeArray().validate();
    }

    registerOnChange(fn: () => void): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this._treeArray().setDisabledState(isDisabled);
    }

}

function isMatch(currentItem: unknown, key: string, value: unknown | unknown[]): boolean {
    const itemValue = getValue(currentItem, key);
    return Array.isArray(value)
        ? value.includes(itemValue)
        : value === itemValue;
}

function hasStandardToggle(standard: ICSComponentSetupStandard) {
    return standard.required !== false
        || standard.disabled !== false
        || standard.readOnly !== false
        || standard.allowClear !== false
        || standard.hidden !== false
        || standard.invisible !== false;
}
