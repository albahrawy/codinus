import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { IGenericRecord } from '@codinus/types';
import { CodinusFormsModule, CSFormGroup } from '@ngx-codinus/core/forms';
import { CODINUS_CDK_FLEX_DIRECTIVES } from '@ngx-codinus/core/layout';
import { ICSDirtyComponent } from '@ngx-codinus/core/shared';
import { ConextMenuOpenArgs, CSContextMenuDirective, IContextMenuClickArgs, IContextMenuItem } from '@ngx-codinus/material/context-menu';
import { CODINUS_FORM_SECTIONS, CSForm, CSFormSection } from '@ngx-codinus/material/forms';
import { ChildrenAllowedListFn } from '@ngx-codinus/material/tree';
import { createSampleData, PeriodicElement } from '../helper/data-provider';

@Component({
    selector: 'form-array-tree-view',
    templateUrl: './form-array-tree-view.html',
    styleUrl: './form-array-tree-view.scss',
    imports: [CodinusFormsModule,
        MatInputModule, CommonModule, MatFormFieldModule, MatIconModule,
        CODINUS_CDK_FLEX_DIRECTIVES, CSFormSection, CODINUS_FORM_SECTIONS, CSForm,
        CSContextMenuDirective
    ],
    host: {
        'class': 'form-array-tree-view'
    }
})

export class FormArrayTreeViewExampleComponent implements ICSDirtyComponent {
    // ngOnInit(): void {
    // fromEvent(window, 'beforeunload').subscribe(event => {
    //     event.preventDefault();
    //     return true;
    // });
    // }
    canDeactivate = () => true;
    _group: CSFormGroup | null = null;
    childAccessor = (r: IGenericRecord) => {
        if (r["name_en"] == "Hydrogen")
            return r['children'] ?? (r['children'] = []);
        return r['children'];
    }

    canAddChildren = (r: IGenericRecord) => {
        return r["name_en"] === "Hydrogen";
    }

    allowedChildTypes: ChildrenAllowedListFn<IGenericRecord> | undefined = (parent) => {
        if (parent && parent["name_en"] == "Hydrogen")
            return [{
                text: 'text',
                child: { name_en: 'ahmed' },
                icon: 'home'
            },
            {
                text: 'text',
                child: { name_en: 'ahmed' },
                icon: 'home'
            }, 'separator', {
                text: 'text',
                child: { name_en: 'ahmed' },
                icon: 'home'
            }];
        return null;
    };


    onGroupCreated(form: CSForm) {
        form.formGroup.setValue({ arrayControl: createSampleData(45) }, { emitEvent: false });
        this._group = form.formGroup;
    }

    onContextMenuClick(event: IContextMenuClickArgs) {
        console.log('click', event);
    }
    onContextMenuOpen(args: ConextMenuOpenArgs) {
        // if ((args.data as KeyValue).value === 3)
        args.menuItems[1].disabled = (args.data as PeriodicElement).position === 3;
        args.menuItems[0].hidden = (args.data as PeriodicElement).position === 5;
    }

    _contextMenuItems: IContextMenuItem[] = [
        {
            key: 'a',
            caption: 'Menu-1',
            icon: 'home',
        },
        {
            key: 'b',
            caption: 'Menu-2',
            icon: 'home',
        }
    ];
}