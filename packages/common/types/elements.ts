export type ProgressType = 'spinner' | 'bar' | 'none' | undefined;
export type ProgressPosition = "start" | "end" | "center" | '' | undefined;
export type ProgressMode = 'determinate' | 'indeterminate';

export interface ICSProgress {
    visible?: boolean;
    value?: number;
}

export interface ICSAddonProgress extends ICSProgress {
    type?: ProgressType;
    position?: ProgressPosition;
    mode: ProgressMode;
    cssClass?: string;
}