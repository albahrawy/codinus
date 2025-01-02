import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, EMPTY, Observable, throwError } from 'rxjs';
import { CODINUS_AUTH_SERVICE } from './types';

export function authTokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const authService = inject(CODINUS_AUTH_SERVICE);
    const token = authService.currentUserToken();
    if (token)
        req = req.clone({ headers: req.headers.set('Authorization', token) });

    return next(req)
        .pipe(
            catchError((error: HttpErrorResponse) => {
                if (!(error.error instanceof ErrorEvent)) {
                    if (error.status === 401) {
                        authService.logout();
                        return EMPTY;
                    }
                }
                return throwError(() => error);
            })
        );
}