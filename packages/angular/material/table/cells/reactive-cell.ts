import { Component } from "@angular/core";
import { CSTableReactiveCellBase } from "./reactive-cell-base";

@Component({
    selector: 'mat-cell[reactive],cdk-cell[reactive]',
    template: `<span class="cs-table-cell-text">{{formattedValue()}}</span>`,
})
export class CSTableReactiveCell<TRecord, TValue = unknown> extends CSTableReactiveCellBase<TRecord, TValue> {
}