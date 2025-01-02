import { computed, effect, inject, Injectable, Signal, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { CODINUS_HTTP_SERVICE } from "@ngx-codinus/cdk/http";
import { CODINUS_STORAGE_SERVICE } from "@ngx-codinus/cdk/storage";
import { map, Observable, take } from "rxjs";
import { AuthAPIKeys } from "./constants";
import { CODINUS_AUTH_CONFIG, DefaultAuthConfig, IAuthService, IAuthUser } from "./types";

@Injectable({ providedIn: 'root' })
export class CSAuthService implements IAuthService {

    private _router = inject(Router);
    private _httpService = inject(CODINUS_HTTP_SERVICE);
    private _storageService = inject(CODINUS_STORAGE_SERVICE, { optional: true });
    private _authConfig = inject(CODINUS_AUTH_CONFIG, { optional: true }) ?? DefaultAuthConfig;

    private readonly _currentUser = signal<IAuthUser | null>(null);
    private readonly _storedUser: Signal<IAuthUser | null | undefined>;

    readonly currentUser = computed(() => this._storedUser() || this._currentUser());
    readonly currentUserToken = computed(() => this.currentUser()?.token);
    readonly isLoggedIn = toObservable(this.currentUserToken).pipe(map(token => !!token));

    constructor() {
        const storageService = this._storageService;
        if (!storageService) {
            this._storedUser = signal(null);
            return;
        }

        const storageConfig = this._authConfig.storageConfig;
        this._storedUser = toSignal(storageService.read<IAuthUser>(storageConfig));

        effect(() => {
            const user = this._currentUser();
            if (user)
                storageService?.write(storageConfig, user).subscribe().unsubscribe();
            else
                storageService?.remove(storageConfig).subscribe().unsubscribe();
        });
    }

    login(loginName: string, password: string): Observable<IAuthUser | null> {
        return this._httpService.post<IAuthUser>([AuthAPIKeys.key, AuthAPIKeys.endpoints.auth],
            { loginName, password }, { errorHandleType: 'string' })
            .pipe(take(1), map(user => this._setUser(user)));
    }

    logout(): void {
        this._currentUser.set(null);
        this._router.navigate([this._authConfig.logoutRedirectUrl]);
    }

    private _setUser(user: IAuthUser | null): IAuthUser | null {
        const activeUser = user?.token && !user.mustChangePassword ? user : null;
        this._currentUser.set(activeUser);
        return user;
    }
}