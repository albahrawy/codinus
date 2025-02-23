import { Directive, ElementRef, booleanAttribute, computed, inject, input, output, signal } from '@angular/core';
import { jsonToArray } from '@codinus/js-extensions';
import { ICSButtonBase, ICSButtonBaseArgs, ICSButtonConfigBase, ICSButtonUIBase } from '../types/internal-types';

@Directive()
export abstract class CSButtonContainerBase<TButton extends ICSButtonBase,
    TUI extends ICSButtonUIBase<TButton>,
    TArgs extends ICSButtonBaseArgs<TButton>,
    TConfig extends ICSButtonConfigBase<TButton>> {

    private _userDisabled = signal(false);
    private _actions = {
        get: (key: string) => this.getButton(key),
        disableContainer: () => this._userDisabled.set(true),
        enableContainer: () => this._userDisabled.set(false)
    };

    elementRef = inject(ElementRef);

    buttonClicked = output<TArgs>();

    disabled = input(false, { transform: booleanAttribute });

    buttons = input<TConfig>();

    protected _disabled = computed(() => this.disabled() || this._userDisabled())

    protected _buttonArray = computed(() => {
        const value = this.buttons();
        if (value == null)
            return [];
        const uiArray = jsonToArray(value, (v, k, i) => this.createUIArgs(v, k, i));
        return this.sort(uiArray);
    });

    protected sort(uiArray: TUI[]): TUI[] {
        return uiArray;
    }

    protected abstract createUIArgs(value: TButton, key: string, index: number): TUI;

    protected btnClicked(button: TUI) {
        this.buttonClicked.emit(this.generateEventArg(button));
    }

    protected generateEventArg(button: TUI): TArgs {
        //@ts-expect-error type guard
        return {
            button: button.args as TArgs['button'],
            key: button.key,
            container: this._actions,
        };
    }

    getButton(key: string) {
        return this._buttonArray().find(b => b.key === key)?.args;
    }

    setButtonDisabledState(key: string, value: boolean) {
        const button = this.getButton(key);
        if (button)
            setTimeout(() => button.disabled = value);
    }
}