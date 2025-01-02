import { InjectionToken } from "@angular/core";
import { IStringRecord } from "@codinus/types";

export const CODINUS_UPLOAD_MANAGER = new InjectionToken<ICSUploadManager>('cs_upload_manager');

export interface ICSUploadManager {
    addFiles(files: { uniqueKey: string, content?: Blob }[]): void;
    removeFiles(uniqueKeys: string[]): void;
}

export interface ICSFilePathParts {
    name: string;
    extension?: string;
}

export interface ICSFormFile {
    content?: Blob;
    uniqueKey: string;
}

export interface ICSFileInfo extends ICSFilePathParts, ICSFormFile {
    size?: number;
    caption?: IStringRecord;
    category?: number;
    deleted?: boolean;
}

