import { ICSRuntimeFormAreaPanel } from "@ngx-codinus/material/forms";

function createSimpleData() {
    const smallData = Array(3).fill(0).map((v, i) => ({
        name: 'item' + i, value: i + 1, disable: (i + 1) % 15 == 0,
        icon: (i + 1) % 5 ? 'home' : 'tel',
        avatar: (i + 1) % 3
            ? 'https://angular.io/generated/images/bios/devversion.jpg'
            : 'https://angular.io/generated/images/bios/jelbourn.jpg',
    }));
    return smallData;
}

export function createPanel(prefix: string, action?: (panel: ICSRuntimeFormAreaPanel) => void): ICSRuntimeFormAreaPanel {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const panel: ICSRuntimeFormAreaPanel | any = {
        gap: '5px,5px,5px,5px,5px,5px',
        name: prefix,
        label: `${prefix}`,
        children:
            [
                {
                    type: 'text',
                    name: `${prefix}_TextComponent`,
                    // templateName: 'ahmed',
                    dataKey: `${prefix}_db_1`,
                    defaultValue: 'iSoft',
                    required: true,
                    disabled: true,
                    label: { en: 'First' },
                    rightHint: 'Test',
                    labelIcon: 'home',
                    flex: '100,100,100',
                    allowClear: true,
                    buttons: [
                        {
                            icon: 'delete',
                            name: 'test-delete'
                        },
                        {
                            icon: 'menu',
                            name: 'test-menu',
                            disabled: true
                        }
                    ],
                    gridColumn: {
                        show: true
                    }
                },
                {
                    type: 'check-box',
                    name: `${prefix}_TextComponentCheck`,
                    dataKey: `${prefix}_db_check`,
                    disabled: true,
                    //defaultValue: new Date(),
                    required: true,
                    label: { en: 'Check' },
                    leftHint: 'Test',
                    labelIcon: 'home',
                    allowClear: true,
                },
                {
                    type: 'slide-toggle',
                    name: `${prefix}_TextComponentToggle`,
                    dataKey: `${prefix}_db_toggle`,
                    //defaultValue: new Date(),
                    required: true,
                    label: { en: 'Toggle' },
                    leftHint: 'Test',
                    labelIcon: 'home',
                    allowClear: true,
                },
                {
                    type: 'date-range',
                    name: `${prefix}_TextComponent1`,
                    dataKey: `${prefix}_db_2`,
                    //defaultValue: new Date(),
                    required: true,
                    label: { en: 'Second' },
                    leftHint: 'Test',
                    labelIcon: 'home',
                    allowClear: true,
                    defaultValue: 'Today',
                    startView: 'multi-year',
                    buttons: [
                        {
                            icon: 'delete',
                            name: 'test-delete'
                        },
                        {
                            icon: 'menu',
                            name: 'test-menu',
                            disabled: true
                        }
                    ]
                },
                {
                    type: 'number',
                    name: `${prefix}_NumberComponent3`,
                    dataKey: `${prefix}_db_3`,
                    defaultValue: 1,
                    required: true,
                    label: { en: 'Third', ar: 'الثالث' },
                    leftHint: 'Test',
                    labelIcon: 'home',
                    allowClear: true,
                },
                {
                    type: 'section',
                    dialog: {
                        enabled: true,
                        minWidth: 600,
                        minHeight: 400
                    },
                    leftHint: 'Test Hint',
                    dataKey: `${prefix}_db_section_4`,
                    name: `${prefix}_SectionComponent4`,
                    label: { en: 'Fourth', ar: 'الرابع' },
                    children: [
                        {
                            type: 'number',
                            name: `${prefix}_NumberComponent_Sub_5`,
                            dataKey: `${prefix}_db_section_sub_5`,
                            defaultValue: 2,
                            required: true,
                            label: { en: 'Sub1', ar: 'الثالث' },
                            leftHint: 'Test',
                            labelIcon: 'home',
                            allowClear: true,
                        },
                        {
                            type: 'section',
                            dataKey: `${prefix}_db_section_nested_6`,
                            name: `${prefix}_SectionComponent_Nested_6`,
                            label: { en: 'Fourth', ar: 'الرابع' },
                            children: [
                                {
                                    type: 'number',
                                    name: `${prefix}_SectionComponent_Nested_sub_7`,
                                    dataKey: `${prefix}_db_section_nested_sub_7`,
                                    defaultValue: 2,
                                    required: true,
                                    label: { en: 'Sub1', ar: 'الثالث' },
                                    leftHint: 'Test',
                                    labelIcon: 'home',
                                    allowClear: true,
                                },
                            ]
                        }
                    ]
                },
                {
                    type: 'select',
                    name: `${prefix}_SelectComponent`,
                    dataKey: `${prefix}_db_select`,
                    dataSource: createSimpleData(),
                    // defaultValue: 1,
                    required: true,
                    label: { en: 'Select' },
                    rightHint: 'Test',
                    labelIcon: 'home',
                    flex: '100,100,100',
                    allowClear: true,
                    // categorized: 'split',
                    multiple: true,
                    panelWidth: 'auto',
                    // optionHeight: 20,
                    displayMember: "name",
                    valueMember: "value",
                    iconMember: "icon",
                    showSearch: true,
                    isDialog: false,
                    readOnly: false,
                    disableMember: "disable",
                    iconColor: 'accent',
                    showIndex: true,
                    iconType: 'icon',
                    buttons: [
                        {
                            icon: 'delete',
                            name: 'test-delete'
                        },
                        {
                            icon: 'menu',
                            name: 'test-menu',
                            disabled: true
                        }
                    ]
                },
                {
                    type: 'select-grid',
                    name: `${prefix}_SelectGridComponent`,
                    dataKey: `${prefix}_db_selectGrid`,
                    defaultValue: 1,
                    required: true,
                    label: { en: 'Grid' },
                    rightHint: 'Test',
                    labelIcon: 'home',
                    showFilter: true,
                    flex: '100,100,100',
                    allowClear: true,
                    columns: [
                        {
                            name: 'position', footerAggregation: 'sum', headerText: 'No.', // sticky: 'start',
                            resizable: true, draggable: true, sortable: true, filter: { type: 'number' }, editor: { type: 'number' }
                        },
                        {
                            name: 'date', cellFormatter: 'dd/MM/yyyy', footerDefaultValue: 'Footer', headerText: 'Date',
                            resizable: true, draggable: false, sortable: true,
                            filter: { type: 'date', operations: ['equals', 'greaterThan'], options: { dateFormat: 'dd-MM-yyyy' } },
                            editor: { type: 'date' }
                        },
                        {
                            name: 'weight', footerAggregation: 'avg', headerText: 'Weight', dataKey: "nested.weightx", cellFormatter: "#,###.##",
                            footerFormatter: "Avg. {#,###.00}", resizable: true, draggable: true, sortable: true,
                            filter: { type: "number", options: { decimalDigits: 3, mode: "decimal" } },
                            editor: { type: 'number', options: { allowArrowKeys: true, mode: "decimal" } }
                        },
                        {
                            name: 'symbol', headerText: 'Symbol',
                            resizable: true, draggable: true, sortable: true, filter: { type: 'string' }, editor: { type: 'string' }
                        },
                    ],
                    // categorized: 'split',
                    multiple: true,
                    panelWidth: 'auto',
                    // optionHeight: 20,
                    iconMember: "icon",
                    isDialog: false,
                    readOnly: false,
                    iconType: 'icon',
                    displayMember: 'name_en',
                    selectColumn: 'before',
                    valueMember: 'valueB',
                    //responsive: { enabled: true },
                    disableMember: 'disable',
                    iconColor: 'accent',
                    showIndex: true,
                    buttons: [
                        {
                            icon: 'delete',
                            name: 'test-delete'
                        },
                        {
                            icon: 'menu',
                            name: 'test-menu',
                            disabled: true
                        }
                    ]
                },
                {
                    type: 'section-arrayt',
                    name: `${prefix}_ArrayComponent`,
                    dataKey: `${prefix}_db_Array`,
                    label: { en: 'Section Array' },
                    height: '400px',
                    displayMember: `${prefix}_db_array_name`,
                    contextMenu: true,
                    children: [
                        {
                            type: 'number',
                            name: `${prefix}_NumberComponent_Sub_5`,
                            dataKey: `${prefix}_db_array_name`,
                            defaultValue: 2,
                            required: true,
                            label: { en: 'Sub1', ar: 'الثالث' },
                            leftHint: 'Test',
                            labelIcon: 'home',
                            allowClear: true,
                            flex: '50,50,50,50,50',
                        },
                        {
                            type: 'section',
                            dataKey: `${prefix}_db_section_nested_6`,
                            name: `${prefix}_SectionComponent_Nested_6`,
                            label: { en: 'Fourth', ar: 'الرابع' },
                            flex: '50,50,50,50,50',
                            children: [
                                {
                                    type: 'number',
                                    name: `${prefix}_SectionComponent_Nested_sub_7`,
                                    dataKey: `${prefix}_db_section_nested_sub_7`,
                                    defaultValue: 2,
                                    required: true,
                                    label: { en: 'Sub1', ar: 'الثالث' },
                                    leftHint: 'Test',
                                    labelIcon: 'home',
                                    allowClear: true,
                                },
                            ]
                        }
                    ]
                },
                {
                    type: 'table',
                    templateName: 'mat-field',
                    name: `${prefix}_TableComponent`,
                    dataKey: `${prefix}_db_Table`,
                    label: { en: 'Table' },
                    // readOnly: true,
                    commitOnDestroy: true,
                    editWithF2: true,
                    editWithEnter: true,
                    rowHeight: 30,
                    attachFilter: true,
                    reorderColumns: true,
                    sortable: true,
                    showHeader: true,
                    showFilter: true,
                    showFooter: true,
                    stickyHeader: true,
                    stickyFilter: true,
                    stickyFooter: true,
                    noDataText: 'There is no Data',
                    responsive: { enabled: true, md: 2, sm: 1, xs: 1 },
                    selectable: 'single',
                    selectColumn: 'none',
                    iconMember: 'icon',
                    columns: [
                        {
                            name: 'position', footerAggregation: 'sum', headerText: 'No.',
                            resizable: true, draggable: true, sortable: true, filter: { type: 'number' }, editor: { type: 'number' }
                        },
                        {
                            name: 'date', cellFormatter: 'dd/MM/yyyy', footerDefaultValue: 'Footer', headerText: 'Date',
                            resizable: true, draggable: false, sortable: true,
                            filter: { type: 'date', operations: ['equals', 'greaterThan'], options: { dateFormat: 'dd-MM-yyyy' } },
                            editor: { type: 'date', options: { dateFormat: 'dd-MM-yyyy' } }
                        },
                        {
                            name: 'weight', footerAggregation: 'avg', headerText: 'Weight', dataKey: "nested.weightx", cellFormatter: "#,###.##",
                            footerFormatter: "Avg. {#,###.00}", resizable: true, draggable: true, sortable: true,
                            filter: { type: 'number', options: { decimalDigits: 3, mode: 'decimal' } },
                            editor: { type: 'number', options: { allowArrowKeys: true, mode: 'decimal' } }
                        },
                    ]
                }
            ]
    };

    action?.(panel);
    return panel;
}