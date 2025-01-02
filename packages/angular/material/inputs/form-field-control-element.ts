// import { Directive, DoCheck, ElementRef, forwardRef, inject, Injector, Input, OnDestroy } from '@angular/core';
// import { NgControl } from '@angular/forms';
// import { ErrorStateMatcher } from '@angular/material/core';
// import { MatFormFieldControl } from '@angular/material/form-field';
// import { createMFFCWrapper, IMatFormFieldSupport } from "@ngx-codinus/core/shared";

// @Directive({
//     selector: '[csMatControlElement]',
//     providers: [
//         {
//             provide: MatFormFieldControl,
//             useFactory: (component: CSMatControlElement) => component._formFieldControlWrapper,
//             deps: [forwardRef(() => CSMatControlElement)],
//         }]
// })
// export class CSMatControlElement implements IMatFormFieldSupport<unknown>, OnDestroy, DoCheck {

//     private injector = inject(Injector);
//     readonly _elementRef = inject(ElementRef, { self: true });
//     private readonly _formFieldControlWrapper = createMFFCWrapper<unknown>(this, this.injector);

//     value = null;
//     @Input() id: string = this._formFieldControlWrapper.id;

//     @Input()
//     get errorStateMatcher(): ErrorStateMatcher | undefined { return this._formFieldControlWrapper.errorStateMatcher; }
//     set errorStateMatcher(value: ErrorStateMatcher | undefined) { this._formFieldControlWrapper.errorStateMatcher = value; }

//     @Input()
//     get disabled() { return this._elementRef.nativeElement.disabled; }
//     set disabled(value: boolean) { this._elementRef.nativeElement.disabled = value; }

//     @Input() shouldLabelFloat = false;
//     @Input() empty = false;

//     @Input()
//     get ngControl(): NgControl | null { return this._formFieldControlWrapper.ngControl; }
//     set ngControl(value: NgControl | null | undefined) {
//         (this._formFieldControlWrapper as { ngControl: NgControl | null }).ngControl = value ?? null;
//         this._formFieldControlWrapper.changeState();
//     }

//     focus(): void {
//         /** */
//     }

//     writeValue(): void {
//         /** */
//     }

//     setDisabledState(isDisabled: boolean): void {
//         this.disabled = isDisabled;
//     }

//     ngDoCheck(): void {
//         this._formFieldControlWrapper.updateErrorState();
//     }

//     ngOnDestroy(): void {
//         this._formFieldControlWrapper.destroy();
//     }
// }