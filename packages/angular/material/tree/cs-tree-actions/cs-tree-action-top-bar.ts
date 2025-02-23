import { Component, computed, ElementRef, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDivider } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { preventEvent } from "@codinus/dom";
import { CODINUS_TREE_FEATURES } from "../cs-types";
import { CSTreeActionArea } from "./cs-tree-action-area";
import { isArray } from "@codinus/js-extensions";

@Component({
    selector: 'cs-tree-action-top-bar',
    templateUrl: './cs-tree-action-top-bar.html',
    styleUrl: './cs-tree-action-top-bar.scss',
    imports: [MatFormFieldModule, MatInput, MatIconModule, MatButtonModule, MatMenuModule, MatDivider],
    providers: [{ provide: CSTreeActionArea, useExisting: CSTreeActionTopBar }]
})
export class CSTreeActionTopBar {

    private element = inject(ElementRef);
    protected csTree = inject(CODINUS_TREE_FEATURES);

    protected _treeAllowedChildTypes = computed(() => {
        const treeAllowedTypes = this.csTree.allowedChildTypes();
        return typeof treeAllowedTypes === 'function'
            ? treeAllowedTypes(null)
            : typeof treeAllowedTypes === 'boolean'
                ? treeAllowedTypes
                : null;
    });

    protected _addChildType = computed(() => {
        const types = this._treeAllowedChildTypes();
        return typeof types === 'boolean'
            ? types === true
                ? 'default'
                : null
            : isArray(types) && types.length
                ? 'list'
                : null;
    });

    protected _allowedTypes = computed(() => {
        const types = this._treeAllowedChildTypes();
        return Array.isArray(types) ? types : null;
    });

    create() {
        return this.element;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected _getChild(arg: any): unknown {
        return { ...arg };
    }

    get disabled() { return this.csTree.disabled; }

    protected _onFilterInput(event: Event) {
        preventEvent(event);
        this.csTree.setFilter((event.target as HTMLInputElement)?.value);
    }
}