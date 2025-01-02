import { Nullable } from "@codinus/types";

export interface ICSButtonBase {
    icon?: string;
    cssClass?: string;
    disabled?: boolean;
    hidden?: boolean;
    order?: number;
}

export interface IButtonContainerAction<T extends ICSButtonBase> {
    get(key: string): T | undefined;
    disableContainer(): void;
    enableContainer(): void;
}

export interface ICSButtonBaseArgs<T extends ICSButtonBase> {
    button: T;
    key: string;
    container: IButtonContainerAction<T>
}

export type ICSButtonConfigBase<T extends ICSButtonBase> = Nullable<Record<string, T>>;

export interface ICSButtonUIBase<T extends ICSButtonBase> {
    args: T;
    key: string;
} 