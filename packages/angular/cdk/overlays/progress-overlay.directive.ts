import {
    ChangeDetectionStrategy,
    Component,
    Directive, ElementRef, Injector, OnDestroy, Renderer2, ViewContainerRef, ViewEncapsulation, booleanAttribute, effect, inject, input
} from "@angular/core";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Nullable, ProgressMode, ProgressPosition, ProgressType } from "@codinus/types";
import { CompositeComponentWrapper } from "@ngx-codinus/core/shared";

@Directive()
export abstract class CSOverlayProgressBase {
    addOnProgress = input<ProgressType>('spinner');
    progressMode = input('indeterminate', { transform: (v: Nullable<ProgressMode>) => v ?? 'indeterminate' });
    progressValue = input(0, { transform: (v: Nullable<number>) => v ?? 0 });
    cssClass = input<Nullable<string>>();
    diameter = input(20, { transform: (v: Nullable<number>) => v ?? 20 });
    progressPosition = input<ProgressPosition>('end');
}

//TODO: handle disabled
@Component({
    selector: 'loading-inline-component',
    imports: [MatProgressBarModule, MatProgressSpinnerModule],
    host: {
        'class': 'cs-progress-addon-host',
        '[class.inline-spinner]': 'addOnProgress() == "spinner"',
        '[class.end-position]': '!progressPosition() || progressPosition()=="end"',
        '[class.start-position]': 'progressPosition() == "start"'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @switch (addOnProgress()) {
         @case ('bar') {
            <mat-progress-bar [value]="progressValue()" [mode]="progressMode()" [class]="cssClass()"></mat-progress-bar>
         }
         @case ('spinner') {
            <mat-spinner  [diameter]="diameter()" [value]="progressValue()" [mode]="progressMode()" [class]="cssClass()"></mat-spinner>
         }
        }
    `
})
class ProgressInlineComponent extends CSOverlayProgressBase { }

@Directive({
    selector: '[addOnProgress]',
    exportAs: 'addOnProgress',
})
export class CSOverlayProgress extends CSOverlayProgressBase implements OnDestroy {

    private _origDisabled?: boolean = undefined;
    private _elementRef = inject(ElementRef);
    private _viewContainerRef = inject(ViewContainerRef);
    private _renderer = inject(Renderer2);
    private _wrapper = new CompositeComponentWrapper<CSOverlayProgressBase>(this, inject(Injector), [
        'addOnProgress',
        'progressMode',
        'progressValue',
        'cssClass',
        'diameter',
        'progressPosition'
    ]);

    keepElementActive = input(false, { transform: booleanAttribute });
    progressVisible = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });

    constructor() {
        super();
        effect(() => {
            const visible = this.progressVisible();
            if (visible) {
                this._setDisabled(true);
                this._displayProgress();
            } else {
                this._setDisabled(false);
                this._hideProgress();
            }
        });
    }

    ngOnDestroy(): void {
        this._wrapper.detach();
    }

    private _setDisabled(value: boolean) {
        const element = this._elementRef.nativeElement;
        if (value) {
            const currentDisabled = element.getAttribute('disabled') || this.disabled;
            if (currentDisabled)
                this._origDisabled = currentDisabled;
            if (!this.keepElementActive)
                element.setAttribute('disabled', '');
        } else {
            if (!this.keepElementActive && !this._origDisabled) {
                element.removeAttribute('disabled');
                this._origDisabled = undefined;
            }
        }
    }

    private _displayProgress(): void {
        if (!this._wrapper.attached)
            this._wrapper.attach(this._viewContainerRef.createComponent(ProgressInlineComponent));
        if (this._wrapper?.htmlElement)
            this._renderer.appendChild(this._elementRef.nativeElement, this._wrapper.htmlElement);
        this._renderer.addClass(this._elementRef.nativeElement, '--has-inline-progress');
    }

    private _hideProgress() {
        if (this._wrapper?.htmlElement)
            this._renderer.removeChild(this._elementRef.nativeElement, this._wrapper?.htmlElement);
        this._renderer.removeClass(this._elementRef.nativeElement, '--has-inline-progress');
    }
}