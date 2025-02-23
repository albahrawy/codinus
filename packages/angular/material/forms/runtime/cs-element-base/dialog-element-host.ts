import { computed, Directive, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { CODINUS_DIALOG_SERVICE, CSDialogComponentType } from '@ngx-codinus/cdk/overlays';
import { CSAbstractFormControlName, CSFormGroupDirectiveBase } from '@ngx-codinus/core/forms';
import { CSRunTimeFormElementHostBase } from './form-element-base';
import { ICSSupportDialogFormField } from './types';

@Directive()
export abstract class CSRuntimeFormDialogElementHostBase
    extends CSRunTimeFormElementHostBase<ICSSupportDialogFormField, unknown> {

    protected dialogService = inject(CODINUS_DIALOG_SERVICE);
    private readonly parentGroupDirective = inject(ControlContainer, { optional: true });

    protected dialogConfig = computed(() => {
        const origConfig = { ...this.config() };
        if (origConfig.dialog) {
            origConfig.dialog = { ...origConfig.dialog };
            origConfig.dialog.enabled = false;
            if (origConfig.dialog.templateName)
                origConfig.templateName = origConfig.dialog.templateName;
        }
        origConfig.flexSpan = '1';
        return origConfig;
    });

    override csFormControl = computed(() => {
        const dataKey = (this.dialogConfig() as unknown as { dataKey: string })?.dataKey;
        if (!dataKey)
            return undefined;
        const parent = (this.parentSection ?? this.parentGroupDirective) as unknown as CSFormGroupDirectiveBase;
        if (!parent)
            return undefined;
        parent.directiveLength();
        const directive = parent?.directives.find(d => d.name === dataKey) as unknown as CSAbstractFormControlName;
        if (directive instanceof CSAbstractFormControlName) {
            directive.boundConfig = this.config();
            return directive;
        }
        return undefined;
    });

    protected abstract getComponent(): CSDialogComponentType<unknown, unknown, unknown>;

    openDialog(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.dialogService.open({
            component: this.getComponent(),
            options: {
                caption: this.config().label,
                minHeight: this.dialogConfig().dialog?.minHeight,
                minWidth: this.dialogConfig().dialog?.minWidth,
                actionBar: { show: false },
                cssClass: 'cs-runtime-form-dialog-panel'
            }
        });
    }
}