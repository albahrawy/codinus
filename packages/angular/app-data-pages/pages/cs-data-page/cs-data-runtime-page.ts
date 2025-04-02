import { Component } from '@angular/core';
import { CSplitterModule } from '@ngx-codinus/material/splitter';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
    selector: 'cs-data-runtime-page',
    templateUrl: 'cs-data-runtime-page.html',
    styleUrls: ['cs-data-runtime-page.scss'],
    imports: [MatToolbarModule, MatButtonModule, MatIconModule, CSplitterModule,]
})

export class CSDataRuntimePage {
}