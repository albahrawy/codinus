import { ComponentType } from "@angular/cdk/portal";
import { ElementRef, InjectionToken, Injector, TemplateRef } from "@angular/core";
import { ICSAddonProgress, IRecord, IStringRecord } from "@codinus/types";
import { Observable } from "rxjs";

export const CODINUS_DIALOG_SERVICE = new InjectionToken<ICSDialogService<unknown>>('cs_dialog_service');
export const CODINUS_MESSAGE_SERVICE = new InjectionToken<ICSMessageService>('cs_message_service');

export interface ICSMessageService {
    showError(message: string, element?: HTMLElement | null, position?: 'top' | 'bottom', callBack?: () => void): void;
}

export type CSDialogComponentType<TResult, TData, TRef> =
    ComponentType<unknown> | ComponentType<ICSDialogComponent<TResult, TData, TRef>>
    | TemplateRef<unknown> | ElementRef | HTMLElement | string | Observable<string>;


export interface ICSDialogService<TRef> {
    confirm(message: string, options?: ICSDialogOptions<boolean, void, TRef>): Observable<boolean>;
    alert(message: string, options?: ICSDialogOptions<void, void, TRef>): Observable<void>;
    showHtml<TResult = boolean>(url: string | string[], options?: ICSDialogOptions<TResult, void, TRef>): Observable<TResult>
    open<TResult, TData>(config: ICSDialogConfig<TResult, TData, TRef>, native?: boolean): Observable<TResult>;
}

export interface ICSDialogConfig<TResult = unknown, TData = unknown, TRef = unknown> {
    data?: TData;
    getResult?(params: ICSAddonProgress): TResult | Observable<TResult>;
    options?: ICSDialogOptions<TResult, TData, TRef>;
    component: CSDialogComponentType<TResult, TData, TRef>;
    injector?: Injector;
}

export interface ICSDialogHost<TResult> {
    accept(value: TResult): void;
    close(): void;
}

export interface ICSDialogComponent<TResult = unknown, TData = unknown, TRef = unknown> {
    initiate?(data?: TData, host?: ICSDialogHost<TResult>): void;
    getResult?(params: ICSAddonProgress): TResult | Observable<TResult>;
    buttonClicked?(id: string, args?: ICSDialogActionArgs<TResult, TData, TRef>): void;
}

export interface ICSDialogOptions<TResult = unknown, TData = void, TRef = unknown> {
    closeOnEscape?: boolean;
    closeOnX?: boolean;
    caption?: string | IStringRecord | null;
    overflow?: 'auto' | 'hidden';
    cssClass?: string;
    minWidth?: string | number;
    minHeight?: string | number;
    maxWidth?: string | number;
    maxHeight?: string | number;
    injector?: Injector;
    width?: string;
    height?: string;
    panelClasses?: string[];
    autoFocus?: string;
    titleButtons?: ICSDialogButtonCollection<TResult, TData, TRef>;
    actionBar?: {
        show?: boolean;
        buttons?: ICSDialogButtonCollection<TResult, TData, TRef>;
    }
}

export type ICSDialogButtonCollection<TResult, TData, TRef> = IRecord<ICSDialogButtonConfig<TResult, TData, TRef>>;

export interface ICSDialogButtonConfig<TResult = unknown, TData = void, TRef = unknown> {
    icon?: string;
    disabled?: boolean;
    text?: string | Record<string, string>;
    isFab?: boolean;
    order?: number;
    hidden?: boolean;
    progress?: Partial<ICSAddonProgress>;
    cssClass?: string;
    click?: (args?: ICSDialogActionArgs<TResult, TData, TRef>) => void | Observable<TResult> | TResult;
}

export interface ICSDialogActionArgs<TResult = unknown, TData = void, TRef = unknown> {
    button: ICSDialogButtonConfig<TResult, TData, TRef>;
    getButton(key: string): ICSDialogButtonConfig | undefined;
    dialogRef: TRef;
    dialogHost?: ICSDialogHost<TResult>;
    setBusy(value: boolean): void;
}
