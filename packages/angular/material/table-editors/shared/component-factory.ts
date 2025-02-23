import { Injectable, Type } from '@angular/core';
import { CSTableEditorCheckBox } from '../editors/editor-input-checkbox';
import { CSTableEditorDate } from '../editors/editor-input-date';
import { CSTableEditorNumber } from '../editors/editor-input-number';
import { CSTableEditorSelect } from '../editors/editor-input-select';
import { CSTableEditorSelectGrid } from '../editors/editor-input-select-grid';
import { CSTableEditorText } from '../editors/editor-input-text';
import { CSTableFilterDate } from '../filters/filter-input-date';
import { CSTableFilterNumber } from '../filters/filter-input-number';
import { CSTableFilterText } from '../filters/filter-input-text';
import { ICSTableComponentFactory, ICSTableEditorElement, ICSTableFilterElement } from '@ngx-codinus/material/table';

@Injectable({ providedIn: 'root' })
export class CSDefaultEditorComponentFactory implements ICSTableComponentFactory {
    getEditorComponent(type?: string | null): Type<ICSTableEditorElement> | null {
        switch (type) {
            case 'string':
                return CSTableEditorText;
            case 'number':
                return CSTableEditorNumber;
            case 'date':
                return CSTableEditorDate;
            case 'checkbox':
                return CSTableEditorCheckBox;
            case 'select':
                return CSTableEditorSelect;
            case 'select-grid':
                return CSTableEditorSelectGrid;
            default:
                return null;
        }
    }

    getFilterComponent(type?: string | null): Type<ICSTableFilterElement> | null {
        switch (type) {
            case 'string':
                return CSTableFilterText;
            case 'number':
                return CSTableFilterNumber;
            case 'date':
                return CSTableFilterDate;
            // case 'checkbox':
            //     return CSTableEditorCheckBox;
            // case 'select':
            //     return TableEditorSelect;
            // case 'select-grid':
            //     return TableEditorSelectGrid;
            default:
                return null;
        }
    }
}