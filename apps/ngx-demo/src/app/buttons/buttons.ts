import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
    CSButtonStyle, CSButtonContainer, CSMatButtonStyle, CSSpeedButton,
    ICSButtonArgs, ICSButtonConfig,
    ICSSpeedButtonConfig,
    CSSpeedButtonAnimation,
    CSSpeedButtonDirection,
    CSSpeedButtonMode,
    CSIconType,
    CSImageIcon
} from '@ngx-codinus/material/buttons';
import { MatSelectChange, MatSelectModule } from '@angular/material/select'


const _Directions: CSSpeedButtonDirection[] = ['up', 'down', 'left', 'right'];
const THUMBUP_ICON =
    `
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.` +
    `44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5` +
    `1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>
  </svg>
`;
@Component({
    selector: 'app-buttons-example',
    templateUrl: 'buttons.html',
    styleUrl: './buttons.scss',
    imports: [MatButtonModule, MatIconModule, CSImageIcon, CSMatButtonStyle, CSButtonContainer, MatSelectModule, CSSpeedButton]
})

export class ButtonsExampleComponent {
    _buttonStyle: CSButtonStyle;
    onBtnSelectChange(args: MatSelectChange) {
        const style = args.value as CSButtonStyle;
        this._buttonStyle = style;
    }

    private _iconRegistry = inject(MatIconRegistry);
    private _sanitizer = inject(DomSanitizer);

    constructor() {
        this._iconRegistry.addSvgIconLiteral('thumbs-up', this._sanitizer.bypassSecurityTrustHtml(THUMBUP_ICON));

    }

    _svgIcon = 'thumbs-up';
    _fontIcon = 'check';
    _imgIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAB+FBMVEUAAAA/mUPidDHiLi5Cn0XkNTPmeUrkdUg/m0Q0pEfcpSbwaVdKskg+lUP4zA/iLi3msSHkOjVAmETdJSjtYFE/lkPnRj3sWUs8kkLeqCVIq0fxvhXqUkbVmSjwa1n1yBLepyX1xxP0xRXqUkboST9KukpHpUbuvRrzrhF/ljbwaljuZFM4jELaoSdLtElJrUj1xxP6zwzfqSU4i0HYnydMtUlIqUfywxb60AxZqEXaoifgMCXptR9MtklHpEY2iUHWnSjvvRr70QujkC+pUC/90glMuEnlOjVMt0j70QriLS1LtEnnRj3qUUXfIidOjsxAhcZFo0bjNDH0xxNLr0dIrUdmntVTkMoyfL8jcLBRuErhJyrgKyb4zA/5zg3tYFBBmUTmQTnhMinruBzvvhnxwxZ/st+Ktt5zp9hqota2vtK6y9FemNBblc9HiMiTtMbFtsM6gcPV2r6dwroseLrMrbQrdLGdyKoobKbo3Zh+ynrgVllZulTsXE3rV0pIqUf42UVUo0JyjEHoS0HmsiHRGR/lmRz/1hjqnxjvpRWfwtOhusaz0LRGf7FEfbDVmqHXlJeW0pbXq5bec3fX0nTnzmuJuWvhoFFhm0FtrziBsjaAaDCYWC+uSi6jQS3FsSfLJiTirCOkuCG1KiG+wSC+GBvgyhTszQ64Z77KAAAARXRSTlMAIQRDLyUgCwsE6ebm5ubg2dLR0byXl4FDQzU1NDEuLSUgC+vr6urq6ubb29vb2tra2tG8vLu7u7uXl5eXgYGBgYGBLiUALabIAAABsElEQVQoz12S9VPjQBxHt8VaOA6HE+AOzv1wd7pJk5I2adpCC7RUcHd3d3fXf5PvLkxheD++z+yb7GSRlwD/+Hj/APQCZWxM5M+goF+RMbHK594v+tPoiN1uHxkt+xzt9+R9wnRTZZQpXQ0T5uP1IQxToyOAZiQu5HEpjeA4SWIoksRxNiGC1tRZJ4LNxgHgnU5nJZBDvuDdl8lzQRBsQ+s9PZt7s7Pz8wsL39/DkIfZ4xlB2Gqsq62ta9oxVlVrNZpihFRpGO9fzQw1ms0NDWZz07iGkJmIFH8xxkc3a/WWlubmFkv9AB2SEpDvKxbjidN2faseaNV3zoHXvv7wMODJdkOHAegweAfFPx4G67KluxzottCU9n8CUqXzcIQdXOytAHqXxomvykhEKN9EFutG22p//0rbNvHVxiJywa8yS2KDfV1dfbu31H8jF1RHiTKtWYeHxUvq3bn0pyjCRaiRU6aDO+gb3aEfEeVNsDgm8zzLy9egPa7Qt8TSJdwhjplk06HH43ZNJ3s91KKCHQ5x4sw1fRGYDZ0n1L4FKb9/BP5JLYxToheoFCVxz57PPS8UhhEpLBVeAAAAAElFTkSuQmCC';

    iconValue = this._fontIcon;
    iconType: CSIconType = 'font';
    _availableIcons = [this._svgIcon, this._fontIcon, this._imgIcon];
    _avilableTypes: CSIconType[] = ['svg', 'font', 'img']

    buttons: ICSButtonConfig = {
        button1: { text: 'button1', cssClass: 'primary', progress: { type: 'bar', cssClass: 'accent' } },
        button2: { text: 'button2' },
        button3: { text: 'button3', icon: 'check' },
        button4: { icon: 'check', isFab: true },
    }

    containerButtonClicked(event: ICSButtonArgs) {
        event.button.setBusy(true);
        event.button.progress.type = 'bar';
        const button = event.container.get('button2');
        if (button)
            button.hidden = true;

        setTimeout(() => {
            event.button.setBusy(false);
        }, 1000);
    }

    speedButtons: ICSSpeedButtonConfig = {
        button1: { icon: 'check' },
        button2: { icon: 'home' },
        button3: { icon: 'clear' },
        button4: { icon: 'cancel' },
        button5: { icon: 'home' },
    }

    spin = false;
    direction: CSSpeedButtonDirection = 'up';
    animationMode: CSSpeedButtonAnimation = 'fling';
    isMini = false;
    buttonMode: CSSpeedButtonMode = 'click';



    doAction(key: string) {
        console.log(key);
    }

    toggleAnimation() {
        this.animationMode = this.animationMode === 'scale' ? 'fling' : 'scale';
    }
    toggleDirection() {
        let _newtIndex = _Directions.indexOf(this.direction) + 1;
        if (_newtIndex >= _Directions.length)
            _newtIndex = 0;
        this.direction = _Directions[_newtIndex];
    }



    toggleIcons() {
        let nextIndex = this._avilableTypes.indexOf(this.iconType) + 1;
        if (nextIndex > this._availableIcons.length - 1)
            nextIndex = 0;
        this.iconType = this._avilableTypes[nextIndex];
        this.iconValue = this._availableIcons[nextIndex];

    }

}