import { Component, input } from "@angular/core";
import { CSIconType, CSImageIcon } from "@ngx-codinus/material/buttons";
import { CSTableReactiveCellBase } from "./reactive-cell-base";
import { MatIconModule } from "@angular/material/icon";

@Component({
    selector: 'mat-cell[reactiveIcon],cdk-cell[reactiveIcon]',
    template: `<mat-icon [csIcon]="value()" [iconType]="iconType()">home</mat-icon>`,
    imports: [CSImageIcon, MatIconModule]
})
export class CSTableIconCell<TRecord> extends CSTableReactiveCellBase<TRecord, string> {
    iconType = input<CSIconType>(null);
}