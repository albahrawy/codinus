import { Component, TemplateRef, viewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { CSTreeNodeHoverBar } from "./cs-tree-action-area";
import { MatDivider } from "@angular/material/divider";
import { IGenericRecord } from "@codinus/types";

@Component({
    selector: 'cs-node-action-bar',
    templateUrl: './node-action-bar.html',
    styleUrl: './node-action-bar.scss',
    providers: [{ provide: CSTreeNodeHoverBar, useExisting: CSTreeNodeHoverBarComponent }],
    imports: [MatButtonModule, MatIconModule, MatMenuModule, MatDivider]
})
export class CSTreeNodeHoverBarComponent {
    private _template = viewChild.required(TemplateRef);
    get template() { return this._template(); }

    _getChild(arg: IGenericRecord): unknown {
        return { ...arg };
    }
}
