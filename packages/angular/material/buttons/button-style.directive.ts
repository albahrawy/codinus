import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import { CSButtonStyle } from './types/types';

const HOST_SELECTOR_MDC_CLASS_PAIR: { [key: string]: string[]; } = {
    'button': ['mdc-button', 'mat-mdc-button'],
    'flat': ['mdc-button', 'mdc-button--unelevated', 'mat-mdc-unelevated-button'],
    'raised': ['mdc-button', 'mdc-button--raised', 'mat-mdc-raised-button'],
    'stroked': ['mdc-button', 'mdc-button--outlined', 'mat-mdc-outlined-button']
};

@Directive({
    selector: 'button[mat-button], a[mat-button]'
})
export class CSMatButtonStyle {

    buttonStyle = input<CSButtonStyle>(null, { alias: 'mat-button' });

    private elementRef: ElementRef<HTMLElement> = inject(ElementRef);
    private _currentStyle = '';
    private _styleEffect = effect(() => {
        const style = this.buttonStyle() || 'button';
        const _classList = this.elementRef.nativeElement.classList;
        if (this._currentStyle) {
            const _oldList = HOST_SELECTOR_MDC_CLASS_PAIR[this._currentStyle];
            if (_oldList)
                _classList.remove(..._oldList);
        }
        if (style) {
            const _newList = HOST_SELECTOR_MDC_CLASS_PAIR[style];
            if (_newList)
                _classList.add(..._newList);
        }
        this._currentStyle = style;
    });
}