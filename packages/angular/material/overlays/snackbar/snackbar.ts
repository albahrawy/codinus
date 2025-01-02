/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType } from "@angular/cdk/portal";
import { EmbeddedViewRef, inject, Injectable, TemplateRef } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from "@angular/material/snack-bar";
import { CSRelativeOverlay } from "./relative-overlay-container";
import { Nullable } from "@codinus/types";

export class CSSnackBarConfig<D = any> extends MatSnackBarConfig<D> {
    element?: Nullable<HTMLElement>;
}

@Injectable({ providedIn: 'root' })
//@ts-expect-error override private property
export class CSSnackBar extends MatSnackBar {
    private override _overlay = inject(CSRelativeOverlay);

    override get _openedSnackBarRef(): MatSnackBarRef<any> | null {
        return super._openedSnackBarRef;
    }
    override set _openedSnackBarRef(value: MatSnackBarRef<any> | null) {
        super._openedSnackBarRef = value;
        if (value === null)
            this._overlay.attachElementToContainer(null);
    }

    override open(message: string, action?: string, config?: CSSnackBarConfig)
        : MatSnackBarRef<TextOnlySnackBar> {
        return super.open(message, action, config);
    }

    override openFromComponent<T, D = any>(component: ComponentType<T>, config?: CSSnackBarConfig<D>,
    ): MatSnackBarRef<T> {
        this._overlay.attachElementToContainer(config?.element);
        return super.openFromComponent(component, config);
    }

    override openFromTemplate(template: TemplateRef<any>, config?: CSSnackBarConfig,
    ): MatSnackBarRef<EmbeddedViewRef<any>> {
        this._overlay.attachElementToContainer(config?.element);
        return super.openFromTemplate(template, config);
    }
}