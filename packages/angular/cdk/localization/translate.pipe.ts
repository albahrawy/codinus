import { Pipe, PipeTransform, Signal, computed, inject, signal } from '@angular/core';
import { IGenericRecord, IRecord, IStringRecord, Nullable } from '@codinus/types';
import { CSDefaultLocalizer } from './localizer';
import { CODINUS_LOCALIZER } from './types';
import { isObject } from '@codinus/js-extensions';

interface TranslateInfo {
    value: Nullable<string | IStringRecord>;
    returnOriginal: boolean;
    prefix?: string;
}

type TranslateReturnType = 'string' | 'array' | 'object';

@Pipe({ name: 'csTranslate' })
export class CSTranslatePipe implements PipeTransform {

    protected localizer = inject(CODINUS_LOCALIZER, { optional: true }) ?? inject(CSDefaultLocalizer);
    private _args = signal<TranslateInfo | null>(null);
    private _translated = computed(() => {
        const args = this._args();
        if (!args || !args.value)
            return null;
        this.localizer.currentLang();
        return this.localizer.translate<string | string[] | IStringRecord>(args.value, args.returnOriginal, args.prefix) ?? null
    });

    transform(value: Nullable<string | IStringRecord>, returnType: 'string', returnOriginal?: boolean, prefix?: string): Signal<string | null>;
    transform(value: Nullable<string | IStringRecord>, returnType?: undefined, returnOriginal?: boolean, prefix?: string): Signal<string | null>;
    transform(value: Nullable<string | IStringRecord>, returnType: 'array', returnOriginal?: boolean, prefix?: string): Signal<string[] | null>;
    transform(value: Nullable<string | IStringRecord>, returnType: 'object', returnOriginal?: boolean, prefix?: string): Signal<IGenericRecord | null>;
    transform(value: Nullable<string | IStringRecord>, returnType?: TranslateReturnType, returnOriginal = true, prefix?: string): Signal<unknown | null> {
        setTimeout(() => this._args.set({ value, returnOriginal, prefix }));
        return this._translated;
    }
}


@Pipe({ name: 'csTranslateFromDictionary' })
export class CSTranslateFromDictionaryPipe implements PipeTransform {

    protected localizer = inject(CODINUS_LOCALIZER, { optional: true }) ?? inject(CSDefaultLocalizer);
    private _value = signal<unknown>(null);
    private _translated = computed(() => {
        const value = this._value();
        if (!value)
            return null;
        const lang = this.localizer.currentLang();
        if (isObject(value))
            return value[lang];
        else
            return value;
    });

    transform<T>(value: Nullable<T | IRecord<T>>): Signal<Nullable<T>> {
        setTimeout(() => this._value.set(value));
        return this._translated;
    }
}