import { Injectable } from '@angular/core';
import { jsonMap } from '@codinus/js-extensions';
import { IGenericRecord, IRecord } from '@codinus/types';
import { DataResponseType, DataTableCompactResponseType, ICSDataResponseParser } from './types';

@Injectable({ providedIn: 'root' })
export class CSDataResponseParser implements ICSDataResponseParser {

    parse(data: unknown, responseType?: DataResponseType): unknown {
        switch (responseType) {
            case 'set':
                return isCompactDataSet(data) ? jsonMap(data, v => this._parseCompactTable(v)) : data;
            case undefined:
            case null:
            case 'table':
                return isCompactTable(data) ? this._parseCompactTable(data) : data;
            default:
                return data;
        }
    }

    private _parseCompactTable(data: DataTableCompactResponseType): unknown {
        return data.rows.map(r =>
            data.columns.reduce((result, current, index) => {
                result[current] = r[index];
                return result;
            }, {} as IGenericRecord));
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isCompactTable(data: any): data is DataTableCompactResponseType {
    return data && Array.isArray(data.columns) && Array.isArray(data.rows)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isCompactDataSet(data: any): data is IRecord<DataTableCompactResponseType> {
    return data && isCompactTable(Object.values(data as IGenericRecord).at(0));
}