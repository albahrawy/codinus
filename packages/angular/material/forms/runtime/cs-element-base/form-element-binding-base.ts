import { computed, Directive, inject } from '@angular/core';
import { isObject } from '@codinus/js-extensions';
import { IStringRecord, ValueGetter } from '@codinus/types';
import { CODINUS_LOCALIZER, CSDefaultLocalizer } from '@ngx-codinus/cdk/localization';
import { CSRunTimeFormValidableElementBase } from './form-element-validable-base';
import { ICSRuntimeFormFieldHasDefaultValue, IHasItemGetters } from './types';

@Directive()
export abstract class CSFormElementBindingBase<TConfig extends ICSRuntimeFormFieldHasDefaultValue & IHasItemGetters>
    extends CSRunTimeFormValidableElementBase<TConfig, unknown> {

    protected localizer = inject(CODINUS_LOCALIZER, { optional: true }) ?? inject(CSDefaultLocalizer);
    protected readonly disableMember = this.signalItemGetter<boolean>('disableMember');

    private _displayMember = this.signalItemGetter<string | IStringRecord>('displayMember');
    private _iconMember = this.signalItemGetter<string | IStringRecord>('iconMember');

    protected displayMember = computed(() => this.getGetter(this._displayMember()));
    protected iconMember = computed(() => this.getGetter(this._iconMember()));

    private getGetter(member: ValueGetter<unknown, string | IStringRecord>) {
        if (typeof member === 'string' || typeof member === 'function')
            return member as ValueGetter<unknown, string>;
        if (isObject(member)) {
            this.localizer.currentLang();
            return this.localizer.translate(member);
        }
        return null;
    }
}