import { AfterViewInit, booleanAttribute, computed, Directive, effect, input, model, OnInit, output } from '@angular/core';
import { outputFromObservable, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup, ValueChangeEvent } from '@angular/forms';
import { MaybeAsync } from '@angular/router';
import { isObject } from '@codinus/js-extensions';
import { IGenericRecord, Nullable } from '@codinus/types';
import { CSFormGroupDirectiveBase, CSSectionFormControl } from '@ngx-codinus/core/forms';
import { ICSDirtyComponent, ICSFormFile, ICSUploadManager } from '@ngx-codinus/core/shared';
import { filter, fromEvent, map, startWith } from 'rxjs';
import { ICSFormValue, ICSFormValueChangedArgs } from './types';

@Directive()
export abstract class CSFormBase extends CSFormGroupDirectiveBase implements ICSDirtyComponent, ICSUploadManager, OnInit, AfterViewInit {

    private _files: ICSFormFile[] = [];
    private _removedFiles: string[] = [];

    initialized = output<typeof this>();
    valueInitialized = output<IGenericRecord>();

    unSavedConfirmFn = input<() => MaybeAsync<boolean>>();
    readOnly = model(false);
    monitorUnload = input(true, { transform: booleanAttribute });
    readonly hasErrors = toSignal(this.formGroup.statusChanges.pipe(startWith(false), map(() => !this.valid)));
    readonly hasErrors2 = computed(() => this.formGroup._status() !== 'VALID')

    private readonly changeStream = this.formGroup.events.pipe(
        takeUntilDestroyed(),
        filter((e): e is ValueChangeEvent<unknown> =>
            this.formGroup.dirty && (e instanceof ValueChangeEvent)
            && !(e.source instanceof FormGroup) && e.source.parent != null),
        map(e => {
            return {
                path: _getControlKey(e.source),
                value: e.source.value,
                data: e.value as IGenericRecord,
                files: Object.freeze([...this._files]),
                removedFiles: Object.freeze([...this._removedFiles]),
                config: e.source._boundConfig?.()
            };
        })
    );

    valueChanged = outputFromObservable<ICSFormValueChangedArgs>(this.changeStream);

    private _effects = [effect(() => {
        const isReadOnly = this.readOnly()
        if (this.formGroup.disabled != isReadOnly) {
            if (isReadOnly) {
                this.formGroup.disable();
            } else {
                this.formGroup.enable();
            }
        }
    }),

    fromEvent(window, 'beforeunload').pipe(takeUntilDestroyed()).subscribe(event => {
        const changed = this.monitorUnload() && !this.readOnly() && this.dirty;
        if (changed) {
            event.preventDefault();
            return false;
        }
        return true;
    })
    ];

    ngOnInit(): void {
        this.initialized.emit(this);
    }

    override ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.valueInitialized.emit(this.formGroup.value);
    }

    canDeactivate = () => {
        if (!this.dirty || this.readOnly())
            return true;
        const confirmFn = this.unSavedConfirmFn();

        if (typeof confirmFn === 'function')
            return confirmFn();

        return false;
    }

    addFiles(files: { uniqueKey: string; content?: Blob; }[]): void {
        this._files.push(...files);
    }

    removeFiles(uniqueKeys: string[]): void {
        uniqueKeys.forEach(key => {
            const index = this._files.findIndex(f => f.uniqueKey === key);
            if (index >= 0)
                this._files.splice(index, 1);
            else
                this._removedFiles.push(key);
        });
    }

    setCurrent(data: IGenericRecord) {
        this.setCurrentCore(data);
    }

    getValue(): ICSFormValue {
        return {
            data: this.formGroup.value,
            files: Object.freeze([...this._files]),
            removedFiles: Object.freeze([...this._removedFiles]),
        };
    }

    private setCurrentCore(data?: IGenericRecord) {
        this.formGroup.reset(data, { emitEvent: false });
        this._files = [];
        this._removedFiles = [];
    }
}

function _getControlKey(source: Nullable<AbstractControl>): string | null {
    const path = [];
    let controls = source?.parent?.controls;
    while (isObject(controls)) {
        const [key, control] = Object.entries(controls).find(e => e[1] === source) ?? [];
        if (key)
            path.push(key);
        source = control?.parent;
        controls = source?.parent?.controls;
        if (source?.parent instanceof CSSectionFormControl) {
            source = source?.parent;
            controls = source?.parent?.controls;
        }
    }
    return path.length ? path.reverse().join('.') : null;
}
