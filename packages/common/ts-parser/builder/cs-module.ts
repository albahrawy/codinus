import { IGenericRecord } from "@codinus/types";

export interface CSCodeModule extends IGenericRecord {
    classes?: string[];
    functions?: string[];
    dependencies?: string[];
}
