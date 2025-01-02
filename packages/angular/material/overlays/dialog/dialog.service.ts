import { Direction, Directionality } from '@angular/cdk/bidi';
import { Injectable, TemplateRef, Type, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { copyObject, mergeObjects } from '@codinus/js-extensions';
import { CODINUS_HTTP_SERVICE } from '@ngx-codinus/cdk/http';
import { ICSDialogConfig, ICSDialogOptions, ICSDialogService } from '@ngx-codinus/cdk/overlays';
import { EMPTY, Observable, map } from 'rxjs';
import { CSDialogHostComponent } from './cs-dialog';
import { CODINUS_DIALOG_OPTIONS, Default_Codinus_Dialog_Options } from './default.config';

@Injectable({ providedIn: 'root' })
export class CSDialogService implements ICSDialogService<MatDialogRef<unknown>> {

    private readonly dir = inject(Directionality, { optional: true });
    private readonly dialog = inject(MatDialog);
    private readonly htmlService = inject(CODINUS_HTTP_SERVICE, { optional: true });
    private readonly defaultOptions = inject(CODINUS_DIALOG_OPTIONS, { optional: true }) ?? Default_Codinus_Dialog_Options;

    confirm(message: string, options?: ICSDialogOptions<boolean, void, MatDialogRef<unknown, boolean>>): Observable<boolean> {
        return this.openCore({ component: message, options, getResult: () => true }, false, this.defaultOptions.confirm);
    }

    alert(message: string, options?: ICSDialogOptions<void, void, MatDialogRef<unknown, void>> | undefined): Observable<void> {
        return this.openCore({ component: message, options }, false, this.defaultOptions.alert);
    }

    showHtml<TResult = boolean>(url: string | string[], options?: ICSDialogOptions<TResult, void, MatDialogRef<unknown, TResult>> | undefined): Observable<TResult> {
        if (!this.htmlService)
            return EMPTY;
        return this.open<TResult>({ component: this.htmlService.get<string>(url).pipe(map(s => s ?? '')), options });
    }

    open<TResult, TData = void>(config: ICSDialogConfig<TResult, TData, MatDialogRef<unknown, TResult>>, native?: boolean): Observable<TResult> {
        return this.openCore(config, !!native, this.defaultOptions.dialog);
    }

    openCore<TResult, TData, TRef>(config: ICSDialogConfig<TResult, TData, TRef>, native: boolean, defaultOptions: ICSDialogOptions)
        : Observable<TResult> {
        if (!config || !config.component) {
            return EMPTY;
        }

        config = this.createConfig(config, defaultOptions) as ICSDialogConfig<TResult, TData, TRef>;
        const component = native && (config.component instanceof Type || config.component instanceof TemplateRef)
            ? config.component
            : CSDialogHostComponent;
        const data = native ? config.data : config;
        const options = config.options ?? {};
        const direction: Direction = this.dir?.value || document.dir.toLowerCase() as Direction;
        const dialogRef = this.dialog.open(component, {
            minWidth: options.minWidth,
            maxWidth: options.maxWidth,
            minHeight: options.minHeight,
            maxHeight: options.maxHeight,
            width: options.width,
            height: options.height,
            injector: options.injector,
            restoreFocus: true,
            closeOnNavigation: true,
            disableClose: !options.closeOnEscape,
            delayFocusTrap: true,
            //scrollStrategy: new NoopScrollStrategy(),
            data,
            autoFocus: options.autoFocus ?? this.getFocusedButton(options.actionBar?.buttons),
            direction
        });

        // if (!!config?.minWidth || !!config?.minHeight) {
        //     const _minWidth = toNumber(config?.minWidth?.toString()?.replace('px', ''));
        //     const _minHeight = toNumber(config?.minHeight?.toString()?.replace('px', ''));
        //     const _overlay = (dialogRef as any)._overlayRef;
        //     const updateSize = () => {
        //         const _sizes: any = {};
        //         if (!!_minWidth) { _sizes.minWidth = Math.min(_minWidth, document.body.clientWidth - 5); }
        //         if (!!_minHeight) { _sizes.minHeight = Math.min(_minHeight, document.body.clientHeight - 5); }
        //         if (Object.keys(_sizes).length) {
        //             _overlay.updateSize(_sizes);
        //         }
        //     };

        //     updateSize();
        //     fromEvent(window, 'resize').pipe(
        //         distinctUntilChanged((prev, curr) => prev === curr),
        //         takeUntil((dialogRef as any)._afterClosed))
        //         .subscribe(updateSize);
        // }
        return dialogRef.afterClosed();
    }

    getFocusedButton(buttons: Record<string, unknown> | undefined): string | undefined {
        if (!buttons)
            return;
        if (Object.hasOwn(buttons, 'close'))
            return '.cs-dialog-close-button';
        else if (Object.hasOwn(buttons, 'accept')) {
            return '.cs-dialog-accept-button';
        }
        return;
    }


    protected createConfig<TResult, TData, TRef>(config: ICSDialogConfig<TResult, TData, TRef>, defaultOptions: ICSDialogOptions<TResult>) {

        config = { ...(config || {}) };

        const defOptions = copyObject(defaultOptions);
        let options = config.options ?? {};
        if (options.actionBar?.buttons) {
            delete defOptions.actionBar?.buttons;
        }

        if (options.titleButtons) {
            delete defOptions.titleButtons;
        }

        options = config.options = mergeObjects({}, defOptions, options);

        if (options.closeOnX !== false) {
            options.titleButtons ??= {};
            if (!Object.hasOwn(options.titleButtons, 'close')) {
                options.titleButtons['close'] = { icon: 'clear', order: 1000, isFab: true };
            }
            else {
                options.titleButtons['close'].order = 1000;
                options.titleButtons['close'].isFab = true;
            }
        }

        if (options.actionBar?.buttons) {
            if (Object.hasOwn(options.actionBar.buttons, 'close'))
                options.actionBar.buttons['close'].order = 1000;
            if (Object.hasOwn(options.actionBar.buttons, 'accept'))
                options.actionBar.buttons['accept'].order = 999;
        }

        options.closeOnEscape = options.closeOnEscape == null || options.closeOnEscape === true;
        options.caption ||= document.title;

        return config;
    }
}