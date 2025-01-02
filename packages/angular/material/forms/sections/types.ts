import { IGenericRecord } from "@codinus/types";
import { ICSFormFile } from "@ngx-codinus/core/shared";

export declare type CSFormAreaType = 'tab' | 'accordion' | 'card' | 'none' | null | undefined;

export interface ICSFormValue {
    data: IGenericRecord;
    files: readonly ICSFormFile[];
    removedFiles: readonly string[];
}

export interface ICSFormValueChangedArgs {
    path: string | null,
    value: unknown,
    data: IGenericRecord;
    files: readonly ICSFormFile[];
    removedFiles: readonly string[];
    config: unknown
}