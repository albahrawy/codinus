import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CSTabGroup, CSTabHeaderPosition } from '@ngx-codinus/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

/**
 * @title Tab group with paginated tabs
 */
@Component({
    selector: 'tab-group-paginated-example',
    templateUrl: 'tab-example.html',
    styleUrl: './tab-example.scss',
    imports: [MatTabsModule, CSTabGroup, MatRadioModule, FormsModule],
})
export class TabGroupExampleComponent {
    lotsOfTabs = new Array(30).fill(0).map((_, index) => `Tab ${index}`);
    position: CSTabHeaderPosition = 'above';
}