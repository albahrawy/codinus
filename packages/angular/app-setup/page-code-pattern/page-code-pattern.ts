import { Component, computed, signal } from '@angular/core';
import { ICSAddonProgress, IStringRecord, Nullable } from '@codinus/types';
import { ICSDialogComponent, ICSDialogHost } from '@ngx-codinus/cdk/overlays';
import { ICSRuntimeFormAreaBase, ICSRuntimeFormFieldNamelessConfig } from '@ngx-codinus/material/forms';
import { CSplitterModule } from '@ngx-codinus/material/splitter';
import { CodinusTreeModule } from '@ngx-codinus/material/tree';
import { map, Observable } from 'rxjs';
import { normalizeSections } from '../helper/functions';
import { CSAppPagesSectionsHandler } from '../helper/cs-page-sections-handler';
import { CSSelectionListPanel, CSVirtualSelectionListChange } from '@ngx-codinus/material/selection-list';
import { ICSEditorCodePatternInfo, ICSFormComponentSetupEvent } from '../helper/types';
import { arrayFromMap, removeFromArray } from '@codinus/js-extensions';

interface EditorCodePatternData {
    sections: ICSRuntimeFormAreaBase;
    handler: CSAppPagesSectionsHandler;
}

@Component({
    selector: 'cs-page-setup-code-pattern',
    templateUrl: './page-code-pattern.html',
    styleUrl: './page-code-pattern.scss',
    imports: [CodinusTreeModule, CSplitterModule, CSSelectionListPanel]
})

export class CSPageSetupCodePattern implements ICSDialogComponent<ICSEditorCodePatternInfo, EditorCodePatternData> {

    protected _handler!: CSAppPagesSectionsHandler;
    protected _sections: ICSRuntimeFormFieldNamelessConfig[] = [];
    private _selectionMap = new Map<string, ICSFormComponentSetupEvent[]>;
    private _currentItem = signal<Nullable<ICSRuntimeFormFieldNamelessConfig>>(null);

    initiate(data: EditorCodePatternData): void {

        this._handler = data.handler;
        this._sections = normalizeSections(data.sections, false);
    }

    getResult(): ICSEditorCodePatternInfo {
        const codePattern: ICSEditorCodePatternInfo = {};
        this._selectionMap.forEach((value, key) => {
            value.forEach(v => {
                codePattern[`${key}_${v.name}`] = {
                    codePattern: `protected ${key}_${v.name} ${v.codePattern} {\r\n\r\n}`,
                    imports: v.imports
                };
            });
        });
        return codePattern;
    }

    protected _onCurrentChanged(current: Nullable<ICSRuntimeFormFieldNamelessConfig>) {
        this._currentItem.set(current);
    }

    protected elementEvents = computed(() => {
        const currentItem = this._currentItem();
        if (!currentItem)
            return null;

        return this._handler._formComponentFactory.getComponentSpecialEvents(currentItem);
    });

    protected selectedEvents = computed(() => {
        const elementName = this._currentItem()?.name;
        if (elementName)
            return this._selectionMap.get(elementName)?.map(i => i.name) ?? [];
        return [];
    });

    protected _onEventSelected(args: CSVirtualSelectionListChange<ICSFormComponentSetupEvent>) {
        const elementName = this._currentItem()?.name;
        if (!elementName)
            return;
        if (args.reason !== 'option')
            return;

        let mapValue = this._selectionMap.get(elementName);
        if (!mapValue)
            this._selectionMap.set(elementName, mapValue = []);

        if (args.type === 'select')
            mapValue.push(args.optionData);
        else
            removeFromArray(mapValue, args.optionData);
    }

}