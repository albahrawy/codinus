import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { CdkVirtualScrollViewport, ScrollingModule, ViewportRuler } from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import {
    AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges,
    OnDestroy, Output, QueryList, Signal, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewEncapsulation,
    WritableSignal, booleanAttribute, computed, effect, inject, input, numberAttribute, output, signal,
    viewChild,
    viewChildren
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ThemePalette } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatList, MatListModule, MatListOptionTogglePosition } from '@angular/material/list';
import { ConextMenuOpeningArgs } from '@ngx-codinus/material/context-menu';
import { removeFromArray, toNumber, toStringValue } from '@codinus/js-extensions';
import { Observable, tap } from 'rxjs';
import { CODINUS_SELECTION_LIST, CSVirtualSelectionListChange, ICSListOption, ICSSelectionList, ListCategorizedMode, ListFilterPredicate, ListIconType, ListTogglePosition } from './types';
import { CODINUS_CONTEXT_MENU_PARENT, ICSContextMenuParent } from '@ngx-codinus/material/context-menu';
import { HtmlElementRuler } from '@ngx-codinus/cdk/observer';
import { CSListBinder } from '@ngx-codinus/core/data';
import { Nullable, ObjectGetter } from '@codinus/types';
import { CSNamedTemplate } from '@ngx-codinus/core/outlet';

const OPTION_TAG_NAME = 'CS-LIST-OPTION';
const DefaultFilterFn: <T>(data: T, filter: string) => boolean = (d, f) => toStringValue(d).includes(f);


const DEFAULT_OPTION_HEIGHT = 48;

@Component({
    selector: 'cs-selection-list-panel',
    templateUrl: './selection-list.html',
    styleUrls: ['./selection-list.scss'],
    host: {
        'class': 'mat-mdc-selection-list mat-mdc-list-base mdc-list cs-selection-list-panel',
        'role': 'listbox',
        '[id]': 'id',
        '[attr.aria-multiselectable]': 'multiple()',
        '[class.nova-list--hasIcon]': '_showIcon()',
        '[class.nova-list--hasIndex]': 'showIndex()',
        '[style.--cs-virtual-list-item-height.px]': '_optionHeight()',
        '(keydown)': '_handleKeydown($event)',
    },
    imports: [MatInputModule, MatDividerModule, CSNamedTemplate,
        //EvaluatePipe, CSListOption,
        MatIconModule, MatListModule, ScrollingModule, NgTemplateOutlet, CdkDropList, CdkDrag],
    providers: [
        { provide: MatList, useExisting: CSSelectionListPanel },
        { provide: ViewportRuler, useExisting: HtmlElementRuler },
        { provide: CODINUS_SELECTION_LIST, useExisting: CSSelectionListPanel },
        { provide: CODINUS_CONTEXT_MENU_PARENT, useExisting: CSSelectionListPanel },
    ],
    hostDirectives: [HtmlElementRuler],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class CSSelectionListPanel<TRow, TValue = unknown>
    extends MatList
    implements ICSSelectionList<TRow, TValue>, ICSContextMenuParent, AfterViewInit,
    AfterViewChecked, OnChanges, OnDestroy {

    override _isNonInteractive = false;

    private _elementRef = inject(ElementRef);
    private _ngZone = inject(NgZone);

    private _needToSetFocus = false;
    private _activeOption: { parent: HTMLElement; index: number; } | null = null;
    private _initialized = false;
    private _isDestroyed = false;


    private _filter = signal<Nullable<string | undefined>>(null);

    protected _binder = new CSListBinder<TRow, TValue>(this);
    protected _selectionModel: SelectionModel<TValue>;

    readonly conextMenuOpening = output<ConextMenuOpeningArgs>();
    readonly selectionChange = output<CSVirtualSelectionListChange<TRow, TValue>>();
    readonly currentChanged = output<TRow | null>();

    displayMember = input<ObjectGetter<TRow>>();
    valueMember = input<ObjectGetter<TRow, TValue>>();
    disableMember = input<ObjectGetter<TRow, boolean>>();
    iconMember = input<ObjectGetter<TRow>>();
    filterPredicate = input<ListFilterPredicate<TRow>>();

    multiple = input(false, { transform: booleanAttribute });
    readOnly = input(false, { transform: booleanAttribute });
    selectOnlyByCheckBox = input(false, { transform: booleanAttribute });
    enableDrag = input(false, { transform: booleanAttribute });

    showIndex = input(false, { transform: booleanAttribute });
    showTitle = input(false, { transform: booleanAttribute });
    showSearch = input(false, { transform: booleanAttribute });

    togglePosition = input<ListTogglePosition>('after');
    iconType = input<ListIconType>('none');
    optionHeight = input(48, { transform: numberAttribute });

    constructor() {
        super();
        this._selectionModel = new SelectionModel<TValue>(this.multiple());
        effect(() => {
            const multiple = this.multiple();
            if (multiple != this._selectionModel.isMultipleSelection()) {
                let oldSelected = this._selectionModel.selected;
                if (this._initialized) {
                    if (!multiple && oldSelected?.length > 1)
                        oldSelected = [oldSelected[0]];
                    //                    this.value = oldSelected;
                }

                this._selectionModel = new SelectionModel(multiple, oldSelected);
                // if (this._initialized) {
                //     this._updateOptionsParts();
                // }
            }
        });
    }

    private _filterPredicate = computed<ListFilterPredicate<TRow>>(() => {
        const customFilter = this.filterPredicate();
        if (customFilter)
            return customFilter;
        const titleFn = this._binder.displayMember();
        return (d, f) => toStringValue(titleFn(d)).includes(f);
    });

    protected _optionHeight = computed(() => {
        const height = this.optionHeight();
        return !height || isNaN(height) ? DEFAULT_OPTION_HEIGHT : height;
    });

    //protected _selectedHeight = computed(() => this._data().selected.length * this._optionHeight());


    protected optToggleType = computed(() => this.togglePosition() === 'none' ? null : this.multiple() ? 'check' : 'radio');
    protected optIconType = computed(() => {
        const iconType = this.iconType();
        return !iconType || iconType === 'none' ? null : iconType;
    });
    protected optTogglePosition = computed(() => {
        const togglePosition = this.togglePosition();
        return !togglePosition || togglePosition === 'none' ? 'after' : togglePosition;
    });
    protected optIconPosition = computed(() => this.optTogglePosition() === 'after' ? 'before' : 'after');

    //protected _items = viewChildren(CSListOption);
    protected _viewports = viewChildren(CdkVirtualScrollViewport);
    protected _optTemplates = viewChildren(CSNamedTemplate);
    private _searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
    private _searchContainer = viewChild<ElementRef<HTMLElement>>('searchContainer');


    protected showIcon = computed(() => this.iconTemplate() != null);
    protected iconTemplate = computed(() => this._optTemplates().find(t => t.name() === this.iconType()));
    protected indexTemplate = computed(() =>
        this.showIndex()
            ? this._optTemplates().find(t => t.name() === 'index')
            : undefined);
    protected titleTemplate = computed(() =>
        this.showTitle()
            ? this._optTemplates().find(t => t.name() === 'title')
            : undefined);

    // private _currentItem: TRow | null = null;




    // private _dataSourceObserver = new DataSourceObserver<TRow>();
    // private _dataVersion = signal(0);

    // private _allData = toSignal(this._dataSourceObserver.dataSourceChanged
    //     .pipe(tap(d => this._changeCurrentItem(d?.at(0)))), { initialValue: [] });


    // private _isCategorized = signal(false);
    // private _coreValue: WritableSignal<TValue[] | null> = signal(null);
    // private _itemMoved = signal(false);

    // _selectedHeight = computed(() => this._data().selected.length * this._optionHeight());
    // _data: Signal<CategorizedData<TRow>> = computed(() => {
    //     this._itemMoved();
    //     this._dataVersion();
    //     const allData = this._allData();
    //     const filter = this._filter();
    //     if (this._isCategorized()) {
    //         const { selected, noneSelected, filtered } = this._getCategorizedData(allData, filter, this._coreValue());
    //         return { filtered, selected, noneSelected };
    //     } else {
    //         let filtered;
    //         if (filter) {
    //             const filterPredicate = this.filterPredicate ?? this._filterPredicate ?? DefaultFilterFn;
    //             filtered = allData.filter(i => filterPredicate(i, filter));
    //         } else {
    //             filtered = [...allData];
    //         }
    //         return { filtered, selected: [], noneSelected: [] };
    //     }
    // });

    isSelected(value?: TValue | null | undefined): boolean {
        throw new Error('Method not implemented.');
    }
    _isOptionCurrent(option: ICSListOption<TRow, TValue>): boolean {
        throw new Error('Method not implemented.');
    }
    _notifyTouched(): void {
        throw new Error('Method not implemented.');
    }
    _optionSelectChange(option: ICSListOption<TRow, TValue>, selected: boolean): void {
        throw new Error('Method not implemented.');
    }
    _optionClicked(option: ICSListOption<TRow, TValue>): void {
        throw new Error('Method not implemented.');
    }








    // @Input()
    // get value(): TValue | TValue[] | null {
    //     const _signalValue = this._coreValue();
    //     const _value = _signalValue == null ? null : this.multiple ? _signalValue : _signalValue[0] ?? null;
    //     return _value;
    // }
    // set value(newValue: TValue | TValue[] | null) {
    //     this._setValue(newValue);
    //     this._notifyValueChange();
    // }

    // @Input()
    // get categorized(): ListCategorizedMode { return this._categorized; }
    // set categorized(value: ListCategorizedMode) {
    //     if (this._categorized != value) {
    //         this._categorized = value;
    //         this._isCategorized.set(value === 'split' || value === 'sticky');
    //     }
    // }



    // @Input()
    // get dataSource(): NovaDataSource<TRow> { return this._dataSourceObserver.datasource; }
    // set dataSource(value: NovaDataSource<TRow>) {
    //     this._dataSourceObserver.datasource = value;
    // }

    // deselectAll(): void {
    //     if (!this.multiple)
    //         return;
    //     this._selectionModel.setSelection(...[]);
    //     this._reportValueChange();
    //     this._markOptionsForCheck();
    //     this._scrollViewPortToStart();
    //     this.selectionChange.emit({ list: this, type: 'deselect', selectedData: [], value: this.value, reason: 'all' });
    // }

    // selectAll(onlyFiltered = false): void {
    //     if (!this.multiple)
    //         return;
    //     const _data = onlyFiltered && this._filter() ? this._data().filtered : this._allData();
    //     const allSeelcted = this._bindingConfig.getAllActiveValues(_data) ?? [];
    //     this._selectionModel.setSelection(...allSeelcted);
    //     this._reportValueChange();
    //     this._markOptionsForCheck();
    //     this._scrollViewPortToStart();
    //     this.selectionChange.emit({ list: this, type: 'select', selectedData: _data, value: this.value, reason: 'all' });
    // }

    // getSelectedData(): TRow[] {
    //     return this._bindingConfig.getSelectedItems(this._allData(), this._coreValue()) ?? [];
    // }

    // getSelectedTitles(): string[] {
    //     return this._bindingConfig.getSelectedTitles(this._allData(), this._coreValue()) ?? [];
    // }

    setFilter(value?: string | null) {
        this._filter.set(value);
    }

    // _onFilterInput(event: Event) {
    //     const filterValue = (event.target as HTMLInputElement)?.value;
    //     this.setFilter(filterValue);
    // }

    // _identify = (index: number, item: TRow) => {
    //     return this._bindingConfig.valueMemberFn ? this._bindingConfig.valueMemberFn(item) : item;
    // }

    // _handleKeydown(event: KeyboardEvent) {
    //     const el = event.target as HTMLElement;
    //     if (el.tagName !== OPTION_TAG_NAME)
    //         return;
    //     switch (event.code) {
    //         case 'Tab':
    //             this._searchInput?.nativeElement?.focus();
    //             preventEvent(event);
    //             break;
    //         case 'Enter':
    //         case 'Space':
    //             el.click();
    //             preventEvent(event);
    //             break;
    //         case 'ArrowDown': {
    //             const next = this.getNextElement(el);
    //             if (next) {
    //                 preventEvent(event);
    //                 focusElement(next);
    //             }
    //             break;
    //         }
    //         case 'PageUp':
    //         case 'PageDown':
    //             this.performPageUpDown(el);
    //             break;
    //         case 'ArrowUp': {
    //             const prev = this.getPreviousElement(el);
    //             if (prev) {
    //                 preventEvent(event);
    //                 focusElement(prev);
    //             }
    //             break;
    //         }
    //         case "KeyA":
    //             if (this.multiple && (event.ctrlKey || event.metaKey)) {
    //                 preventEvent(event);
    //                 this.selectAll(true);
    //             }
    //             break;
    //     }
    // }

    // _emitChangeEvent(option: NovaListOption<TRow, TValue>) {
    //     if (this._isCategorized()) {
    //         const el = option._elementRef.nativeElement as HTMLLIElement;
    //         const parent = el.parentElement;
    //         if (parent) {
    //             const index = Array.from(parent.childNodes).indexOf(el);
    //             this._activeOption = { parent, index };
    //         }
    //     }
    //     this._reportValueChange(true);
    //     this.selectionChange.emit({
    //         list: this, type: option.selected ? 'select' : 'deselect',
    //         optionValue: option.value, optionData: option.data,
    //         value: this.value,
    //         reason: 'option'
    //     });
    // }

    // _optionSelectChange(option: NovaListOption<TRow, TValue>, selected: boolean) {
    //     if (selected) {
    //         if (!this.multiple) {
    //             const old_value = this._selectionModel.selected[0];
    //             if (old_value)
    //                 this._items?.find(o => o.value === old_value)?._markForCheck();
    //             if (option.value == null)
    //                 this._selectionModel.clear();
    //         }
    //         if (option.value != null)
    //             this._selectionModel.select(option.value);
    //     } else {
    //         if (option.value != null)
    //             this._selectionModel.deselect(option.value);
    //     }

    //     option._markForCheck();
    //     this._emitChangeEvent(option);
    // }

    // _optionClicked(option: NovaListOption<TRow, TValue>): void {
    //     this._changeCurrentItem(option.data);
    // }

    // _isOptionCurrent(option: NovaListOption<TRow, TValue>): boolean {
    //     return this._currentItem === option.data;
    // }

    // setCurrentItem(item: TRow, autoScroll = true) {
    //     this._changeCurrentItem(item);
    //     if (autoScroll) {
    //         const _allData = this._allData() as TRow[];
    //         const _index = Math.max(0, _allData.indexOf(item));
    //         setTimeout(() => this._getViewPort('current-data')?.scrollToIndex(_index, 'smooth'), 10);
    //     }
    // }

    // add(row?: TRow | TRow[], autoSelect = true, autoScroll = true) {
    //     const rows = !row ? [{} as TRow] : Array.isArray(row) ? row : [row];
    //     const _allData = this._allData() as TRow[];
    //     _allData?.push(...rows);
    //     if (autoSelect)
    //         this.setCurrentItem(rows[0], autoScroll);
    //     this.reDraw();
    //     return _allData;
    // }

    // remove(row?: TRow | TRow[], autoSelect = true) {
    //     if (!row && this._currentItem)
    //         row = this._currentItem;
    //     if (!row)
    //         return;
    //     const rows = Array.isArray(row) ? row : [row];
    //     const _allData = this._allData() as TRow[];
    //     let _lastRemoved = -1;
    //     rows.forEach(element => {
    //         _lastRemoved = removeFromArray(_allData, element);
    //     });

    //     if (autoSelect) {
    //         _lastRemoved = Math.min(_lastRemoved, _allData.length - 1);
    //         this.setCurrentItem(_allData[_lastRemoved], false);
    //     }

    //     this.reDraw();
    // }

    // reDraw() {
    //     this._dataVersion.update(v => {
    //         v++;
    //         if (v >= Number.MAX_VALUE)
    //             v = 0;
    //         return v;
    //     });
    // }

    // private _changeCurrentItem(item?: TRow | null): void {
    //     this._currentItem = item ?? null;
    //     this.currentChanged.emit(item);
    // }

    // _notifyTouched() {/** */ }

    // isSelected(value: TValue | null): boolean {
    //     return (value == null && this.value == null && !this.multiple)
    //         || (value != null && this._selectionModel.isSelected(value));
    // }

    // protected _verifyValues() {
    //     // const selectedSet = this._value ?? [];
    //     // if (selectedSet.length > 0) {
    //     //     const _newSet = new Set(this._data.all.map(d => this._getValueFn()(d)));
    //     //     const exitsInNewSet = selectedSet.filter(item => _newSet.has(item));
    //     //     if (exitsInNewSet.length != selectedSet.length) {
    //     //         this._setValue(exitsInNewSet);
    //     //         this._notifyValueChange();
    //     //     }
    //     // }
    // }

    // protected onValueSet(value: TValue[], fromClick = false) {
    //     if (fromClick && this.categorized === 'split' && value?.length > this._data().selected.length) {
    //         setTimeout(() => this._getViewPort('selected')?.scrollToIndex(value.length, 'smooth'), 10);
    //     }
    //     this._coreValue.set(value);
    // }

    // protected getPreviousElement(optionElement: HTMLElement): HTMLElement | null {
    //     const el = optionElement.previousElementSibling as HTMLElement;
    //     if (!el && this.categorized === 'split') {
    //         const _parentElement = optionElement.parentElement;
    //         if (_parentElement && _parentElement === this._getViewPort('none-selected')?._contentWrapper.nativeElement) {
    //             const selected = this._getViewPort('selected')?._contentWrapper.nativeElement;
    //             if (selected) {
    //                 const _lastElementInVirtual = selected.lastElementChild as HTMLElement;
    //                 if (_lastElementInVirtual?.tagName == OPTION_TAG_NAME) {
    //                     return _lastElementInVirtual;
    //                 }
    //             }
    //         }
    //     }
    //     return el;
    // }

    // protected getNextElement(optionElement: HTMLElement): HTMLElement | null {
    //     const el = optionElement.nextElementSibling as HTMLElement;
    //     if (!el && this.categorized === 'split') {
    //         const _parentElement = optionElement.parentElement;
    //         if (_parentElement && _parentElement === this._getViewPort('selected')?._contentWrapper.nativeElement) {
    //             const noneSelected = this._getViewPort('none-selected')?._contentWrapper.nativeElement;
    //             if (noneSelected) {
    //                 const _firstElementInVirtual = noneSelected.firstElementChild as HTMLElement;
    //                 if (_firstElementInVirtual?.tagName == OPTION_TAG_NAME) {
    //                     return _firstElementInVirtual;
    //                 }
    //             }
    //         }
    //     }
    //     return el;
    // }

    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // protected performPageUpDown(el: HTMLElement) {
    //     // setTimeout(() => {
    //     //     this._element.nativeElement.focus();
    //     //     if (document.activeElement?.tagName === OptionTagName) {
    //     //         (document.activeElement as HTMLElement).focus();
    //     //     }
    //     // }, 300);
    //     // const _viewPortWrapper = el.parentElement;
    //     // const _viewport = _viewPortWrapper?.parentElement;
    //     // if (_viewport) {
    //     //     const olcPosition = el.getBoundingClientRect().top;
    //     //     setTimeout(() => {
    //     //         const childs = _viewPortWrapper.children;
    //     //         let diffTop = 0;
    //     //         for (let i = 0; i < childs.length - 1; i++) {
    //     //             const newEl1 = childs.item(i)! as HTMLElement;
    //     //             const newEl2 = childs.item(i + 1)! as HTMLElement;
    //     //             const el1Top = newEl1.getBoundingClientRect().top;
    //     //             const el2Top = newEl2.getBoundingClientRect().top;
    //     //             if (el1Top < 0 && el2Top > 0) {
    //     //                 diffTop = -el1Top;
    //     //             }
    //     //             if (numbers.between(olcPosition + diffTop, el1Top, el2Top)) {
    //     //                 newEl1.focus();
    //     //                 console.log(olcPosition, newEl1.getBoundingClientRect().top, diffTop);
    //     //                 break;
    //     //             }
    //     //         }
    //     //     }, 300);
    //     // }
    // }

    // ngAfterViewInit() {
    //     this._initialized = true;
    //     this._ngZone.runOutsideAngular(() => {
    //         this._elementRef.nativeElement.addEventListener('focusin', this._handleFocusin);
    //         this._elementRef.nativeElement.addEventListener('focusout', this._handleFocusout);
    //     });
    //     this._updateTemplateRefs();
    //     this._updateOptionsParts();
    // }

    // ngOnChanges(changes: SimpleChanges) {
    //     if ('iconType' in changes || 'showTitle' in changes || 'showIndex' in changes)
    //         this._updateTemplateRefs();
    //     if ('iconType' in changes || 'togglePosition' in changes)
    //         this._updateOptionsParts();
    //     const disabledChanges = changes['disabled'];
    //     const disableRippleChanges = changes['disableRipple'];
    //     if (
    //         (disableRippleChanges && !disableRippleChanges.firstChange) ||
    //         (disabledChanges && !disabledChanges.firstChange)
    //     ) {
    //         this._markOptionsForCheck();
    //     }
    // }



    // private _updateOptionsParts() {
    //     this._optToggleType = this.togglePosition === 'none' ? undefined : this.multiple ? 'check' : 'radio';
    //     this._optIconType = !this.iconType || this.iconType === 'none' ? undefined : this.iconType;
    //     this._optTogglePosition = !this.togglePosition || this.togglePosition === 'none' ? 'after' : this.togglePosition;
    //     this._optIconPosition = this._optTogglePosition === 'after' ? 'before' : 'after';
    // }

    // ngAfterViewChecked(): void {
    //     if (this._activeOption && this._isCategorized()) {
    //         const activeOption = this._activeOption;
    //         this._activeOption = null;
    //         setTimeout(() => {
    //             if (this._isCategorized()) {
    //                 const children = activeOption.parent.children;
    //                 const _activeIndex = Math.min(activeOption.index, children.length - 1);
    //                 (children[_activeIndex] as HTMLElement)?.focus();
    //             }
    //         }, 100);
    //     } else if (this._needToSetFocus) {
    //         this._needToSetFocus = false;
    //         setTimeout(() => this.focus(), 100);
    //     }
    // }

    // ngOnDestroy() {
    //     this._isDestroyed = true;
    //     this._elementRef.nativeElement.removeEventListener('focusin', this._handleFocusin);
    //     this._elementRef.nativeElement.removeEventListener('focusout', this._handleFocusout);
    // }

    // focus(options?: FocusOptions) {
    //     if (!this._initialized) {
    //         this._needToSetFocus = true;
    //         return;
    //     }
    //     if (this._items?.length) {
    //         this._items.get(0)?.focus();
    //     } else if (this._searchInput && this.showSearch) {
    //         this._searchInput.nativeElement.focus(options);
    //     }
    //     else {
    //         this._elementRef.nativeElement.focus();
    //     }
    // }

    // getSearchHeight() {
    //     if (!this.showSearch || !this.searchContainer)
    //         return 0;
    //     return this.searchContainer.nativeElement.clientHeight;
    // }

    // refreshItem(item: TRow) {
    //     this._items?.find(o => o.data === item)?.update();
    // }

    // protected drop(event: CdkDragDrop<TRow[]>, data: TRow[]) {
    //     const allData = this._allData() as TRow[];
    //     const previousItem = data[event.previousIndex];
    //     const currentItem = data[event.currentIndex];
    //     const previousIndex = allData.indexOf(previousItem);
    //     const currentIndex = allData.indexOf(currentItem);
    //     moveItemInArray(allData, previousIndex, currentIndex);
    //     this._itemMoved.set(!this._itemMoved());
    // }

    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // protected notifyFocused(focused: boolean) {/** */ }

    // //#region data process

    // private _getCategorizedData(data: readonly TRow[], filter?: string | null, value?: TValue[] | null) {
    //     const selected: TRow[] = [];
    //     const noneSelected: TRow[] = [];
    //     const selectedSet = new Set(value ?? []);
    //     const _cValueFn = this._bindingConfig.valueMemberFn ?? (i => i);
    //     for (const item of data) {
    //         if (selectedSet.size && selectedSet.has(_cValueFn(item))) {
    //             selected.push(item);
    //         } else {
    //             if (filter) {
    //                 const filterPredicate = this.filterPredicate ?? this._filterPredicate ?? DefaultFilterFn;
    //                 if (filterPredicate(item, filter))
    //                     noneSelected.push(item);
    //             } else {
    //                 noneSelected.push(item);
    //             }
    //         }
    //     }
    //     const filtered = this.categorized === 'sticky' ? selected.concat(noneSelected) : [];
    //     return { selected, noneSelected, filtered };
    // }

    // //#endregion

    // protected _setValue(value?: TValue | TValue[] | null) {
    //     let _value = value == null ? [] : !Array.isArray(value) ? [value] : value;
    //     if (!this.multiple && _value && _value.length > 1)
    //         _value = _value.slice(0, 1);
    //     this._selectionModel.setSelection(..._value);
    //     this.onValueSet(_value);
    //     this._markOptionsForCheck();
    // }

    // private _reportValueChange(fromClick = false) {
    //     if (!this._isDestroyed) {
    //         this.onValueSet(this._selectionModel.selected, fromClick);
    //         this._notifyValueChange();
    //     }
    // }

    // protected _notifyValueChange() {/** */ }

    // protected _markOptionsForCheck() {
    //     if (this._items)
    //         this._items.forEach(option => option._markForCheck());
    // }

    // private _scrollViewPortToStart() {
    //     if (this._viewports)
    //         this._viewports.forEach(viewport => viewport.scrollToOffset(0));
    // }

    // private _handleFocusout = () => {
    //     // Focus takes a while to update so we have to wrap our call in a timeout.
    //     setTimeout(() => {
    //         if (!this._containsFocus()) {
    //             this.notifyFocused(false);
    //         }
    //     });
    // };

    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // private _handleFocusin = (event: FocusEvent) => {
    //     if (this.disabled) {
    //         return;
    //     }
    //     this.notifyFocused(true);
    // };

    // private _containsFocus() {
    //     const activeElement = _getFocusedElementPierceShadowDom();
    //     return activeElement && this._elementRef.nativeElement.contains(activeElement);
    // }

    // private _getViewPort(id: string) {
    //     return this._viewports?.find(i => i.elementRef.nativeElement.id === id);
    // }

    ngAfterViewInit(): void {
        throw new Error('Method not implemented.');
    }
    ngAfterViewChecked(): void {
        throw new Error('Method not implemented.');
    }
    ngOnChanges(changes: SimpleChanges): void {
        throw new Error('Method not implemented.');
    }
    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
    }
}