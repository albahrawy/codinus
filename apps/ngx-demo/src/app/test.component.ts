import { Component, Directive, effect, ElementRef, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signalFunctionOf, signalPropertyOf } from '@ngx-codinus/core/shared';

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
  selector: 'input:[appTestEvents]',
  host: {
    // '(input)': 'simulateEvent()',
    '(input)': 'performInput($event)',
    '(focus)': 'simulateEvent($event)',
  }
})
export class TestEventDirective extends TestEvent2Directive {
  override _elementRef = inject(ElementRef);
  /**
   *
   */
  constructor() {
    super();
  }
}

@Component({
  selector: 'app-nx-welcome',
  imports: [CommonModule, TestEventDirective],
  template: `
<B>Normal<B><BR/>
  Name : {{nName()}}<BR/>
  Age : {{nAge()}}
  <BR/>
  <B>Signal<B><BR/>
  Name : {{sName()}}<BR/>
  Age : {{sAge()}}

  <br/>
  <button (click)="nObj.name = 'Mohamed'">Set Normal Name </button>
  <button (click)="nObj.age = 15">Set Normal Age </button>
  <button (click)="nObj2.name = 'Adam'">Set Signal Name </button>
  <button (click)="nObj2.age = 8">Set Signal Age </button>
  <button (click)="setEvents()">Set Events </button>
  <button (click)="setEventsFnName()">Set Events Fn Name</button>

<input #tInput (input)="logFromC($event)" appTestEvents/>

   `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class FnTestComponent implements OnInit {
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

