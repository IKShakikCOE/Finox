import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, from, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // Skip token for public endpoints, local assets, and Keycloak endpoints
    const skipPaths = ['/assets/', '/demo/', '/keycloak/', '/openid-connect/token', '/openid-connect/logout', '/openid-connect/userinfo'];
    const shouldSkip = skipPaths.some(path => req.url.includes(path));

    if (shouldSkip) {
        return next(req);
    }

    const token = authService.getToken();
    let authReq = req;
    if (token) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(authReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                // If it's the token endpoint itself failing with 401, don't loop
                if (req.url.includes('/openid-connect/token')) {
                    authService.logout();
                    return throwError(() => error);
                }

                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshTokenSubject.next(null);

                    return from(authService.refreshAccessToken()).pipe(
                        switchMap((success) => {
                            isRefreshing = false;
                            if (success) {
                                const newToken = authService.getToken();
                                refreshTokenSubject.next(newToken);
                                return next(req.clone({
                                    setHeaders: { Authorization: `Bearer ${newToken}` }
                                }));
                            } else {
                                authService.logout();
                                return throwError(() => new Error('Refresh token failed'));
                            }
                        }),
                        catchError((err) => {
                            isRefreshing = false;
                            authService.logout();
                            return throwError(() => err);
                        })
                    );
                } else {
                    // Queue other requests while refreshing
                    return refreshTokenSubject.pipe(
                        filter(t => t != null),
                        take(1),
                        switchMap(newToken => {
                            return next(req.clone({
                                setHeaders: { Authorization: `Bearer ${newToken}` }
                            }));
                        })
                    );
                }
            }
            return throwError(() => error);
        })
    );
};
