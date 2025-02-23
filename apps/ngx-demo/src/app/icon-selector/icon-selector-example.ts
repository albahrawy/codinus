import { Component, } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CSIconBrowser, CSIconSelector } from '@ngx-codinus/material/icon-selector';

@Component({
    selector: 'icon-selector-example',
    templateUrl: './icon-selector-example.html',
    styleUrl: './icon-selector-example.scss',
    imports: [CSIconBrowser, CSIconSelector, MatFormFieldModule]
})

export class IconSelectorExample {

}