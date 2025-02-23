import {
    getBooleanPropertyConfig, getDecimalPropertyConfig, getLocalizableTextPropertyConfig,
    getSelectPropertyConfig, getTextPropertyConfig
} from "./functions";
import { ICSFormComponentSetupConfig } from "./types";
const flexSpan = '1';

export const GridColumnSpecialProperties: ICSFormComponentSetupConfig = {
    children: [
        getTextPropertyConfig('name', { en: 'Name' }),
        getTextPropertyConfig('width', { en: 'Width' }),
        getDecimalPropertyConfig('order', { en: 'Order' }),
        //TODO: cell border issue
        //sticky ?: 'start' | 'end';
        getTextPropertyConfig('cellDefaultValue', { en: 'Cell DefaultValue' }),
        getTextPropertyConfig('footerDefaultValue', { en: 'Footer DefaultValue' }),
        getSelectPropertyConfig('footerAggregation', { en: 'Aggregation' },
            [null, 'sum', 'max', 'min', 'count', 'avg', 'first', 'last'], null),

        getLocalizableTextPropertyConfig('dataKey', { en: 'Data Key' }, { required: true }),
        getLocalizableTextPropertyConfig('headerText', { en: 'Header Text' }),
        getLocalizableTextPropertyConfig('cellFormatter', { en: 'Cell Formatter' }),
        getLocalizableTextPropertyConfig('footerFormatter', { en: 'Footer Formatter' }),
        {
            type: 'section',
            name: 'filter',
            dataKey: 'filter',
            label: { en: 'Filter' },
            // flex: '100',
            children: [
                getSelectPropertyConfig('type', { en: 'Type' }, [null, 'text', 'number', 'date', 'select'], null, { flexSpan }),
                getTextPropertyConfig('initialOperation', { en: 'Initial Operation' }, { flexSpan }),
                getTextPropertyConfig('filterkey', { en: 'Filter Key' }, { flexSpan }),
            ]
        },
        getBooleanPropertyConfig('readOnly', { en: 'Read Only' }),
        getBooleanPropertyConfig('hidden', { en: 'Hidden' }),
        getBooleanPropertyConfig('sortable', { en: 'Sortable' }),
        getBooleanPropertyConfig('reordable', { en: 'Reordable' }),
        getBooleanPropertyConfig('resizable', { en: 'Resizable' }),
    ]
};





// filter ?: ITableColumnFilter;
// editor ?: ITableColumnEditor;