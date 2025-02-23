import { IStringRecord } from "@codinus/types";
import { ICSRuntimeFormFieldNamelessConfig } from "@ngx-codinus/material/forms";
import { INodeAddMenuItem } from "@ngx-codinus/material/tree";

export const AnyFieldIcon: IStringRecord = {
    'localizable-text': 'language_chinese_dayi',
    'section-array': 'web',
    'text': 'title',
    'number': 'pin',
    'date': 'calendar_month',
    'date-range': 'date_range',
    'select': 'menu_open',
    'masked-text': 'text_fields',
    'check-box': 'check_box',
    'slide-toggle': 'toggle_on',
    'section': 'view_compact_alt',
    'area': 'tab_group',
    'select-grid': 'view_list',
    'grid': 'table_view',
    'panel': 'ad',
    'grid-column': 'table_view',
};
export const AnyFieldConfig: INodeAddMenuItem<ICSRuntimeFormFieldNamelessConfig>[] = [
    { text: 'Localizable Text', icon: AnyFieldIcon['localizable-text'], child: { type: 'localizable-text' } },
    { text: 'Section-Array', icon: AnyFieldIcon['section-array'], child: { type: 'section-array' } },
    { text: 'Text', icon: AnyFieldIcon['text'], child: { type: 'text' } },
    { text: 'Number', icon: AnyFieldIcon['number'], child: { type: 'number' } },
    { text: 'Date', icon: AnyFieldIcon['date'], child: { type: 'date' } },
    { text: 'Date Range', icon: AnyFieldIcon['date-range'], child: { type: 'date-range' } },
    { text: 'Select', icon: AnyFieldIcon['select'], child: { type: 'select' } },
    { text: 'Masked Text', icon: AnyFieldIcon['masked-text'], child: { type: 'masked-text' } },
    { text: 'CheckBox', icon: AnyFieldIcon['check-box'], child: { type: 'check-box' } },
    { text: 'SlideToggle', icon: AnyFieldIcon['slide-toggle'], child: { type: 'slide-toggle' } },
    'separator',
    { text: 'Section', icon: AnyFieldIcon['section'], child: { type: 'section' } },
    { text: 'Area', icon: AnyFieldIcon['area'], child: { type: 'area' } },
    { text: 'Select Grid', icon: AnyFieldIcon['select-grid'], child: { type: 'select-grid' } },
    { text: 'Grid', icon: AnyFieldIcon['grid'], child: { type: 'grid' } },
];

export const AreaFieldConfig = [
    { text: 'Panel', icon: AnyFieldIcon['panel'], child: { type: 'panel' } },
]

export const GridFieldConfig = [
    { text: 'Column', icon: AnyFieldIcon['grid-column'], child: { type: 'grid-column' } },
]