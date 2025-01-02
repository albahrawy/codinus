import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { CACHING_ENABLED, HTTP_CACHE_SERVICE } from './types';

//TODO: think about local ip
// export function localIpInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
//     return getLocalIp().pipe(mergeMap(ip => {
//         if (ip)
//             req = req.clone({ headers: req.headers.set('X-Local-IP', ip) });
//         return next(req);
//     }));
// }

export function cachingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const cacheService = inject(HTTP_CACHE_SERVICE, { optional: true });
    const cacheEnabled = cacheService && req.context.get(CACHING_ENABLED);
    if (cacheEnabled) {
        const cachedResponse = cacheService.get(req);
        if (cachedResponse)
            return of(cachedResponse);

        return next(req)
            .pipe(
                tap(event => {
                    if (event instanceof HttpResponse)
                        cacheService.put(req, event);
                })
            );
    }
    return next(req);
}