import { IAction, ICSAddonProgress, Nullable } from "@codinus/types";
import { ICSButtonBaseArgs, ICSButtonConfigBase } from "./internal-types";

export type CSButtonStyle = Nullable<"basic" | "flat" | "raised" | "stroked" | ''>;
export type CSIconType = Nullable<'img' | 'svg' | 'font'>;
export type CSSpeedButtonDirection = 'up' | 'down' | 'left' | 'right';
export type CSSpeedButtonMode = 'click' | 'hover' | 'static';
export type CSSpeedButtonAnimation = 'fling' | 'scale';
export type CSSpeedButtonSpin = 360 | 180 | false;

export type ICSSpeedButtonArgs = ICSButtonBaseArgs<ICSFabButton>;
export type ICSButtonArgs = ICSButtonBaseArgs<ICSButtonArg>;

export interface ICSSplitButtonItem {
    key: string;
    text?: string | Record<string, string>;
    icon?: string;
    disabled?: boolean;
    hidden?: boolean;
}

export interface ISplitButtonArgs {
    clickedButton: ICSSplitButtonItem;
    getItem(key: string): Nullable<ICSSplitButtonItem>;
}

export interface ICSIcon {
    type: CSIconType;
    icon: string;
}

export interface ICSFabButton {
    icon: string;
    cssClass?: string;
    disabled?: boolean;
    hidden?: boolean;
    order?: number;
    tooltip?: string;
}

export interface ICSButtonItem extends Partial<ICSFabButton> {
    text?: string | Record<string, string>;
    isFab?: boolean;
    type?: CSButtonStyle;
    progress?: Partial<ICSAddonProgress>;
}

export type ICSButtonConfig = ICSButtonConfigBase<ICSButtonItem>;
export type ICSSpeedButtonConfig = ICSButtonConfigBase<ICSFabButton>;

export interface ICSButtonArg extends ICSButtonItem {
    progress: ICSAddonProgress;
    setBusy: IAction<boolean>;
}
