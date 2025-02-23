import {
    getBooleanPropertyConfig, getContainerProperties, getDatePropertyConfig, getDecimalPropertyConfig,
    getIntegerPropertyConfig, getLocalizableTextPropertyConfig, getSelectPropertyConfig, getTextPropertyConfig
} from "./functions";
import { ICSFormComponentSetupConfig, ICSRuntimeFormSetupFieldConfig } from "./types";

const flexSpan = '1';

export const TextSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        getTextPropertyConfig('defaultValue', { en: 'Default Value' }),
        getIntegerPropertyConfig('maxlength', { en: 'Max Length' }),
        getIntegerPropertyConfig('minlength', { en: 'Min Length' })
    ]
};

export const NumberSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        getDecimalPropertyConfig('defaultValue', { en: 'Default Value' }, { flexSpan }),
        getDecimalPropertyConfig('step', { en: 'Step' }, { flexSpan }),
        getIntegerPropertyConfig('decimalDigits', { en: 'Decimal Digits' }, { flexSpan }),
        getDecimalPropertyConfig('min', { en: 'Minimum' }, { flexSpan }),
        getDecimalPropertyConfig('max', { en: 'Maximum' }, { flexSpan }),
        getSelectPropertyConfig('mode', { en: 'Mode' }, ['integer', 'decimal'], 'integer', { flexSpan }),
        //getTextPropertyConfig('locale', { en: 'Locale' }),
        getTextPropertyConfig('currency', { en: 'Currency' }),
        getBooleanPropertyConfig('showButton', { en: 'ShowButton' }, { flexNewRow: true }),
        getBooleanPropertyConfig('allowArrowKeys', { en: 'Allow Arrows' }),
        getBooleanPropertyConfig('thousandSeparator', { en: 'Thousand Separator' }),
        getBooleanPropertyConfig('percentage', { en: 'Percentage' }),
        getBooleanPropertyConfig('verticalButton', { en: 'Vertical Buttons' })
    ]
};

export const MaskedTextSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        getTextPropertyConfig('defaultValue', { en: 'Default Value' }),
        getTextPropertyConfig('placeHolderChar', { en: 'Mask Placeholder Char' }, { maxlength: 1 }),
        getIntegerPropertyConfig('maxlength', { en: 'Max Length' }),
        getIntegerPropertyConfig('minlength', { en: 'Min Length' }),
        getTextPropertyConfig('mask', { en: 'Mask' }),
        getBooleanPropertyConfig('useUnmaskValue', { en: 'Use Unmasked Value' }, { flexNewRow: true }),
        getBooleanPropertyConfig('clearOnInvalid', { en: 'Clear On Invalid' }),
    ]
};

export const DateSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        getTextPropertyConfig('defaultValue', { en: 'Default Value' }, { flexSpan }),
        getDatePropertyConfig('min', { en: 'Minimum' }, { flexSpan }),
        getDatePropertyConfig('max', { en: 'Maximum' }, { flexSpan }),
        getTextPropertyConfig('dateFormat', { en: 'Date Format' }),
        getSelectPropertyConfig('startView', { en: 'StartView' }, ['month', 'year', 'multi-year'], 'month', { flexSpan }),
        getBooleanPropertyConfig('popupDisabled', { en: 'Disable Popup' }),
        getBooleanPropertyConfig('inputDisabled', { en: 'Disable Input' })
    ]
};

export const DateRangeSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        getTextPropertyConfig('defaultValue', { en: 'Default Value' }, { flexSpan }),
        getTextPropertyConfig('startPlaceholder', { en: 'Start Label' }, { flexSpan }),
        getTextPropertyConfig('startField', { en: 'Start Field' }, { flexSpan }),
        getTextPropertyConfig('endPlaceholder', { en: 'End Label' }, { flexSpan }),
        getTextPropertyConfig('endField', { en: 'End Field' }, { flexSpan }),
        getDatePropertyConfig('min', { en: 'Minimum' }, { flexSpan }),
        getDatePropertyConfig('max', { en: 'Maximum' }, { flexSpan }),
        getTextPropertyConfig('dateFormat', { en: 'Date Format' }),
        getSelectPropertyConfig('startView', { en: 'StartView' }, ['month', 'year', 'multi-year'], 'month', { flexSpan }),
        getSelectPropertyConfig('required', { en: 'required' }, ["start", "end", "true", "false"], null, { flexSpan }),
        getBooleanPropertyConfig('popupDisabled', { en: 'Disable Popup' }),
        getBooleanPropertyConfig('inputDisabled', { en: 'Disable Input' })
    ]
};

export const CheckBoxSpecialProeprties: ICSFormComponentSetupConfig = {
    children: [
        getSelectPropertyConfig('labelPosition', { en: 'Label Position' }, ['before', 'after'], 'after', { flexSpan }),
    ],
    standards: {
        labelIcon: false,
        hints: false,
        allowClear: false,
    },
    mergeTabs: true
};

export const SelectSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        ...getDropdownSpecialproeprties(['none', 'icon', 'avatar']),
        getBooleanPropertyConfig('showTitle', { en: 'Show Title' }, { defaultValue: true, flexSpan }),
        getBooleanPropertyConfig('showSearch', { en: 'Show Search' }, { defaultValue: true, flexSpan }),
        getBooleanPropertyConfig('stickySelected', { en: 'Sticky Selected' }, { flexSpan }),
        getBooleanPropertyConfig('selectOnlyByCheckBox', { en: 'SelectOnlyByCheckBox' }, { flexSpan }),
    ]
};

export const SelectGridSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        ...getDropdownSpecialproeprties(
            ['font', 'img', 'svg'],
            [getLocalizableTextPropertyConfig('noDataText', { en: 'no Data Text' })]),
        getBooleanPropertyConfig('showHeader', { en: 'Show Header' }, { defaultValue: true, flexSpan }),
        getBooleanPropertyConfig('showFilter', { en: 'Show Filter' }, { defaultValue: true, flexSpan }),
        getBooleanPropertyConfig('showFooter', { en: 'Show Filter' }, { flexSpan }),
        getBooleanPropertyConfig('stickyHeader', { en: 'Sticky Header' }, { defaultValue: true, flexSpan }),
        getBooleanPropertyConfig('stickyFilter', { en: 'Sticky Filter' }, { defaultValue: true, flexSpan }),
        getBooleanPropertyConfig('stickyFooter', { en: 'Sticky Footer' }, { defaultValue: true, flexSpan }),
        getBooleanPropertyConfig('sortable', { en: 'Sortable' }, { flexSpan }),
    ]
};

export const GridSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        getDecimalPropertyConfig('rowHeight', { en: 'Row Height' }),
        getTextPropertyConfig('height', { en: 'Height' }),
        getTextPropertyConfig('responsiveHeaderColumn', { en: 'Responsive Header Column' },),
        getSelectPropertyConfig('iconType', { en: 'Icon Type' }, ['font', 'img', 'svg'], null,),
        //TODO: think about this
        //getSelectPropertyConfig('responsive', { en: 'Responsive' }, ['after', 'before', 'none'], 'after', { flex }),
        getSelectPropertyConfig('keyboardNavigation', { en: 'Keyboard Navigation' }, ['row', 'cell', 'cell-round', 'none'], 'cell-round', { flexSpan }),
        getSelectPropertyConfig('selectColumn', { en: 'Select Column' }, ['after', 'before', 'none'], 'before', { flexSpan }),
        getSelectPropertyConfig('iconColumn', { en: 'Icon Column' }, ['after', 'before', 'none'], 'after', { flexSpan }),

        getLocalizableTextPropertyConfig('noDataText', { en: 'no Data Text' }),
        getLocalizableTextPropertyConfig('iconGetter', { en: 'Icon Member' }),
        getLocalizableTextPropertyConfig('selectableKey', { en: 'Selectable Member' }),

        getBooleanPropertyConfig('attachFilter', { en: 'AttachFilter' }, { defaultValue: true, flexSpan, flexNewRow: true }),
        getBooleanPropertyConfig('reorderColumns', { en: 'Reorder Columns' }, { flexSpan }),
        getBooleanPropertyConfig('sortable', { en: 'Sortable' }, { flexSpan }),
        getBooleanPropertyConfig('showHeader', { en: 'Show Header' }, { defaultValue: true, flexSpan }),
        getBooleanPropertyConfig('showFilter', { en: 'Show Filter' }, { defaultValue: true, flexSpan }),
        getBooleanPropertyConfig('showFooter', { en: 'Show Filter' }, { flexSpan }),
        getBooleanPropertyConfig('showIndex', { en: 'Show Index' }, { flexSpan }),
        getBooleanPropertyConfig('stickyHeader', { en: 'Sticky Header' }, { defaultValue: true, flexSpan }),
        getBooleanPropertyConfig('stickyFilter', { en: 'Sticky Filter' }, { defaultValue: true, flexSpan }),
        getBooleanPropertyConfig('stickyFooter', { en: 'Sticky Footer' }, { defaultValue: true, flexSpan }),
        getBooleanPropertyConfig('disabled', { en: 'Disabled' }, { flexSpan }),
        getBooleanPropertyConfig('editWithF2', { en: 'editWithF2' }, { flexSpan }),
        getBooleanPropertyConfig('editWithEnter', { en: 'editWithEnter' }, { flexSpan }),
        getBooleanPropertyConfig('commitOnDestroy', { en: 'commitOnDestroy' }, { defaultValue: true, flexSpan }),
    ]
};

export const LocalizableTextSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        getTextPropertyConfig('required', { en: 'Required' }),
        ...getContainerProperties()
    ],
    standards: { required: false }
};

function getDropdownSpecialproeprties(iconTypes: string[], otherProps?: ICSRuntimeFormSetupFieldConfig[]) {
    return [
        getTextPropertyConfig('defaultValue', { en: 'Default Value' }, { flexSpan }),
        getTextPropertyConfig('panelClass', { en: 'Panel Class' }, { flexSpan }),
        getTextPropertyConfig('overlayPanelClass', { en: 'Overlay Class' }, { flexSpan }),
        getTextPropertyConfig('panelWidth', { en: 'Panel Width' }, { flexSpan }),
        getDecimalPropertyConfig('optionHeight', { en: 'Option Height' }, { flexSpan }),
        getDecimalPropertyConfig('maxHeight', { en: 'Max Height' }, { flexSpan }),
        getDecimalPropertyConfig('displayedTitleCount', { en: 'Titles Count' }, { flexSpan }),
        getTextPropertyConfig('valueMember', { en: 'Value Member' }, { flexSpan }),
        getTextPropertyConfig('disableMember', { en: 'Disable Member' }, { flexSpan }),
        getSelectPropertyConfig('iconType', { en: 'Icon Type' }, iconTypes, null, { flexSpan }),
        getSelectPropertyConfig('togglePosition', { en: 'Toggle Position' }, ['after', 'before', 'none'], 'after', { flexSpan }),
        getLocalizableTextPropertyConfig('displayMember', { en: 'Display Member' }),
        getLocalizableTextPropertyConfig('iconMember', { en: 'Icon Member' }),
        getLocalizableTextPropertyConfig('moreSingleText', { en: 'More SingleText' }),
        getLocalizableTextPropertyConfig('moreText', { en: 'More Text' }),
        ...(otherProps ?? []),
        getBooleanPropertyConfig('multiple', { en: 'Multiple' }, { flexSpan }),
        getBooleanPropertyConfig('showIndex', { en: 'Show Index' }, { flexSpan }),
    ];
}