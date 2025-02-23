import { NumberInput } from '@angular/cdk/coercion';
import { ScrollingModule, ViewportRuler } from '@angular/cdk/scrolling';
import { Component, forwardRef, input, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { toNumber } from '@codinus/js-extensions';
import { CSMultiColumnsFixedSizeVirtualScroll } from '@ngx-codinus/cdk/virtual-scroll';
import { CSIconBrowserBase } from './icon-browser.directive';

@Component({
    selector: 'cs-icon-browser',
    templateUrl: './icon-browser.html',
    styleUrl: './icon-browser.scss',
    encapsulation: ViewEncapsulation.None,
    //hostDirectives: [HtmlElementRuler],
    providers: [{
        provide: ViewportRuler,
        useFactory: (browser: CSIconBrowser) => browser._htmlElementRuler,
        deps: [forwardRef(() => CSIconBrowser)],
    },],
    imports: [
        ScrollingModule, MatFormFieldModule, MatIconModule, FormsModule, MatInputModule, CSMultiColumnsFixedSizeVirtualScroll
    ]
})

export class CSIconBrowser extends CSIconBrowserBase {

    iconList = input<string[]>(); // Icons to display
    iconCssClass = input<string>(); // CSS class to apply to the icon;
    itemSize = input(100, { transform: (v: NumberInput) => toNumber(v, 100) }); // Size of each icon


}