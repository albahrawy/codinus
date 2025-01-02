import { Directive, ViewContainerRef } from "@angular/core";

@Directive({
    selector: '[cs-outlet]',
    exportAs: 'csOutlet'
})
export class CSOutletDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}