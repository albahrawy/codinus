import { InjectionToken } from "@angular/core";
import { IGenericRecord, IStringRecord } from "@codinus/types";
import { Observable } from "rxjs";

export const TRANSLATE_SERVICE = new InjectionToken<ITranslateService>('translate_service');
export const CURRENT_LANGUAGE_STORAGE = new InjectionToken<ICurrentLanguageStorage>('current_language_storage');
export const CODINUS_LOCALIZER = new InjectionToken<ICSLocalizer>('codinus_localizer');
export const CODINUS_LOCALIZER_CONFIG = new InjectionToken<ILocalizeConfig>('codinus_localizer_config');
export const CODINUS_LOCALIZER_CONFIG_PATH = new InjectionToken<string>('codinus_localizer_config_path');

export interface ICurrentLanguageStorage {
    /**
     * Get the last language that the user chose.
     * @returns The language code.
     */
    getLanguage(): ILanguage;

    /**
     * Set the last language that the user chose.
     * @param language The language code.
     */
    setLanguage(language: ILanguage): void;
}

export interface ILanguage {
    symbol: string;
    name?: string;
    isRTL: boolean;
}

export interface ILangChangeEvent {
    language: ILanguage
    translations: IGenericRecord;
}

export interface ITranslateService {
    getLanguageStore(lang: string): Observable<IGenericRecord>;
}

export interface ICSLocalizer {
    //readonly current: ILanguage;
    readonly onChange: Observable<ILangChangeEvent>;
    translate<T extends string | string[] | IStringRecord = string>
        (value: string | IStringRecord, returnOriginal?: boolean, prefix?: string): T | null;
    translate<T extends string | string[] | IStringRecord = string>
        (value: string | IStringRecord, returnOriginal: true, prefix?: string): T;
    changeLang(lang: ILanguage): void;
    init(mandatory?: boolean): Observable<ILangChangeEvent>;
    currentLang(): string;
}

export declare interface ILocalizeConfig {
    appTitle?: string | IStringRecord;
    languages?: ILanguage[];
    defaultLang?: string;
    localizeSource?: {
        type?: 'local' | 'api',
        path?: string | string[]
    };
    init(mandatory?: boolean): Observable<ILocalizeConfig>;
    getDefaultLang(): ILanguage | undefined;
}

export const DEFAULT_LANGUAGE_EN: ILanguage = { symbol: 'en', isRTL: false, name: 'English' };
