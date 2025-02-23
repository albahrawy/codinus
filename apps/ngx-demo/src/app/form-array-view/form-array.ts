import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CodinusFormsModule, CSFormGroup } from '@ngx-codinus/core/forms';
import { CODINUS_CDK_FLEX_DIRECTIVES } from '@ngx-codinus/core/layout';
import { ICSDirtyComponent } from '@ngx-codinus/core/shared';
import { ConextMenuOpenArgs, CSContextMenuDirective, IContextMenuClickArgs, IContextMenuItem } from '@ngx-codinus/material/context-menu';
import { CODINUS_FORM_SECTIONS, CSForm, CSFormSection } from '@ngx-codinus/material/forms';
import { createSampleData, PeriodicElement } from '../helper/data-provider';
import { Nullable } from '@codinus/types';

@Component({
    selector: 'form-array-view',
    templateUrl: './form-array.html',
    styleUrl: './form-array.scss',
    imports: [CodinusFormsModule,
        MatInputModule, CommonModule, MatFormFieldModule, MatIconModule,
        CODINUS_CDK_FLEX_DIRECTIVES, CSFormSection, CODINUS_FORM_SECTIONS, CSForm,
        CSContextMenuDirective
    ],
    host: {
        'class': 'form-array-view'
    }
})

export class FormArrayViewExampleComponent implements ICSDirtyComponent {
    // ngOnInit(): void {
    // fromEvent(window, 'beforeunload').subscribe(event => {
    //     event.preventDefault();
    //     return true;
    // });
    // }
    canDeactivate = () => true;
    _group: CSFormGroup | null = null;
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

    conditionalWhen(id: Nullable<string>, element: PeriodicElement) {
        return ["Hydrogen", 'Helium', 'Boron'].includes(element.name_en);
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