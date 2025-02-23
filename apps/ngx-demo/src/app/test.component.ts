import { AfterViewInit, booleanAttribute, Component, computed, Directive, effect, ElementRef, inject, Injector, input, OnDestroy, OnInit, output, signal, ViewEncapsulation } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { csLinkedSignal, signalFunctionOf, signalPropertyOf } from '@ngx-codinus/core/shared';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { delay, Subject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IArglessFunc } from '@codinus/types';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';


class InternalEvent extends InputEvent { }

@Directive({
  selector: 'input:[appTestEvents]',
  host: {
    // '(input)': 'simulateEvent()',
    '(input)': 'performInput($event)',
    '(focus)': 'simulateEvent($event)',
  }
})
export class TestEvent2Directive {
  private readonly _inputEvent = new InternalEvent('input', { bubbles: true, cancelable: false });
  _elementRef = inject(ElementRef);

  simulateEvent() {
    this._elementRef.nativeElement.dispatchEvent(this._inputEvent);
  }

  performInput($event: Event) {
    if ($event instanceof InternalEvent)
      console.log('Dispatched form internal direcctive event');
    else
      console.log('Dispatched form original direcctive event');
  }
}

@Directive({
  selector: '[appTestEvents]',
  host: {
    //  '[class.cdk-drag-dragging]': '_drag._dragRef.isDragging()',
  }
})
export class TestEventDirective implements AfterViewInit {
  _elementRef = inject(ElementRef);
  injector = inject(Injector);
  _drag?: CdkDrag;

  /**
   *
   */
  constructor() {
    // effect(() => {
    //   console.log('effect');
    //   this.dataSourceChanged.emit(this.currentDataSource());
    //   runInInjectionContext(this.injector, () => {
    //     this._drag = new CdkDrag();
    //     this._drag.disabled = true;

    //   });
    // });

    // effect(() => {
    //   if (this._drag)
    //     this._drag.disabled = this.isDraggable();
    // });

    effect(() => console.log('triggered', this.myK()));
    setInterval(() => this.x.next(), 100);
    this.x.subscribe(f => console.log('triger_sub', f));
  }
  ngAfterViewInit(): void {
    console.log('ngAfterViewInit')
  }
  x = new Subject<void>();
  myK = toSignal(this.x);
  isDraggable = input(false, { transform: booleanAttribute });

  dataSourceChanged = output<string | undefined>();

  dataSource = input<string>();
  vsDataSource = input<string>();

  private currentDataSource = computed(() => this.vsDataSource() ?? this.dataSource());
}
@Component({
  selector: 'cs-option',
  template: '<ng-content></ng-content>',
  providers: [{ provide: MatOption, useExisting: CustomOptionComponent }]
})

export class CustomOptionComponent extends MatOption implements OnDestroy {
  private x = inject(MatSelect);
  constructor() {
    super();
    this.x._closedStream.pipe(delay(1000)).subscribe(() => console.log('close', this._getHostElement().parentElement?.parentElement));
    this.x._openedStream.pipe(delay(1000)).subscribe(() => console.log('open', this._getHostElement().parentElement?.parentElement));
  }
  override ngOnDestroy(): void {
    super.ngOnDestroy();
    console.log('option destroyed');
  }
}


@Component({
  selector: 'app-nx-welcome-x',
  imports: [MatFormFieldModule],
  template: `
<mat-form-field>
  <mat-label>Toppings</mat-label>
</mat-form-field>
           
   `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class FnTestcomponent {

  toppings = new FormControl('');

  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

  showHeader = true;

  private context: { value: Date | null | undefined } | null | undefined;

  outerValue = signal(10);

  myLinkedValue = csLinkedSignal(() => this.outerValue());

  changeLinked() {
    this.myLinkedValue.set(Math.random());
  }

  changeOuter() {
    this.outerValue.set(this.outerValue() + 1);
  }

  reset() {
    this.myLinkedValue.reset();
  }


  onCsClick($event: any) {
    console.log('click', $event);
  }

  onOClick($event: any) {
    console.log('o-click', $event);
  }

  onDragStarted($event: any) {
    console.log('drag', $event);
  }

  onMouseDown($event: any) {
    console.log('down', $event);
  }


  onDblClick($event: any) {
    console.log('dblClick', $event);
  }

  onOMouseDown($event: any) {
    console.log('o-down', $event);
  }


  onODblClick($event: any) {
    console.log('o-dblClick', $event);
  }

  get bindingValue() { return this.context?.value; }
  set bindingValue(value: Date | null | undefined) {
    if (this.context)
      this.context.value = value;
    console.log(value);
  }

  createContext() {
    this.context = { value: null };
  }
  changeContext() {
    this.context = { value: new Date(2020, 1, 1) };
  }
  clearContext() {
    this.context = null;
  }

  log(event: any) {
    // console.log(event);
  }


}

@Component({
  selector: 'app-nx-welcome',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    AsyncPipe,
    JsonPipe,
  ],
  template: `

<div [formGroup]="form">
  <!-- <mat-form-field>
    <mat-label>Phone number</mat-label>
    <cs-flex-property-input formControlName="tel" required></cs-flex-property-input>
    <mat-icon matSuffix>phone</mat-icon>
    <mat-hint>Include area code</mat-hint>
  </mat-form-field> -->
  <p>Entered value: {{form.valueChanges | async | json}}</p>
</div>
   `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class FnTestComponent implements OnInit {

  testFn = signal<IArglessFunc<null | number>>(() => null);

  readonly form = new FormGroup({
    tel: new FormControl(null),
  });
  testComputed = computed(() => this.testFn()());

  registerFn() {
    this.testFn.set(this.mytest2);
  }

  logString(v?: string) {
    console.log('My-Events', v);
  }

  mytest = input(false);
  mytest2 = signal(2);
  xyz = computed(() => this.mytest2());
  setEvents() {
    this.fnSignal.set(new MyEvents());
  }
  setEventsFnName() {
    this.fnConfig.set({ name: 'doSomeThing' });
  }

  logFromC($event: Event) {
    if ($event instanceof InternalEvent)
      console.log('Dispatched form internal outside event');
    else
      console.log('Dispatched form original outside event');
  }

  ngOnInit(): void {
    console.log(this.nObj);
    console.log(this.nObj2);
  }
  nObj = new ConfigTest().setDef();
  nObj2 = new ConfigTest().setDef();
  objSignal = signal(this.nObj2);
  nName = signalPropertyOf(this.nObj, 'name');
  nAge = signalPropertyOf(this.nObj, 'age');
  sName = signalPropertyOf(this.objSignal, 'name');
  sAge = signalPropertyOf(this.objSignal, 'age');
  fnSignal = signal<MyEvents | null>(null);
  fnConfig = signal<{ name: string } | null>(null);
  fn = signalFunctionOf(this.fnSignal, this.fnConfig);

  _e = effect(() => this.fn()?.());
}



class ConfigTest {
  private _age = 0;
  name = '';
  get age(): number { return this._age; }
  set age(value: number) { this._age = value; }

  setDef() {
    this.age = 11;
    this.name = 'Ahmed';
    return this;
  }
}

class MyEvents {
  doSomeThing() {
    console.log('done');
  }
}

