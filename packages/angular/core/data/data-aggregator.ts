import { arrayAvg, arraySort, arraySum, getValue } from "@codinus/js-extensions";
import { IGenericRecord, IRecord } from "@codinus/types";
import { CSAggregation, ICSDataAggregator } from "./types";

export class CSDataAggregator<T> implements ICSDataAggregator<T> {
    private _aggregationCache: IRecord<Record<CSAggregation, unknown>> = {};
    disableCache = false;
    private _data: T[] = [];

    setData(data: T[]) {
        this._data = data;
        this.refresh();
    }

    aggregate(key: string, type: CSAggregation): unknown {
        if (this.disableCache)
            return this.aggregateCore(d => (d as IGenericRecord)[key], type);
        else
            return this.aggregateFromCache(key, type);
    }

    refresh(key?: string): void {
        if (key == null)
            this._aggregationCache = {};
        else
            delete this._aggregationCache[key];
    }

    private aggregateFromCache(key: string, type: CSAggregation): unknown {
        let entry;
        if (Object.hasOwn(this._aggregationCache, key))
            entry = this._aggregationCache[key];
        else
            this._aggregationCache[key] = entry = {} as Record<CSAggregation, unknown>;

        if (Object.hasOwn(entry, type))
            return entry[type];

        const value = this.aggregateCore(d => getValue(d, key), type);
        entry[type] = value;
        return value;
    }

    protected aggregateCore(transform: (item: T) => unknown, type: CSAggregation) {
        const data = this._data;
        if (!Array.isArray(data))
            return null;
        switch (type) {
            case 'sum':
                return arraySum(data, transform as ((item: T) => number));
            case 'max':
                return arraySort(data, transform, -1).at(0);
            case 'min':
                return arraySort(data, transform).at(0);
            case 'count':
                return data?.length ?? 0;
            case 'first':
                return data?.at(0);
            case 'last':
                return data?.at(-1);
            case 'avg':
                return arrayAvg(data, transform as ((item: T) => number));
            default:
                return null;
        }
    }
}
