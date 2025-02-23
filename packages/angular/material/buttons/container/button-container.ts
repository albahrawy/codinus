import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ICSAddonProgress } from '@codinus/types';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import { CSOverlayProgress } from '@ngx-codinus/cdk/overlays';
import { FlexDirection, FlexPosition } from '@ngx-codinus/core/layout';
import { CSButtonContainerBase } from '../base/button-container-base';
import { CSMatButtonStyle } from '../button-style.directive';
import { ICSButtonArg, ICSButtonArgs, ICSButtonConfig, ICSButtonItem } from '../types/types';

interface CSButtonItem {
    args: ICSButtonArg;
    key: string;
}
@Component({
    selector: 'cs-button-container',
    templateUrl: './button-container.html',
    host: {
        'class': 'cs-button-container',
        '[style.justify-content]': 'position()',
        '[style.flex-direction]': 'direction()',
    },
    styles: `
        :host{
            display:flex;
            gap:5px;
            align-items: center;
        }
    `,
    imports: [CSOverlayProgress, MatIconModule, MatButtonModule, CSTranslatePipe, CSMatButtonStyle, MatTooltipModule]
})

export class CSButtonContainer extends CSButtonContainerBase<ICSButtonItem, CSButtonItem, ICSButtonArgs, ICSButtonConfig> {

    direction = input<FlexDirection>('row');
    position = input<FlexPosition>('end');

    protected override createUIArgs(value: ICSButtonItem, key: string): CSButtonItem {
        const progress = (value.progress ?? {}) as unknown as ICSAddonProgress;
        progress.mode ??= 'indeterminate';
        const args: ICSButtonArg = {
            ...value, progress, setBusy: (state) => {
                args.progress.visible = state;
                args.disabled = state;
            }
        };
        args.cssClass ||= `cs-button--${key}`;
        args.cssClass += ' cs-button-container--button'
        return { args, key };
    }
}