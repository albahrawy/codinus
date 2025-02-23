/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractControl, AsyncValidatorFn, FormGroup, ValidatorFn } from "@angular/forms";
import { IGenericRecord, IRecord, IStringRecord } from "@codinus/types";
import { DataHttpHandleOptions, ICSRequestAuditInfo } from "@ngx-codinus/cdk/data";
import { Observable } from "rxjs";

declare interface IDataConverter {
    jsonKeys?: string | string[];
    mergedKeys?: IStringRecord;
    customConverter?: (data: any, context: any) => any;
}

declare interface IServerDatasource {
    storeType?: string;
    dataProfile?: string;
    queryStore?: string;
    queryName?: string;

    isDataSet?: boolean;
    additional?: string;
    args?: IStringRecord;
    auditInfo?: ICSRequestAuditInfo;
    dataConverter?: IDataConverter;
}

declare interface IDataPageCrudManager {
    load(datasource: IServerDatasource, handleOptions: DataHttpHandleOptions): Observable<any>;
    save(datasource: IServerDatasource, handleOptions: DataHttpHandleOptions, refreshData: boolean): Observable<any>;
    delete(datasource: IServerDatasource, handleOptions: DataHttpHandleOptions): Observable<any>;
}

declare interface IFormElementLayout {
    appearance?: 'outline' | 'standard' | '';
    floatLabel?: 'always' | 'auto';
    placeHolderDisplay?: 'none' | 'show';
    flexWidth?: string;
}

declare interface IFormFieldLayout extends IFormElementLayout {
    flexOrder?: number;
}

declare interface IFormSectionLayout extends IFormElementLayout {
    columnCount?: number;
    gutterSize?: string;
    minWidth?: number;
}

declare interface IFormValidation {
    validator?: ValidatorFn;
    asyncValidator?: AsyncValidatorFn;
    errorMessages?: { [key: string]: IStringRecord };
}

declare interface IServerDataUpdate {
    refreshData?: boolean;
    dataProfile?: string;
    queryStore?: string;
    queryName?: string;
    storeType?: string;
    args?: IDataUpdateArgs;
}

declare type ArgsFormat = 'json' | 'xml' | 'json-xml' | '';
declare type ArgsMergeType = 'changed' | 'all' | 'args' | '';

declare interface IDataUpdateArgs {
    merge?: ArgsMergeType;
    flatten?: boolean;
    format?: ArgsFormat;
    data?: IGenericRecord;
}

declare interface IPageDataHandler {
    load?: IPageServerDataSource;
    save?: IServerDataUpdate;
    delete?: IServerDataUpdate;
}

interface IPageServerDataSource extends IServerDatasource {
    initialLoad?: boolean;
    mainTable?: string;
}

enum DataAccess { None = 0, New = 1, Edit = 2, Delete = 4, Save = 8, Print = 16 }

declare type GridPosition = 'grid-before' | 'grid-after' | 'grid-up' | 'grid-bottom' | '';
declare type DataPageElements = 'form' | 'grid' | 'form-grid' | '';
declare type SectionsDisplayType = 'tab' | 'panel' | 'border' | '';
declare type NovaFunction<T> = (...args: any) => T;
declare interface IElementSize {
    width?: string;
    height?: string;
}

declare interface IDataPageLayout {
    gridPosition?: GridPosition;
    formAreaSize?: number;
}

declare interface IGridOptions {
    //    tree?: IGridTreeConfig;
    selectFirstRow?: boolean;
    autoSizeColumn?: boolean;
    conditionalSelection?: boolean; fixedFooter?: boolean;

}

declare interface IFormSection extends ILocalizedCaption, IHasRenderState, IHasChildrenLayout {
    fields?: IFormField[];
    expanded?: boolean;
    cssClass?: string;
    disabled?: boolean;
    // minWidth?: number;
}

declare type DataType = '' | 'string' | 'number' | 'date';

declare type ControlRenderType = 'text' | 'date-picker' | 'select' | 'text-area' | 'radio' | 'check-box' | 'slide-toggle'
    | 'grid-picker' | 'code' | 'img64-upload' | 'img-selector' | 'grid-editor' | 'group' | 'group-array' | 'file-upload' | 'icon-chooser';

declare type ControlType = ControlRenderType | 'color' | 'email' | 'password' | 'number' | 'localized-text';

declare interface INovaIcon {
    type?: 'none' | 'material' | 'image';
    src?: string;
}

declare interface IFormInputButton {
    disabled?: boolean;
    icon?: INovaIcon;
}

enum FieldValidatorType { None = 0, Required = 1, Min = 2, Max = 4, Email = 8, Pattern = 16 }

interface IFieldValidation extends IFormValidation {
    validatorType?: FieldValidatorType;
    min?: number | Date;
    max?: number | Date;
    pattern?: string;
}

export interface IGridColumn {
    display?: boolean;
    order?: number;

    flex?: number;
    width?: number;
    minWidth?: number;

    filter?: boolean;
    sortable?: boolean;
    resizable?: boolean;
    pinned?: 'left' | 'right' | '';
    lockPosition?: boolean;
    lockPinned?: boolean;
    lockVisible?: boolean;
    suppressMovable?: boolean;

    expression?: string;
    cellClass?: string;
    formatString?: string;
    aggFunc?: 'sum' | 'min' | 'max' | 'count' | 'avg' | 'first' | 'last';
    sort?: 'asc' | 'desc' | '';

    cellClassRules?: IStringRecord;
    conditionalEdit?: NovaFunction<boolean>;
    renderEvent?: NovaFunction<void>;
}

declare interface IBasicFormField extends ILocalizedCaption, IHasRenderState {
    key?: string;
    cssClass?: string;
    controlType?: ControlType;
    dbArgument?: boolean;
    readOnly?: boolean;
    button?: IFormInputButton;
    layout?: IFormFieldLayout;
    validation?: IFieldValidation;
    grid?: IGridColumn;

    execludeValue?: boolean;

    readonly localPlaceHolder?: string;
    readonly required?: boolean;
    hidden?: boolean;
    disabled?: boolean;
    defaultValue?: any;


    hints?: { left?: NovaFunction<string>, right?: NovaFunction<string> };
    events?: {
        change?: NovaFunction<void>, buttonClick?: NovaFunction<void>;
        rowSelected?: NovaFunction<void>, rowSelecting?: NovaFunction<void>;
        addingNew?: NovaFunction<void>, demandData?: NovaFunction<void>;
        valueNeeded?: NovaFunction<Observable<any>>, dialogShow?: NovaFunction<boolean>;
        editing?: NovaFunction<void>;
        valueSet?: NovaFunction<void>;
        getFormttedValue?: NovaFunction<any>;
        getRealValue?: NovaFunction<any>;
        getMultiple?: NovaFunction<boolean>;
    };

    errorKeys?: string[];
    readonly errorMessages?: { [key: string]: IStringRecord };
}

declare interface IRadioItem extends ILocalizedCaption { value?: any; }

declare interface IHasLabelPosition { labelPosition?: 'before' | 'after'; }

declare interface IHasHoverZoom { hoverZoom?: boolean; }

declare interface IRadioFormField extends IHasLabelPosition { radioItems?: IRadioItem[]; }

declare interface IHasElementSize { size?: IElementSize; }

declare interface IHasElementHeight { height?: string; }

declare interface IListDataMembers {
    displayMember?: string | IStringRecord;
    valueMember?: string;
    disabledMember?: string;
    altDisplayMember?: string;
    noneText?: string | IStringRecord;
}

declare interface IHasDataMembers { dataMembers?: IListDataMembers; }

declare interface IHasDisplayMember { displayMember?: string | IStringRecord; }

declare interface IHasListCount { listCount?: number; }

declare interface IHasData {
    data?: Observable<any>;
    relativeData?: boolean;
    demandDataSource?: boolean;
    flagged?: boolean;
    setListData?(data: any, convert?: boolean): void;
}

declare interface IHasMultiple {
    multiple?: boolean;
}

declare interface IFormElementField {
    asDialog?: boolean;
    asJson?: boolean;
}

declare type ListSourceType = 'fixed' | 'appLists' | 'db' | 'relative' | 'async-function' | 'on-demand';

declare interface IListDatasource extends IListDataMembers {
    sourceType?: ListSourceType;
    data?: [];
    appListsKey?: number;
    serverData?: IServerDatasource;
    asyncFunction?: NovaFunction<Observable<any[]>>;
}

declare interface IImageChooserCategory extends ILocalizedCaption {
    value: number;
    icon?: string;
}

declare interface IListItem {
    value: any;
    dataItem?: any;
    disabled?: boolean;
    localCaption?: string;
}

declare interface IImageCategoryFilesArgs {
    key: number;
    files?: Observable<IListItem[]>;
}

declare interface IImageSelectorField extends IHasElementHeight, IHasHoverZoom, IHasElementSize, IHasData, IHasListCount, IHasMultiple {
    showCaption?: boolean;
    dataSource?: IListDatasource;
    categories?: Observable<IImageChooserCategory[]>;
    canUpload?: boolean;
    canCompose?: boolean;
    onImageCategoryFilesNeeded?(args: IImageCategoryFilesArgs): void;
}

//  declare interface ICodeField extends IHasElementHeight {
//     language?: CodeLanguage;
//     defaultPattern?: string;
// }

declare interface IDateFormField {
    dateFilter?: NovaFunction<boolean>;
    disablePopup?: boolean;
    disableInput?: boolean;
}

declare interface IGroupFormField extends IFormSectionContainer, IFormElementField, IHasElementSize, IHasDisplayMember {
    subFormGroup?: boolean;
}

declare interface IContextMenuItem extends ILocalizedCaption {
    key: string;
    icon?: string;
    disabled?: boolean;
}

declare interface ICopiedItem {
    type: string;
    value: any;
}

declare interface IFormArrayField extends IFormElementField, IFormSectionContainer, IHasDisplayMember, IHasElementSize, IHasListCount, IHasChildrenLayout {
    allowCopy?: boolean;
    copyType?: string;
    getItemIcon?: (dataItem: any) => string;

    getChildSections?: () => IFormSection[];
    getContextMenuitems?: (canPaste: boolean, canPasteMismatched: boolean) => IContextMenuItem[];
    verifyPasteMismatch?: (copiedItem: ICopiedItem) => boolean;
    getPasteValue?: (copiedItem: ICopiedItem, mismatched: boolean) => any[];
    buildSections?(): { sections: IFormSection[], controls: IRecord<AbstractControl> };

}

declare interface IUploadField extends IHasMultiple {
    formatsAllowed?: string;
    allowDragDrop?: boolean;
}

declare interface IDropDownField extends IHasMultiple, IHasElementSize {
    localNoneText?: string;
    localFilterNoneText?: string;
    valueType?: DataType;
    dataSource?: IListDatasource;
    asArray?: boolean;
    getItemCaption?: (value: any) => string;
}

declare interface ISelectField extends IDropDownField {
    showSearch?: boolean;
    localSearchPlaceholder?: string;
}

declare interface IFormSectionContainer {
    displayType?: SectionsDisplayType;
    panelMulti?: boolean;
    isVerticalTab?: boolean;
    containerCss?: string;
    sections?: IFormSection[];
    fields?: IFormField[];
}

declare interface IHasGrid {
    gridOptions?: IGridOptions;
    dataWaiting?: boolean;
    parentControl?: AbstractControl;
    getColumnConfig?(key: string): IFormField;
    refreshGridColumns?(columns: string[]): void;
}


type IFormField = IBasicFormField & IRadioFormField & IDateFormField & IImageSelectorField & IFormArrayField & IUploadField
    & IHasDataMembers & IGroupFormField & ISelectField & IHasGrid;

declare interface IHasChildrenLayout {
    childrenLayout?: IFormSectionLayout;
}

declare interface IHasRenderState {
    getRendererState?(group: FormGroup): boolean;
}


declare interface ILocalizedCaption {
    caption?: string | IStringRecord;
    translated?: boolean;
    readonly localCaption?: string;
}


export interface NovaAppPage {
    dataManager?: IDataPageCrudManager;
    defaultValues: any;
    hasGrid: boolean;
    hasForm: boolean;

    elements: DataPageElements;
    childrenLayout: IFormSectionLayout;
    validation: IFormValidation;
    pageKey: number;

    dataHandler: IPageDataHandler;
    dataAccess: DataAccess;

    pageName: string;
    autoSaveLayout: boolean;
    displayType: SectionsDisplayType;
    caption: IStringRecord;

    cssClass: string;
    cssStyles: string;
    panelMulti: boolean;
    isVerticalTab: boolean;
    containerCss: string;

    grid: {
        isPopup?: boolean;
        pageLayout?: IDataPageLayout;
        positionButtons?: boolean;
        popupSize?: IElementSize;
        dblClickEdit?: boolean;
        config?: IGridOptions;
    };

    // search: IPageSearch;
    // buttons: IToolBarButton[];
    // securityItems: IDataPageSecurityItem[];
    sections: IFormSection[];
    // reports: ReportMenuInfo[]


    events: {
        loading?: NovaFunction<void>, loaded?: NovaFunction<void>, dataSourceChanged?: NovaFunction<void>,
        addingNew?: NovaFunction<void>, deleting?: NovaFunction<void>, saving?: NovaFunction<void>, editing?: NovaFunction<void>,
        rowUpdated?: NovaFunction<void>, deleted?: NovaFunction<void>,
        rowSelected?: NovaFunction<void>, rowSelecting?: NovaFunction<void>,
        argsGenerated?: NovaFunction<void>, searchChanged?: NovaFunction<void>
    };
}