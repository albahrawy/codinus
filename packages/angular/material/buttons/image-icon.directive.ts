import { AfterContentInit, Directive, Renderer2, effect, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Nullable } from '@codinus/types';
import { CSIconType } from './types/types';

@Directive({
    selector: 'mat-icon[csIcon]:not([fontIcon]):not([svgIcon])',
    host: {
        '[class.cs-image-icon]': 'iconType()==="img"'
    }
})
export class CSImageIcon implements AfterContentInit {

    private _matIcon = inject(MatIcon, { self: true });
    private _renderer = inject(Renderer2);

    private _lastType: CSIconType = null;

    iconType = input<CSIconType>(null);
    csIcon = input<Nullable<string>>(null);


    constructor() {

        effect(() => {
            const iconType = this.iconType() ?? 'font';
            const iconValue = this.csIcon();
            this._cleanCurrent(this._lastType);
            this._lastType = iconType;
            if (!iconValue)
                return;
            switch (iconType) {
                case 'img':
                    this._createImgIcon(iconValue);
                    break;
                case 'font':
                    this._matIcon.fontIcon = iconValue;
                    break;
                case 'svg':
                    this._matIcon.svgIcon = iconValue;
                    break;
            }
        });
    }

    ngAfterContentInit(): void {
        this._cleanChildren();
    }

    private _createImgIcon(imgIcon: string) {
        const img: HTMLImageElement = this._renderer.createElement('img');
        img.src = imgIcon;
        this._cleanChildren();
        this._matIcon._elementRef.nativeElement.appendChild(img);
    }


    private _cleanChildren() {
        const layoutElement = this._matIcon._elementRef.nativeElement;
        let childCount = layoutElement.childNodes.length;
        while (childCount--) {
            const child = layoutElement.childNodes[childCount];
            if (child.nodeType !== 1 || child.nodeName.toLowerCase() === 'svg') {
                child.remove();
            }
        }
    }

    private _cleanCurrent(iconType: CSIconType) {
        switch (iconType) {
            case 'img':
                this._matIcon._elementRef.nativeElement.querySelector('img')?.remove();
                break;
            case 'font':
                this._matIcon.fontIcon = '';
                break;
            case 'svg':
                this._matIcon.svgIcon = '';
                break;
        }
    }

}