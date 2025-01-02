import { Directive, inject, signal } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ICSProgress } from "@codinus/types";
import { CODINUS_AUTH_SERVICE, IAuthUser } from "./types";

@Directive()
export abstract class CSLoginBaseComponent {

    protected authService = inject(CODINUS_AUTH_SERVICE);
    protected activeRoute = inject(ActivatedRoute)
    protected router = inject(Router);

    private _returnUrl = this.activeRoute.snapshot.queryParamMap.get('returnUrl') ?? '/';
    protected authinticateError = signal<string | null>(null);

    protected loginForm = new FormGroup({
        loginName: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
        loginPassword: new FormControl<string>('', { nonNullable: true, validators: Validators.required })
    });

    protected clearError() {
        this.authinticateError.set(null);
    }

    protected authenticate(progress?: ICSProgress) {
        this.clearError();
        if (this.loginForm.invalid)
            return;

        if (progress)
            progress.visible = true;

        const authArg = this.loginForm.getRawValue();
        this.authService.login(authArg.loginName, authArg.loginPassword)
            .subscribe({
                next: value => {
                    if (!value)
                        return this.setError('Unknown Error');
                    if (value.mustChangePassword)
                        return this.changePassword(value);

                    this.router.navigate([this._returnUrl]);
                },
                error: (err: string) => {
                    if (progress)
                        progress.visible = false;
                    this.setError(err);
                },
            }).unsubscribe();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected changePassword(value: IAuthUser): void {
        /** */
    }

    protected setError(err: string) {
        this.authinticateError.set(err);
    }
}