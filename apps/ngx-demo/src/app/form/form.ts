import { CommonModule, JsonPipe } from '@angular/common';
import { AfterViewInit, Component, ComponentRef, computed, Directive, forwardRef, inject, INJECTOR, Injector, OnInit, Provider, signal, viewChild } from '@angular/core';
import { AbstractControl, ControlContainer, FormControl, FormControlName, FormGroup, NgControl, ValidationErrors, Validators } from '@angular/forms';
import { MatFormField, MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
// import { TableConfig } from '@ngx-nova/table/nova-table';
// import { ICdkTableApi } from '@ngx-nova/table/api';
// import { PeriodicElement, createSampleData } from '../helper/data-provider';
import { MatIconModule } from '@angular/material/icon';
import { CdkPortalOutletAttachedRef, ComponentPortal } from '@angular/cdk/portal';
import { CodinusFormsModule, CSFormControlName, CSFormGroup, CSFormGroupDirectiveBase } from '@ngx-codinus/core/forms';
import { CODINUS_MATERIAL_INPUTS } from '@ngx-codinus/material/inputs';
import { CODINUS_CDK_FLEX_DIRECTIVES } from '@ngx-codinus/core/layout';
import { CODINUS_FORM_SECTIONS, CSForm, CSFormSection, ICSFormValueChangedArgs } from '@ngx-codinus/material/forms';
import { IGenericRecord } from '@codinus/types';
import { createSampleData } from '../helper/data-provider';
// import { NovaFormSection, NovaLocalizableInput } from '@ngx-nova/forms/sections';

@Component({
    selector: 'test-Component',
    template: '<div csAutoForm (initialized)="x=$event"><input matInput csFormControlName="control"></div> {{x?.value|json}}',
    imports: [MatInputModule, CodinusFormsModule, JsonPipe]
}) export class XTestComponent implements AfterViewInit {
    ngAfterViewInit(): void {
        console.log(this.autoFormControl());
    }
    control = viewChild.required(MatFormFieldControl);
    autoFormControl = viewChild(CSFormControlName);
    x?: CSFormGroup;
}

const controlNameBinding: Provider = {
    provide: NgControl,
    useExisting: forwardRef(() => FormControlName),
};

@Directive({
    selector: '[xxformControlName]',
    providers: [controlNameBinding],
})
export class FormNameTest extends FormControlName implements OnInit {
    private xx = inject(ControlContainer, { host: true, optional: true, skipSelf: false });
    private injector = inject(INJECTOR);

    ngOnInit(): void {
        console.log('parent-formgroup', this.xx);
    }
}

@Component({
    selector: 'cs-form-example',
    templateUrl: 'form.html',
    styleUrl: './form.scss',
    imports: [
        CodinusFormsModule, CODINUS_MATERIAL_INPUTS,
        CODINUS_FORM_SECTIONS,
        MatInputModule, CommonModule, MatFormFieldModule, MatIconModule,
        CODINUS_CDK_FLEX_DIRECTIVES, CSFormSection,
        //NovaTableFormControl, , NovaFormContainer,
        CSForm
    ]
})

export class CSTestFormComponent {

    parts = new FormGroup({ XX: new FormControl() });

    valueInitialized($event: IGenericRecord) {
        console.log('valueInitialized', $event)
    }

    printValues($event: ICSFormValueChangedArgs) {
        console.log($event);
    }

    onComponentAttached(event: CdkPortalOutletAttachedRef, field: MatFormField) {
        if (event instanceof ComponentRef) {
            field._control = event.instance.control();
        }

    }
    form!: CSForm;
    contentPortal = new ComponentPortal(XTestComponent);
    origFormControl = new FormControl('a', Validators.required);
    onDrop(e: DragEvent) {
        console.log(e);
    }

    private parentInjector = inject(INJECTOR);


    protected createInjector() {
        console.log('injector');
        const providers = [
            { provide: ControlContainer, useValue: this.form },
            { provide: CSFormGroupDirectiveBase, useValue: this.form }
        ];
        const parentInjector = Injector.create({ providers, parent: this.parentInjector });
        return Injector.create({ providers: [], parent: parentInjector });
    }

    MyautoForm = viewChild('MyautoForm', { read: CSFormControlName });
    statusTest = computed(() => {
        return this.MyautoForm()?.signalValid();
    });

    //myInjector = Injector.create()

    // protected _tableApi?: ICdkTableApi<PeriodicElement>;
    _testOriginalFg = new FormGroup({ 'testSelect': new FormControl('') });
    containerText = { en: 'ahmed', ar: 'عباس حسن محمد' };
    controlName: string | null = 'name';
    controlNameX: string | null = 'name2';
    _defaultValue = "T1";
    _required = true;
    flatKey = 'name';
    panelGap = '5px';
    sectionName1: string | null = 'MS';
    sectionName2: string | null = 'SS';
    formGroup!: CSFormGroup;
    // config: TableConfig<PeriodicElement> = {
    //     editable: true,
    //     commitOnDestroy: true,
    //     editWithF2: true,
    //     editWithEnter: true,
    //     rowHeight: 30,
    //     attachFilter: true,
    //     reorderColumns: true,
    //     sortable: true,
    //     showHeader: true,
    //     showFilter: true,
    //     showFooter: true,
    //     stickyHeader: true,
    //     stickyFilter: true,
    //     stickyFooter: true,
    //     noDataText: 'There is no Data',
    //     responsive: { enabled: true, md: 2, sm: 1, xs: 1 },
    //     selectable: 'single',
    //     selectColumn: 'none',
    //     iconMember: 'icon',
    //     columns: [
    //         {
    //             name: 'position', footerAggregation: 'sum', label: 'No.',
    //             resizable: true, draggable: true, sortable: true, filter: { type: 'number' }, editor: { type: 'number' }
    //         },
    //         {
    //             name: 'date', cellFormatter: 'dd/MM/yyyy', footerDefaultValue: 'Footer', label: 'Date',
    //             resizable: true, draggable: false, sortable: true,
    //             filter: { type: 'date', operations: ['equals', 'greaterThan'], options: { dateFormat: 'dd-MM-yyyy' } },
    //             editor: { type: 'date', options: { dateFormat: 'dd-MM-yyyy' } }
    //         },
    //         {
    //             name: 'weight', footerAggregation: 'avg', label: 'Weight', dataKey: "nested.weightx", cellFormatter: "#,###.##",
    //             footerFormatter: "Avg. {#,###.00}", resizable: true, draggable: true, sortable: true,
    //             filter: { type: 'number', options: { decimalDigits: 3, mode: 'decimal' } },
    //             editor: { type: 'number', options: { allowArrowKeys: true, mode: 'decimal' } }
    //         },
    //     ]
    // }

    customValidate(control: AbstractControl): ValidationErrors | null {
        if (control.value == 'AB')
            return null;
        return { error: 'should be AB' };
    }

    changeControlName() {
        //this.controlName = 'test2';
        this.controlName = this.controlName ? null : 'name';
    }

    changeControlName2() {
        this.controlNameX = this.controlNameX ? null : 'name2';
    }

    changeSectionName(section: number) {
        if (section === 1 || section === 3)
            this.sectionName1 = this.sectionName1 ? null : 'MS';
        if (section === 2 || section === 3)
            this.sectionName2 = this.sectionName2 ? null : 'SS';
    }

    valueChanged(event: unknown) {
        console.log(event);
    }
    _groupValue = signal<unknown>(null);
    onCreated(form: CSForm) {
        console.log('form-created');
        this.form = form;
        form.formGroup.reset({ arrayControl: createSampleData(1), MS: { C1: "AR1" }, X4: { C2: "AR2" }, password1: 'ax', SS: { password2: 'ahmed' } });
        this.formGroup = form.formGroup;
        this.formGroup.valueChanges.subscribe(v => this._groupValue.set(v));
        // this.formGroup.events.pipe(
        //     filter(e => e instanceof ValueChangeEvent && e.source.parent != null),
        //     map(e => {
        //         const index = Object.values(e.source.parent!.controls).indexOf(e.source);
        //         return {
        //             key: Object.keys(e.source.parent!.controls)[index],
        //             value: e.source.value,
        //             formValue: (e as ValueChangeEvent<unknown>).value
        //         }
        //     })
        // ).subscribe(e => {
        //     console.log(e);
        //     const frm = this.formGroup;
        // });
    }

    // addRecord() {
    //     this._tableApi?.addRecord();
    // }

    // removeRowByIndex() {
    //     this._tableApi?.removeRecords(2);
    // }


    // onGridCreated(event: ICdkTableApi<PeriodicElement>) {
    //     this._tableApi = event;
    // }

    // toggleTableSelection() {
    //     this.config.selectable = this.config.selectable == 'single' ? 'multiple' : 'single';
    // }



}