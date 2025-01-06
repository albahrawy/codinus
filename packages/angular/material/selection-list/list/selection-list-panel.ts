import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { CdkVirtualScrollViewport, ScrollingModule, ViewportRuler } from '@angular/cdk/scrolling';
import {
    AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef,
    Input, NgZone, OnDestroy, Signal, ViewEncapsulation, booleanAttribute, computed,
    effect, forwardRef, inject, input, numberAttribute, output, signal, untracked, viewChild, viewChildren
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatList, MatListModule } from '@angular/material/list';
import { focusElement, preventEvent } from '@codinus/dom';
import { removeFromArray, toStringValue } from '@codinus/js-extensions';
import { Nullable, ObjectGetter } from '@codinus/types';
import { HtmlElementRuler } from '@ngx-codinus/cdk/observer';
import { CSDataSource, CSDataSourceObserver, CSListBinder, CSSelectionModel } from '@ngx-codinus/core/data';
import { createEventManager } from '@ngx-codinus/core/events';
import { CSNamedTemplate } from '@ngx-codinus/core/outlet';
import {
    CODINUS_CONTEXT_MENU_PARENT, ConextMenuOpeningArgs, ICSContextMenuParent
} from '@ngx-codinus/material/context-menu';
import { CSListOption } from '../option/list-option';
import {
    CODINUS_SELECTION_LIST, CSVirtualSelectionListChange, ICSListOption,
    ICSSelectionList, ListFilterPredicate, ListIconType, ListTogglePosition
} from './types';

const OPTION_TAG_NAME = 'CS-LIST-OPTION';

const DEFAULT_OPTION_HEIGHT = 48;

@Component({
    selector: 'cs-selection-list-panel',
    templateUrl: './selection-list.html',
    styleUrls: ['./selection-list.scss'],
    host: {
        'class': 'mat-mdc-selection-list mat-mdc-list-base mdc-list cs-selection-list-panel',
        'role': 'listbox',
        '[attr.aria-multiselectable]': 'multiple()',
        '[class.cs-list--hasIcon]': '_showIcon()',
        '[class.cs-list--hasIndex]': 'showIndex()',
        '[class.cs-selection-list-panel-disabled]': '!enabled()',
        '[style.--cs-virtual-list-item-height.px]': '_optionHeight()',
        '(keydown)': '_handleKeydown($event)',
    },
    imports: [MatInputModule, MatDividerModule, CSNamedTemplate, CSListOption,
        MatIconModule, MatListModule, ScrollingModule, CdkDropList, CdkDrag],
    providers: [
        {
            provide: ViewportRuler,
            useFactory: (list: CSSelectionListPanel<unknown, unknown>) => list._htmlElementRuler,
            deps: [forwardRef(() => CSSelectionListPanel)],
        },
        { provide: MatList, useExisting: CSSelectionListPanel },
        { provide: CODINUS_SELECTION_LIST, useExisting: CSSelectionListPanel },
        { provide: CODINUS_CONTEXT_MENU_PARENT, useExisting: CSSelectionListPanel },
    ],
    hostDirectives: [HtmlElementRuler],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class CSSelectionListPanel<TRow, TValue = unknown>
    extends MatList implements ICSSelectionList<TRow, TValue>,
    ICSContextMenuParent, AfterViewInit, AfterViewChecked, OnDestroy {

    override _isNonInteractive = false;

    //#region injection

    private _elementRef = inject(ElementRef);
    protected _htmlElementRuler = inject(HtmlElementRuler, { self: true });
    private _ngZone = inject(NgZone);

    //#endregion

    private _needToSetFocus = false;
    private _pendingFocusOption?: HTMLElement;
    private _initialized = false;
    private _currentItem: TRow | null = null;

    private _filter = signal<Nullable<string>>(null);
    private _dataVersion = signal(0);
    private _itemMoved = signal(false);
    private _coreValue = signal<TValue[] | null>(null);
    private _isDisabled = signal(false);

    private _selectionModel = new CSSelectionModel<TValue>(false);
    private _eventManager = createEventManager();

    readonly _binder = new CSListBinder<TRow, TValue>(this);

    //#region output
    readonly conextMenuOpening = output<ConextMenuOpeningArgs>();
    readonly selectionChange = output<CSVirtualSelectionListChange<TRow, TValue>>();
    readonly currentChanged = output<Nullable<TRow>>();
    //#endregion

    //#region inputs

    displayMember = input<ObjectGetter<TRow>>();
    valueMember = input<ObjectGetter<TRow, TValue>>();
    disableMember = input<ObjectGetter<TRow, boolean>>();
    iconMember = input<ObjectGetter<TRow>>();
    filterPredicate = input<ListFilterPredicate<TRow>>();

    multiple = input(false, { transform: booleanAttribute });
    readOnly = input(false, { transform: booleanAttribute });
    selectOnlyByCheckBox = input(false, { transform: booleanAttribute });
    enableDrag = input(false, { transform: booleanAttribute });
    stickySelected = input(false, { transform: booleanAttribute });

    showIndex = input(false, { transform: booleanAttribute });
    showTitle = input(true, { transform: booleanAttribute });
    showSearch = input(true, { transform: booleanAttribute });
    dataSource = input<CSDataSource<TRow>>();

    togglePosition = input<ListTogglePosition>('after');
    iconType = input<ListIconType>('none');
    optionHeight = input(48, { transform: numberAttribute });

    @Input()
    get value(): TValue | TValue[] | null {
        const _signalValue = this._coreValue();
        const _value = _signalValue == null
            ? null
            : this.multiple()
                ? _signalValue
                : _signalValue[0] ?? null;
        return _value;
    }
    set value(newValue: TValue | TValue[] | null) {
        this._setValue(newValue);
        this._notifyValueChange();
    }

    //#endregion

    //#region viewchildren

    protected _items = viewChildren(CSListOption);
    protected _viewport = viewChild(CdkVirtualScrollViewport);
    protected _optTemplates = viewChildren(CSNamedTemplate);
    private _searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
    private _searchContainer = viewChild<ElementRef<HTMLElement>>('searchContainer');

    //#endregion

    constructor() {
        super();
        effect(() => {
            const multiple = this.multiple();
            if (multiple != this._selectionModel.multiple) {
                this._selectionModel.multiple = multiple;
                if (this._initialized) {
                    this.value = this._selectionModel.selected;
                }
            }
        });

        effect(() => {
            this._selectionModel.setSelection(...this._coreValue() ?? []);
            this._notifyValueChange();
        });
    }

    //#region data population

    private _dataSourceObserver = new CSDataSourceObserver<TRow>({ host: this });
    private _origData = toSignal(this._dataSourceObserver.dataSourceChanged, { initialValue: [] });

    private _filterPredicate = computed<ListFilterPredicate<TRow>>(() => {
        const customFilter = this.filterPredicate();
        if (customFilter)
            return customFilter;
        const titleFn = this._binder.displayMember();
        return (d, f) => toStringValue(titleFn(d)).includes(f);
    });

    protected _data: Signal<TRow[]> = computed(() => {
        this._itemMoved();
        this._dataVersion();
        const origData = this._origData();
        const filter = this._filter();
        if (this.stickySelected()) {
            return this._getStickyData(origData, filter, this._coreValue());
        } else {
            if (filter) {
                const filterPredicate = this._filterPredicate();
                return origData.filter(i => filterPredicate(i, filter));
            } else {
                return [...origData];
            }
        }
    });

    //#endregion

    //#region templates & view options

    protected _optionHeight = computed(() => {
        const height = this.optionHeight();
        return !height || isNaN(height) ? DEFAULT_OPTION_HEIGHT : height;
    });

    _optionToggleType = computed(() => this.togglePosition() === 'none' ? null : this.multiple() ? 'check' : 'radio');
    _optionIconType = computed(() => {
        const iconType = this.iconType();
        return !iconType || iconType === 'none' ? null : iconType;
    });
    _optionTogglePosition = computed(() => {
        const togglePosition = this.togglePosition();
        return !togglePosition || togglePosition === 'none' ? 'after' : togglePosition;
    });
    _optionIconPosition = computed(() => this._optionTogglePosition() === 'after' ? 'before' : 'after');

    protected _showIcon = computed(() => this._iconTemplate() != null);
    _iconTemplate = computed(() => this._optTemplates().find(t => t.name() === this.iconType())?.template);
    _indexTemplate = computed(() =>
        this.showIndex()
            ? this._optTemplates().find(t => t.name() === 'index')?.template
            : undefined);
    _titleTemplate = computed(() =>
        this.showTitle()
            ? this._optTemplates().find(t => t.name() === 'title')?.template
            : undefined);

    //#endregion

    enabled = computed(() => { return !this._isDisabled() && !this.readOnly(); });

    override get disabled(): boolean {
        return super.disabled;
    }
    override set disabled(value: boolean) {
        super.disabled = value;
        this._isDisabled.set(value);
    }

    isSelected(value: Nullable<TValue>): boolean {
        this._selectionModel.changedSignal();
        return (value == null && this.value == null && !this.multiple())
            || (value != null && this._selectionModel.isSelected(value));
    }

    _isOptionCurrent(option: ICSListOption<TRow, TValue>): boolean {
        return this._currentItem === option.data();
    }

    _optionSelectChange(option: ICSListOption<TRow, TValue>, selected: boolean): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const index = this._items().indexOf(option as any);
        this._pendingFocusOption = this._items().at(Math.min(this._items().length - 1, index + 1))?._elementRef.nativeElement;
        if (selected) {
            // if (!this.multiple()) {
            //     if (option.value == null)
            //         this._selectionModel.clear();
            // }
            if (option.value() != null)
                this._selectionModel.select(option.value());
        } else {
            if (option.value() != null)
                this._selectionModel.deselect(option.value());
        }
        untracked(() => this._coreValue.set(this._selectionModel.selected))

        this._emitChangeEvent(option);
    }

    _optionClicked(option: ICSListOption<TRow, TValue>): void {
        this._changeCurrentItem(option.data());
    }

    protected _onFilterInput(event: Event) {
        this.setFilter((event.target as HTMLInputElement)?.value);
    }

    protected _trackBy = (index: number, item: TRow) => {
        return this._binder.valueMember()(item);
    }

    protected _handleKeydown(event: KeyboardEvent) {
        if (!this.enabled)
            return;

        const el = event.target as HTMLElement;
        if (el.tagName !== OPTION_TAG_NAME)
            return;
        switch (event.code) {
            case 'Tab':
                this._searchInput()?.nativeElement?.focus();
                preventEvent(event);
                break;
            case 'Enter':
            case 'Space':
                el.click();
                preventEvent(event);
                break;
            case 'ArrowDown': {
                const next = el.nextElementSibling;
                if (next) {
                    preventEvent(event);
                    focusElement(next);
                }
                break;
            }
            case 'PageUp':
            case 'PageDown':
                this.performPageUpDown(el);
                break;
            case 'ArrowUp': {
                const prev = el.previousElementSibling;
                if (prev) {
                    preventEvent(event);
                    focusElement(prev);
                }
                break;
            }
            case "KeyA":
                if (this.multiple() && (event.ctrlKey || event.metaKey)) {
                    preventEvent(event);
                    this.selectAll(true);
                }
                break;
        }
    }

    deselectAll(): void {
        if (!this.multiple())
            return;
        this._coreValue.set(null);
        this._viewport()?.scrollToOffset(0);
        this.selectionChange.emit({ list: this, type: 'deselect', selectedData: [], value: this.value, reason: 'all' });
    }

    selectAll(onlyFiltered = false): void {
        if (!this.multiple())
            return;
        const _data = onlyFiltered && this._filter() ? this._data() : this._origData();
        const activeData = this._binder.getActive(_data);
        if (!activeData)
            return;
        this._coreValue.set(activeData.values);
        this._viewport()?.scrollToOffset(0);
        this.selectionChange.emit({
            list: this,
            type: 'select',
            selectedData: activeData.data ?? [],
            value: activeData.values,
            reason: 'all'
        });
    }

    getSelectedData(): TRow[] {
        return this._binder.getSelectedItems(this._origData(), this._coreValue()) ?? [];
    }

    getSelectedTitles(): string[] {
        return this._binder.getSelectedTitles(this._origData(), this._coreValue()) ?? [];
    }

    setFilter(value?: string | null) {
        this._filter.set(value);
    }

    _emitChangeEvent(option: ICSListOption<TRow, TValue>) {
        this.selectionChange.emit({
            list: this, type: option.selected() ? 'select' : 'deselect',
            optionValue: option.value(), optionData: option.data(),
            value: this.value,
            reason: 'option'
        });
    }

    setCurrentItem(item: TRow, autoScroll = true) {
        this._changeCurrentItem(item);
        if (autoScroll) {
            const _data = this._origData() as TRow[];
            const _index = Math.max(0, _data.indexOf(item));
            setTimeout(() => this._viewport()?.scrollToIndex(_index, 'smooth'), 10);
        }
    }

    add(row?: TRow | TRow[], autoSelect = true, autoScroll = true) {
        const rows = !row ? [{} as TRow] : Array.isArray(row) ? row : [row];
        const _data = this._origData() as TRow[];
        _data?.push(...rows);
        if (autoSelect)
            this.setCurrentItem(rows[0], autoScroll);
        this.reDraw();
        return _data;
    }

    remove(row?: TRow | TRow[], autoSelect = true) {
        if (!row && this._currentItem)
            row = this._currentItem;
        if (!row)
            return;
        const rows = Array.isArray(row) ? row : [row];
        const _data = this._origData() as TRow[];
        let _lastRemoved = -1;
        rows.forEach(element => {
            _lastRemoved = removeFromArray(_data, element);
        });

        if (autoSelect) {
            _lastRemoved = Math.min(_lastRemoved, _data.length - 1);
            this.setCurrentItem(_data[_lastRemoved], false);
        }

        this.reDraw();
    }

    reDraw() {
        this._dataVersion.update(v => {
            v++;
            if (v >= Number.MAX_VALUE)
                v = 0;
            return v;
        });
    }

    private _changeCurrentItem(item?: TRow | null): void {
        this._currentItem = item ?? null;
        this.currentChanged.emit(item);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected performPageUpDown(el: HTMLElement) {
        // setTimeout(() => {
        //     this._element.nativeElement.focus();
        //     if (document.activeElement?.tagName === OptionTagName) {
        //         (document.activeElement as HTMLElement).focus();
        //     }
        // }, 300);
        // const _viewPortWrapper = el.parentElement;
        // const _viewport = _viewPortWrapper?.parentElement;
        // if (_viewport) {
        //     const olcPosition = el.getBoundingClientRect().top;
        //     setTimeout(() => {
        //         const childs = _viewPortWrapper.children;
        //         let diffTop = 0;
        //         for (let i = 0; i < childs.length - 1; i++) {
        //             const newEl1 = childs.item(i)! as HTMLElement;
        //             const newEl2 = childs.item(i + 1)! as HTMLElement;
        //             const el1Top = newEl1.getBoundingClientRect().top;
        //             const el2Top = newEl2.getBoundingClientRect().top;
        //             if (el1Top < 0 && el2Top > 0) {
        //                 diffTop = -el1Top;
        //             }
        //             if (numbers.between(olcPosition + diffTop, el1Top, el2Top)) {
        //                 newEl1.focus();
        //                 console.log(olcPosition, newEl1.getBoundingClientRect().top, diffTop);
        //                 break;
        //             }
        //         }
        //     }, 300);
        // }
    }

    focus(options?: FocusOptions) {
        if (!this.enabled)
            return;
        if (!this._initialized) {
            this._needToSetFocus = true;
            return;
        }
        if (this._items()?.length) {
            this._items().at(0)?.focus();
        } else if (this._searchInput && this.showSearch()) {
            this._searchInput()?.nativeElement.focus(options);
        }
        else {
            this._elementRef.nativeElement.focus();
        }
    }

    getSearchHeight() {
        if (!this.showSearch() || !this._searchContainer())
            return 0;
        return this._searchContainer()?.nativeElement.clientHeight;
    }

    refreshItem(item: TRow) {
        this._items().find(o => o.data === item)?.update();
    }

    protected drop(event: CdkDragDrop<TRow[]>, data: TRow[]) {
        const allData = this._origData() as TRow[];
        const previousItem = data[event.previousIndex];
        const currentItem = data[event.currentIndex];
        const previousIndex = allData.indexOf(previousItem);
        const currentIndex = allData.indexOf(currentItem);
        moveItemInArray(allData, previousIndex, currentIndex);
        this._itemMoved.set(!this._itemMoved());
    }

    private _getStickyData(data: readonly TRow[], filter?: string | null, value?: TValue[] | null) {
        const selected: TRow[] = [];
        const noneSelected: TRow[] = [];
        const selectedSet = new Set(value ?? []);
        const _cValueFn = this._binder.valueMember();
        const filterPredicate = this._filterPredicate()

        for (const item of data) {
            if (selectedSet.size && selectedSet.has(_cValueFn(item)))
                selected.push(item);
            else if (!filter || filterPredicate(item, filter))
                noneSelected.push(item);
        }
        return selected.concat(noneSelected);
    }

    protected _setValue(value?: TValue | TValue[] | null) {
        let _value = value == null ? [] : !Array.isArray(value) ? [value] : value;
        if (!this.multiple() && _value && _value.length > 1)
            _value = _value.slice(0, 1);
        this._coreValue.set(_value);
    }

    _notifyTouched() {/** */ }
    protected _notifyValueChange() {/** */ }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected notifyFocused(focused: boolean) {/** */ }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _handleFocusin = (event: FocusEvent) => {
        if (this.disabled) {
            return;
        }
        this.notifyFocused(true);
    };

    private _handleFocusout = () => {
        // Focus takes a while to update so we have to wrap our call in a timeout.
        setTimeout(() => {
            if (!this._containsFocus()) {
                this.notifyFocused(false);
            }
        });
    };

    private _containsFocus() {
        const activeElement = _getFocusedElementPierceShadowDom();
        return activeElement && this._elementRef.nativeElement.contains(activeElement);
    }

    //#region life cycle

    ngAfterViewInit(): void {
        this._initialized = true;
        this._ngZone.runOutsideAngular(() => {
            this._eventManager.listenAndRegister('focusin', this._elementRef.nativeElement, 'focusin', this._handleFocusin);
            this._eventManager.listenAndRegister('focusout', this._elementRef.nativeElement, 'focusout', this._handleFocusout)
        });
    }

    ngAfterViewChecked(): void {
        if (this.stickySelected() && this._pendingFocusOption) {
            this._pendingFocusOption.focus({ preventScroll: true });
            this._pendingFocusOption = undefined;
        }
        else if (this._needToSetFocus) {
            this._needToSetFocus = false;
            setTimeout(() => this.focus(), 100);
        }
    }

    ngOnDestroy(): void {
        this._eventManager.unRegisterAll();
    }

    //#endregion
}