import { getBooleanPropertyConfig, getContainerProperties, getSelectPropertyConfig, getTextPropertyConfig } from "./functions";
import { ICSFormComponentSetupConfig } from "./types";

export const AreaSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        getSelectPropertyConfig('displayType', { en: 'Display Type' }, ['tab', 'accordion', 'card', 'none'], 'tab')
    ],
    mergeTabs: true,
    standards: false,
    conditional: [
        {
            key: 'displayType', value: 'tab',
            children: [
                getTextPropertyConfig('tabsAnimationDuration', { en: 'Animation Duration' }, { defaultValue: '500ms' }),
                getSelectPropertyConfig('tabsPosition', { en: 'Header Position' }, ['above', 'below', 'right', 'left'], 'above'),
                {
                    type: 'section',
                    name: 'section',
                    // flex: '100',
                    children: [
                        getBooleanPropertyConfig('cardWhensingle', { en: 'Card when Single Tab' }),
                        getBooleanPropertyConfig('tabsDynamicHeight', { en: 'Dynamic Height' }),
                        getBooleanPropertyConfig('tabsPreserveContent', { en: 'Preserve Content' }),
                        getBooleanPropertyConfig('tabsStretch', { en: 'Stretch Tabs' }),
                    ]
                },
            ]
        },
        {
            key: 'displayType', value: 'accordion',
            children: [
                getSelectPropertyConfig('accordionTogglePosition', { en: 'Toggle Position' }, ['before', 'after'], 'after'),
                getSelectPropertyConfig('accordionDisplayMode', { en: 'Display Mode' }, ['default', 'flat'], 'default'),
                {
                    type: 'section',
                    name: 'section',
                    // flex: '100',
                    children: [
                        getBooleanPropertyConfig('cardWhensingle', { en: 'Card when Single Tab' }),
                        getBooleanPropertyConfig('accordionHideToggle', { en: 'Hide Toggle' }),
                        getBooleanPropertyConfig('accordionMulti', { en: 'Multiple' }),
                    ]
                },
            ]
        },
        {
            key: 'displayType', value: ['card', 'none'],
            children: getContainerProperties()
        }
    ]
};



export const PanelSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        getTextPropertyConfig('labelClass', { en: 'Label CSS Class' }),
        getTextPropertyConfig('bodyClass', { en: 'Body CSS Class' }),
        ...getContainerProperties(),
        getBooleanPropertyConfig('accordionExpanded', { en: 'Expanded (Accordian Area only)' }, { flexNewRow: true }),

    ],
    standards: {
        dataKey: false,
        hints: false,
        required: false,
        disabled: false,
        readOnly: false,
        allowClear: false,
        flexSpan: false,
        requiredLabel: false
    },
    mergeTabs: true,
};