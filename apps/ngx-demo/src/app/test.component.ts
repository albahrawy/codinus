import { AfterViewInit, booleanAttribute, Component, computed, Directive, effect, ElementRef, inject, Injector, input, OnInit, output, runInInjectionContext, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signalFunctionOf, signalPropertyOf } from '@ngx-codinus/core/shared';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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
  selector: 'app-nx-welcome',
  imports: [CommonModule, TestEventDirective, DragDropModule],
  template: `
<!-- <B>Normal<B><BR/>
  Name : {{nName()}}<BR/>
  Age : {{nAge()}}
  <BR/>
  <B>Signal<B><BR/>
  Name : {{sName()}}<BR/>
  Age : {{sAge()}} -->

  {{mytest()}}
  <BR>
  {{mytest2()}}
  <BR>
  {{xyz()}}

  <br/>
  <button (click)="nObj.name = 'Mohamed'">Set Normal Name </button>
  <button (click)="nObj.age = 15">Set Normal Age </button>
  <button (click)="nObj2.name = 'Adam'">Set Signal Name </button>
  <button (click)="nObj2.age = 8">Set Signal Age </button>
  <button (click)="setEvents()">Set Events </button>
  <button (click)="setEventsFnName()">Set Events Fn Name</button>
  <input #tInput dataSource="ahmed" (dataSourceChanged)="logString($event)" appTestEvents/>

  <!-- <div style="height: 200px; background-color:red;" cdkDropList>
  <div style="height: 20px; width:50px; background-color:yellow;" appTestEvents isDraggable="true">
  </div>
  <div style="height: 20px; width:50px; background-color:green;" appTestEvents isDraggable="true">
  </div>
  <div style="height: 20px; width:50px; background-color:white;" appTestEvents isDraggable="false">
  </div>

<div> -->

   `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class FnTestComponent implements OnInit {

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

