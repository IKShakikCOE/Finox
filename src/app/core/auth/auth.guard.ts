import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Not authenticated — redirect to login page
    router.navigate(['/auth/login']);
    return false;
};

export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (!authService.isAuthenticated()) {
            router.navigate(['/auth/login']);
            return false;
        }

        // For role-based access, check user roles from token
        // (implement when roles are available in token)
        return true;
    };
};
