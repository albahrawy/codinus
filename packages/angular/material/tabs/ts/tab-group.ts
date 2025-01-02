import { CdkMonitorFocus } from "@angular/cdk/a11y";
import { CdkPortalOutlet } from "@angular/cdk/portal";
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, input } from "@angular/core";
import { MatRipple } from "@angular/material/core";
import { MAT_TAB_GROUP, MatTabBody, MatTabGroup } from "@angular/material/tabs";
import { Nullable } from "@codinus/types";
import { CSTabHeader } from "./tab-header";
import { CSTabLabelWrapper } from "./tab-label-wrapper";
import { CSTabHeaderPosition, CSTabOrientation } from "./types";

@Component({
    selector: 'cs-tab-group',
    exportAs: 'csTabGroup',
    templateUrl: '../html/tab-group.html',
    styleUrl: '../scss/tab-group.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
    providers: [{ provide: MAT_TAB_GROUP, useExisting: CSTabGroup },],
    host: {
        '[class.mat-mdc-tab-group-vertical]': 'orientation() === "vertical"',
    },
    imports: [
        CSTabHeader,
        CSTabLabelWrapper,
        CdkMonitorFocus,
        MatRipple,
        CdkPortalOutlet,
        MatTabBody,
    ],
})
export class CSTabGroup extends MatTabGroup {

    csHeaderPosition = input('above', { alias: 'headerPosition', transform: (v: Nullable<CSTabHeaderPosition>) => v || 'above' });
    protected orientation = computed<CSTabOrientation>(() => {
        switch (this.csHeaderPosition()) {
            case 'left':
            case 'right':
                return 'vertical';
            default:
                return 'horizontal';
        }
    });
    //@ts-expect-error change super type
    override headerPosition: CSTabHeaderPosition = 'above';

    private _positionChangedEffect = effect(() => {
        switch (this.csHeaderPosition()) {
            case 'right':
            case 'below':
                this.headerPosition = 'below';
                break;
            default:
                this.headerPosition = 'above';
        }
    });
}