import { Directive, effect, ElementRef, inject, input, OnInit, Renderer2 } from '@angular/core';
import { MAT_FORM_FIELD } from '@angular/material/form-field';
import { RUNTIME_MAT_FORM_FIELD } from '@ngx-codinus/core/shared';

@Directive({
    selector: '[cs-form-field-bar]',
    host: {
        'class': 'cs-form-field-bar',
        '[class.cs-form-field-bar-absolute]': 'absolute()',
    }
})
export class CSFormFieldToolBar implements OnInit {

    private readonly _elementRef = inject(ElementRef);
    private readonly _renderer = inject(Renderer2);
    private readonly _matFormField = inject(MAT_FORM_FIELD, { optional: true })
        ?? inject(RUNTIME_MAT_FORM_FIELD, { optional: true });


    absolute = input(false);

    constructor() {
        effect(() => {
            if (this._matFormField) {
                this._renderer.removeClass(this._matFormField._elementRef.nativeElement, 'has-cs-form-field-bar-absolute');
                this._renderer.removeClass(this._matFormField._elementRef.nativeElement, 'has-cs-form-field-bar');
                if (this.absolute())
                    this._renderer.addClass(this._matFormField._elementRef.nativeElement, 'has-cs-form-field-bar-absolute');
                else
                    this._renderer.addClass(this._matFormField._elementRef.nativeElement, 'has-cs-form-field-bar');
            }
        });
    }

    ngOnInit(): void {
        if (this._matFormField) {
            const formFieldElement: HTMLElement = this._matFormField._elementRef.nativeElement;
            const isMove = formFieldElement.contains(this._elementRef.nativeElement);
            this._renderer.insertBefore(formFieldElement, this._elementRef.nativeElement, formFieldElement?.firstElementChild, isMove);
            this._renderer.addClass(formFieldElement, `has-cs-form-field-bar${this.absolute() ? '-absolute' : ''}`);
        }
    }
}