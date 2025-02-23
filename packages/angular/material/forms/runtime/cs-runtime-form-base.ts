import { AfterViewInit, computed, contentChildren, Directive, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Nullable } from '@codinus/types';
import { CSNamedTemplate } from '@ngx-codinus/core/outlet';
import { ICSDirtyComponent } from '@ngx-codinus/core/shared';
import { CSFormBase } from '../sections/cs-form-base';
import { ICSRuntimeFormAreaBase, ICSRuntimeFormConfig, ICSRuntimeFormFieldBase } from './cs-element-base/types';
import { CSRuntimeFormHandler } from './cs-runtime-from-handler';
import { generateFormRenderConfig } from './functions';
import { ICSRuntimeFormEvents, ICSRuntimeFormHost } from './injection-tokens';

@Directive()
export abstract class CSRuntimeFormBase<TField extends ICSRuntimeFormFieldBase> extends CSFormBase
    implements ICSDirtyComponent, OnInit, AfterViewInit, ICSRuntimeFormHost<TField> {

    abstract events: Signal<Nullable<ICSRuntimeFormEvents<TField>>>;
    abstract config: Signal<ICSRuntimeFormConfig>;
    abstract prefix: Signal<Nullable<string>>;

    protected _formHandler = new CSRuntimeFormHandler<TField>(this, () => this);

    readonly signalValue = toSignal(this.form.valueChanges);
    readonly userTemplates = contentChildren(CSNamedTemplate);
    readonly rootArea = computed<ICSRuntimeFormAreaBase>(() => generateFormRenderConfig(this.config()));
}
