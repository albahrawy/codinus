import { Injectable, inject } from '@angular/core';
import { IAction, Nullable } from '@codinus/types';
import { ICSMessageService } from '@ngx-codinus/cdk/overlays';
import { CSSnackBar } from '../snackbar/snackbar';

@Injectable({ providedIn: 'root' })
export class CSSnackBarMessageService implements ICSMessageService {

    private _snackBar = inject(CSSnackBar);

    showError(message: string, element: Nullable<HTMLElement>,
        position: 'top' | 'bottom' = 'bottom', callBack?: IAction): void {

        const config = { duration: 1000, verticalPosition: position, element };
        const _snackBarRef = this._snackBar.open(message, 'x', config);

        if (callBack)
            _snackBarRef.afterDismissed()
                .subscribe(() => setTimeout(() => callBack()));
    }
}