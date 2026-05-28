import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // Skip token for public endpoints, local assets, and Keycloak endpoints
    const skipPaths = ['/assets/', '/demo/', '/keycloak/', '/openid-connect/token', '/openid-connect/logout', '/openid-connect/userinfo'];
    const shouldSkip = skipPaths.some(path => req.url.includes(path));

    if (shouldSkip || !authService.isAuthenticated()) {
        return next(req);
    }

    const token = authService.getToken();
    if (token) {
        const authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next(authReq);
    }

    return next(req);
};
