import { booleanAttribute, Component, Directive, input, ViewEncapsulation } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CSInputButtonDirectiveBase, CSInputButtonElementBase } from "../base/input-button-base.directive";

@Component({
    selector: 'cs-input-clear-button',
    imports: [MatButtonModule, MatIconModule],
    encapsulation: ViewEncapsulation.None,
    template: `
            @if(shouldShow){
                <button class="cs-input-button-inline" [disabled]="disabled()" 
                (click)="onButtonClick($event)" mat-icon-button>
                    <mat-icon class="cs-input-button-icon">close</mat-icon>
                </button>
            }
    `,
    host: {
        '[style.display]': 'shouldHide',
        'class': 'cs-input-clear-button',
    }
})
class InputSuffixClearComponent extends CSInputButtonElementBase<void> {

    input?: HTMLInputElement;
    showAlways = input(false, { transform: booleanAttribute });
    protected get shouldShow(): boolean { return this.showAlways() || (!!this.input?.value && !this.disabled()); }
    protected get shouldHide() { return this.shouldShow ? '' : 'none'; }
}


@Directive({
    selector: `input:not([type="radio"]):not([type="select"]):not([type="checkbox"])[allowClear], textarea[allowClear]`,
    exportAs: 'csClear',
})
export class CSInputClearButton extends CSInputButtonDirectiveBase<void, InputSuffixClearComponent> {

    protected readonly componentType = InputSuffixClearComponent;
    protected override buttonContainerClass = 'cs-input-clear-button-containers';

    override showButton = input(false, { alias: 'allowClear', transform: booleanAttribute });

    protected override setupComponent(): void {
        if (this.buttonWrapper.component) {
            this.buttonWrapper.component.input = this.elementRef.nativeElement;
        }
    }

    protected onbuttonClick(): void {
        if (!this.elementRef.nativeElement.readOnly) {
            this.elementRef.nativeElement.value = '';
            this.elementRef.nativeElement.dispatchEvent(new Event('input'));
            this.elementRef.nativeElement.dispatchEvent(new Event('blur'));
        }
    }
}