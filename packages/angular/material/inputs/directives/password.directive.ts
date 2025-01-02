import { Component, computed, Directive, input, ViewEncapsulation } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CSInputButtonDirectiveBase, CSInputButtonElementBase } from "../base/input-button-base.directive";
import { PasswordRevealButtonMode, PasswordRevealMode } from "../base/types";

@Component({
    selector: 'cs-input-password-button',
    imports: [MatButtonModule, MatIconModule],
    encapsulation: ViewEncapsulation.None,
    template: `
            @if(showButton() || input?.value) {
                @switch (revealOn()) {
                    @case ('hover') {
                        <button class="cs-input-button-inline" [disabled]="disabled()" mat-icon-button
                            (mousedown)="onButtonClick($event,state=true)"
                            (mouseup)="onButtonClick($event,state=false)"
                            (touchstart)="onButtonClick($event,state=true)"
                            (touchend)="onButtonClick($event,state=false)">
                <mat-icon class="cs-input-button-icon">{{state?'visibility':'visibility_off'}}</mat-icon>
            </button>
                    }
                    @default {
                        <button class="cs-input-button-inline" [disabled]="disabled()" mat-icon-button
                            (click)="onButtonClick($event,state=!state);">
                                <mat-icon class="cs-input-button-icon">{{state?'visibility':'visibility_off'}}</mat-icon>
                        </button>
                    }
                }
            }
    `
})
class PasswordButtonComponent extends CSInputButtonElementBase<boolean> {

    protected state = false;
    input?: HTMLInputElement;
    revealOn = input("hover", { transform: (v: PasswordRevealMode) => v || 'hover' });
    revealButton = input<PasswordRevealButtonMode>('value');
    protected showButton = computed(() => this.revealButton() === 'always');
}

@Directive({
    selector: 'input:[type="password"][revealButton]',
    exportAs: 'csPasswordButton',
})
export class CSPasswordReveal extends CSInputButtonDirectiveBase<boolean, PasswordButtonComponent> {

    protected readonly componentType = PasswordButtonComponent;
    protected override buttonContainerClass = 'cs-input-password-button-containers';

    revealOn = input("hover", { transform: (v: PasswordRevealMode) => v || 'hover' });
    revealButton = input<PasswordRevealButtonMode>('value');
    protected override showButton = computed(() => this.revealButton() != 'none');

    protected override get wrapperKeys(): Array<keyof PasswordButtonComponent & string> {
        return [...super.wrapperKeys, 'revealOn', 'revealButton'];
    }

    protected override setupComponent(): void {
        if (this.buttonWrapper.component) {
            this.buttonWrapper.component.input = this.elementRef.nativeElement;
        }
    }

    protected onbuttonClick(show: boolean): void {
        if (!this.elementRef.nativeElement.readOnly) {
            this._renderer.setAttribute(this.elementRef.nativeElement, 'type', show ? 'text' : 'password');
        }
    }
}