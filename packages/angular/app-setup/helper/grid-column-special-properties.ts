import {
    getBooleanPropertyConfig, getLocalizableTextPropertyConfig,
    getSelectPropertyConfig, getTextPropertyConfig
} from "./functions";
import { ICSFormComponentSetupConfig } from "./types";
const flexSpan = '1';

export const GridColumnSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        getLocalizableTextPropertyConfig('dataKey', { en: 'Data Key' }, { required: ['en'], order: -1 }),
        getTextPropertyConfig('width', { en: 'Width' }),
        //TODO: cell border issue
        //sticky ?: 'start' | 'end';
        getTextPropertyConfig('cellDefaultValue', { en: 'Cell DefaultValue' }),
        getTextPropertyConfig('footerDefaultValue', { en: 'Footer DefaultValue' }),
        getSelectPropertyConfig('footerAggregation', { en: 'Aggregation' },
            [null, 'sum', 'max', 'min', 'count', 'avg', 'first', 'last'], null),

        getLocalizableTextPropertyConfig('cellFormatter', { en: 'Cell Formatter' }),
        getLocalizableTextPropertyConfig('footerFormatter', { en: 'Footer Formatter' }),
        {
            type: 'section',
            name: 'filter',
            dataKey: 'filter',
            label: { en: 'Filter' },
            // flex: '100',
            children: [
                getTextPropertyConfig('filterkey', { en: 'Filter Key' }, { flexSpan }),
                getSelectPropertyConfig('gridColumnFilterType', { en: 'Type' }, [null, 'string', 'number', 'date', 'select'], null, { flexSpan, dataKey: 'type' }),
                getSelectPropertyConfig('gridColumnFilterInitialOperation', { en: 'Initial Operation' }, [], 'equals', { flexSpan, dataKey: 'initialOperation' }),
            ]
        },
        {
            type: 'section',
            name: 'editor',
            dataKey: 'editor',
            label: { en: 'Editor' },
            // flex: '100',
            children: [
                getSelectPropertyConfig('gridColumnEditorType', { en: 'Type' }, [null, 'string', 'number', 'date', 'select'], null, { flexSpan, dataKey: 'type' }),
            ]
        },
        getBooleanPropertyConfig('sortable', { en: 'Sortable' }),
        getBooleanPropertyConfig('reordable', { en: 'Reordable' }),
        getBooleanPropertyConfig('resizable', { en: 'Resizable' }),
    ],
    standards: {
        allowClear: false,
        disabled: false,
        flexSpan: false,
        hints: false,
        invisible: false,
        labelIcon: false,
        required: false,
        dataKey: false,
    }
};





// filter ?: ITableColumnFilter;
// editor ?: ITableColumnEditor;