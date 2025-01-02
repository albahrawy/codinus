import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CdkPortalOutletAttachedRef, ComponentPortal, DomPortal, Portal, PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { AsyncPipe } from '@angular/common';
import { Component, ComponentRef, ElementRef, OnInit, TemplateRef, Type, ViewContainerRef, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { isEmpty, isFunction, isHTMLElement } from '@codinus/js-extensions';
import { ICSAddonProgress } from '@codinus/types';
import { CSTranslatePipe } from '@ngx-codinus/cdk/localization';
import {
    CODINUS_MESSAGE_SERVICE,
    ICSDialogActionArgs, ICSDialogButtonConfig, ICSDialogComponent,
    ICSDialogConfig, ICSDialogHost
} from '@ngx-codinus/cdk/overlays';
import { SafeHTMLPipe } from '@ngx-codinus/core/shared';
import { CSButtonContainer, ICSButtonArgs } from '@ngx-codinus/material/buttons';
import { Observable, isObservable, take } from 'rxjs';

@Component({
    selector: 'cs-dialog',
    templateUrl: './dialog.html',
    imports: [CSButtonContainer, CSTranslatePipe, MatDialogModule, PortalModule, CdkDrag, CdkDragHandle, SafeHTMLPipe, AsyncPipe],
    host: { '[class]': 'options.cssClass' },
})

export class CSDialogHostComponent<TResult, TData> implements ICSDialogHost<TResult>, OnInit {

    private _dialogRef = inject(MatDialogRef);
    private _viewContainerRef = inject(ViewContainerRef);
    private _messageService = inject(CODINUS_MESSAGE_SERVICE, { optional: true });
    private config: ICSDialogConfig<TResult, TData, MatDialogRef<typeof this>> = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};
    private _csInstance?: ICSDialogComponent<TResult, TData>;

    protected options = this.config.options ??= {};
    protected caption = this.options.caption;
    protected hasActionBar = this.options.actionBar?.show && !isEmpty(this.options.actionBar.buttons);
    protected contentPortal?: Portal<unknown>;
    protected message?: string;
    protected message$?: Observable<string>;

    protected busy = signal(false);

    ngOnInit(): void {

        const component = this.config.component;
        if (typeof component === 'string') {
            this.message = component;
        }
        else if (isObservable(component)) {
            this.message$ = component;
        }
        else if (component instanceof Type) {
            this.contentPortal = new ComponentPortal(component, undefined, this.config.injector);
        } else if (component instanceof TemplateRef) {
            this.contentPortal = new TemplatePortal(component, this._viewContainerRef);
        } else if (component instanceof ElementRef || isHTMLElement(component)) {
            this.contentPortal = new DomPortal(component);
        }
    }

    buttonClicked(event: ICSButtonArgs) {
        switch (event.key) {
            case 'close':
                this.close();
                break;
            case 'accept':
                this._proceedAccept(event);
                break;
            default:
                {
                    const button: ICSDialogButtonConfig<TResult, TData> = event.button;
                    const args: ICSDialogActionArgs<TResult, TData> = {
                        getButton: event.container.get, dialogHost: this, button, dialogRef: this._dialogRef,
                        setBusy: (v) => this.busy.set(v)
                    };
                    if (isFunction(button.click)) {
                        button.click(args);
                    } else {
                        this._csInstance?.buttonClicked?.(event.key, args);
                    }
                }
                break;
        }
    }

    onComponentAttached(ref: CdkPortalOutletAttachedRef) {
        if (ref instanceof ComponentRef && ref.instance) {
            const instance: ICSDialogComponent<TResult, TData> = ref.instance;
            instance.initiate?.(this.config.data, this);
            this._csInstance = instance;
        }
    }

    close() {
        this._dialogRef.close();
    }

    accept(value: TResult): void {
        this._dialogRef.close(value);
    }

    private _proceedAccept(event: ICSButtonArgs) {
        const resultFn = this.config.getResult ?? this._csInstance?.getResult;
        if (resultFn) {
            const result = resultFn(event.button.progress);
            if (isObservable(result)) {
                if (!event.button.progress.type)
                    event.button.progress.type = event.button.isFab ? 'spinner' : 'bar';
                //event.button.progress.visible = true;
                this.busy.set(true);

                result.pipe(take(1)).subscribe({
                    next: r => this.accept(r),
                    error: r => this._showError(r, event.button.progress),
                });
            } else {
                this.accept(result);
            }
        } else {
            this.close();
        }
    }
    private _showError(error: string, progress: ICSAddonProgress): void {
        if (!this._messageService)
            return;
        this._messageService.showError(error, this._viewContainerRef.element.nativeElement, 'bottom',
            () => this._resetAcceptButton(progress));
    }

    private _resetAcceptButton(progress: ICSAddonProgress) {
        progress.visible = false;
        this.busy.set(false);
    }
}