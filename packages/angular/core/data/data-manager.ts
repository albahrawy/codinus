import { moveItemInArray } from "@angular/cdk/drag-drop";
import { computed, effect, linkedSignal, Signal, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { removeFromArray, toStringValue } from "@codinus/js-extensions";
import { Nullable } from "@codinus/types";
import { signalVersion } from "../shared";
import { CSDataSourceObserver } from "./datasource-observer";
import { CSListBinder } from "./list-binder";
import { CSDataSource, CSStringFilterPredicate, IDataManagerSupport } from "./types";

export class CSDataManager<TRecord, TValue = unknown> extends CSListBinder<TRecord, TValue> {

    private readonly _dataSourceObserver: CSDataSourceObserver<TRecord>;
    private _filter = signal<Nullable<string>>(null);

    private _itemMoved = signal(false);
    private _hasCustomFilter = computed(() => this.host.hasCustomFilter?.() ?? false);
    private _internalData: Signal<readonly TRecord[]>;

    readonly filterApplied = computed(() => !!this._filter());
    readonly _dataVersion = signalVersion();

    readonly DefaultRemoveHandler: (rows: TRecord[]) => Nullable<TRecord> = (rows: TRecord[]) => {
        const _data = this.dataTracker().data;
        let _lastRemoved = -1;
        rows.forEach(element => {
            _lastRemoved = removeFromArray(_data, element);
        });

        _lastRemoved = Math.min(_lastRemoved, _data.length - 1);
        return _data[_lastRemoved];
    }

    readonly DefaultAddHandler = (rows: TRecord[]) => {
        const _data = this.dataTracker().data;
        _data?.push(...rows);
        return rows[0];
    }

    readonly DefaultIsRecordPartOfData = (data: readonly TRecord[], record: Nullable<TRecord>) => !!record && data.includes(record);

    constructor(public host: IDataManagerSupport<TRecord, TValue>, dsSync?: () => () => CSDataSource<TRecord>) {
        super(host);
        this._dataSourceObserver = new CSDataSourceObserver<TRecord>({ dsSync });
        this._internalData = toSignal(this._dataSourceObserver.dataSourceChanged, { initialValue: [] });

        effect(() => {
            this.host.currentChanged.emit(this._currentItem());
        });
    }

    private _filterPredicate = computed<CSStringFilterPredicate<TRecord>>(() => {
        const customFilter = this.host.filterPredicate?.();
        if (customFilter)
            return customFilter;
        const titleFn = this.displayMember();
        return (d, f) => !!f && toStringValue(titleFn(d)).toLowerCase().includes(f.toLowerCase());
    });

    dataTracker = computed(() => {
        return {
            varsion: this._dataVersion(),
            dataSwapped: this._itemMoved(),
            data: this._internalData() as TRecord[]
        }
    });

    filteredData: Signal<TRecord[]> = computed(() => {
        if (this.host._hasfilterStrategy?.())
            return this.host._applyFilterStartegy?.(this.dataTracker().data, this._filter(), this._filterPredicate()) ?? [];
        else
            return this.applyDefaultFilter();
    });

    private _currentItem = linkedSignal<readonly TRecord[], Nullable<TRecord>>({
        source: () => this.dataTracker().data,
        computation: (sourceData, previous) => {
            const prev = previous?.value;
            const checker = this.host._isRecordPartOfData ?? this.DefaultIsRecordPartOfData;
            return checker(sourceData, prev)
                ? prev
                : this.host.activateFirstItem() ?
                    sourceData[0]
                    : null;
        }
    });

    currentItem = this._currentItem.asReadonly();

    getData(onlyFiltered?: boolean) {
        return onlyFiltered ? this.filteredData() : this.dataTracker().data;
    }

    getSelectedRecords(value: Nullable<TValue[]>): TRecord[] {
        return this.getItemsOfValue(this.dataTracker().data, value) ?? [];
    }

    getSelectedTitles(value: Nullable<TValue[]>): string[] | null {
        return this.getTitlesOfValue(this.dataTracker().data, value);
    }

    applyDefaultFilter() {
        const origData = this.dataTracker().data;
        const filter = this._filter();
        if (filter || this._hasCustomFilter()) {
            const filterPredicate = this._filterPredicate();
            return origData.filter(i => filterPredicate(i, filter));
        } else {
            return [...origData];
        }
    }

    isCurrent(record: TRecord): boolean {
        return this._currentItem() === record;
    }

    setCurrent(record: Nullable<TRecord>, autoScroll = false): void {
        const currentChanging = this.host.currentChanging?.();
        if (typeof currentChanging === 'function') {
            if (!currentChanging(this._currentItem(), record))
                return;
        }

        this._currentItem.set(record);
        if (autoScroll && record) {
            const _data = this.dataTracker().data;
            this.host.scrollToIndex(Math.max(0, _data.indexOf(record)), record);
        }
    }

    setFilter(value: Nullable<string>): void {
        this._filter.set(value);
    }

    add(row: Nullable<TRecord | TRecord[]>, setCurrent = true, autoScroll = true) {
        const rows = !row ? [{} as TRecord] : Array.isArray(row) ? row : [row];
        const addHandler = this.host._dataAddHandler ?? this.DefaultAddHandler;
        const newCurrent = addHandler(rows);
        if (setCurrent)
            this.setCurrent(newCurrent, autoScroll);
        this.reDraw();
        return this.dataTracker().data;
    }

    remove(row: Nullable<TRecord | TRecord[]>, setCurrent = true): boolean {
        row ??= this._currentItem();
        if (!row)
            return false;
        const rows = Array.isArray(row) ? row : [row];
        const removeHandler = this.host._dataRemoveHandler ?? this.DefaultRemoveHandler;
        const newCurrent = removeHandler(rows);
        if (setCurrent)
            this.setCurrent(newCurrent);

        this.reDraw();
        return true;
    }

    reDraw() {
        this._dataVersion.refresh();
    }

    swapRecord(previousIndex: number, currentIndex: number) {
        const data = this.dataTracker().data as TRecord[];
        const filteredData = this.filteredData();
        const previousItem = filteredData[previousIndex];
        const currentItem = filteredData[currentIndex];
        moveItemInArray(data, data.indexOf(previousItem), data.indexOf(currentItem));
        this._itemMoved.set(!this._itemMoved());
    }
}