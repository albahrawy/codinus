import { InjectionToken } from "@angular/core";
import { ICSDialogOptions } from "@ngx-codinus/cdk/overlays";

export const CODINUS_DIALOG_OPTIONS = new InjectionToken<ICSDialogDefaults>('codinus_dialog_options');

export interface ICSDialogDefaults {
    dialog: ICSDialogOptions;
    alert: ICSDialogOptions;
    confirm: ICSDialogOptions;
    showHtml: ICSDialogOptions;
}

export const Default_Codinus_Dialog_Options: ICSDialogDefaults = {
    dialog: {
        closeOnX: true,
        maxWidth: '80vw',
        actionBar: {
            show: true,
            buttons: {
                accept: {
                    icon: 'check',
                    text: 'Dialog.Accept',
                },
                close: {
                    icon: 'clear',
                    text: 'Dialog.Close',
                }
            }
        }
    },
    alert: {
        actionBar: {
            show: true,
            buttons: {
                accept: {
                    icon: 'check',
                    text: 'Dialog.Accept',
                },
                close: {
                    icon: 'clear',
                    text: 'Dialog.Close',
                }
            }
        }
    },
    confirm: {
        actionBar: {
            show: true,
            buttons: {
                accept: {
                    icon: 'check',
                    text: 'Dialog.Accept',
                },
                close: {
                    icon: 'clear',
                    text: 'Dialog.Close',
                }
            }
        }
    },
    showHtml: {
        maxWidth: '80vw',
        actionBar: {
            show: true,
            buttons: {
                accept: {
                    icon: 'check',
                    text: 'Dialog.Accept',
                },
                close: {
                    icon: 'clear',
                    text: 'Dialog.Close',
                }
            }
        }
    }
};