import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { CODINUS_DIALOG_SERVICE, CODINUS_MESSAGE_SERVICE } from "@ngx-codinus/cdk/overlays";
import { CSDialogService } from "./dialog/dialog.service";
import { CSSnackBarMessageService } from "./dialog/message.service";

export function provideCSDialogService(): EnvironmentProviders {
    return makeEnvironmentProviders([
        { provide: CODINUS_DIALOG_SERVICE, useExisting: CSDialogService }
    ]);
}

export function provideCSMessageService(): EnvironmentProviders {
    return makeEnvironmentProviders([
        { provide: CODINUS_MESSAGE_SERVICE, useExisting: CSSnackBarMessageService }
    ]);
}