import { CDK_ROW_TEMPLATE, CdkCellOutlet, CdkHeaderCell, CdkHeaderRow } from "@angular/cdk/table";
import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation } from "@angular/core";
import { MatHeaderCell, MatHeaderRow } from "@angular/material/table";

@Directive({
    selector: 'cdk-filter-cell, th[cdk-filter-cell]',
    host: { 'class': 'cdk-filter-cell' },
})
export class CSCdkFilterCell extends CdkHeaderCell { }

@Directive({
    selector: 'mat-filter-cell, th[mat-filter-cell]',
    host: { 'class': 'cdk-filter-cell mat-filter-cell,' },
})
export class CSMatFilterCell extends MatHeaderCell { }

@Component({
    selector: 'mat-filter-row, tr[mat-filter-row]',
    template: CDK_ROW_TEMPLATE,
    host: { 'class': 'cdk-filter-row mat-filter-row' },
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: CdkHeaderRow, useExisting: CSMatFilterRow }],
    imports: [CdkCellOutlet]
})
export class CSMatFilterRow extends MatHeaderRow { }


@Component({
    selector: 'cdk-filter-row, tr[cdk-filter-row]',
    host: { 'class': 'cdk-filter-row' },
    template: CDK_ROW_TEMPLATE,
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    imports: [CdkCellOutlet],
    providers: [{ provide: CdkHeaderRow, useExisting: CSCdkFilterRow }],
})
export class CSCdkFilterRow { }
