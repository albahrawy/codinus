import { IGenericRecord } from "@codinus/types";

export interface ICSTranspliedModule extends IGenericRecord {
    dependencies?: string[];
    classes: string[];
    functions: string[];
}