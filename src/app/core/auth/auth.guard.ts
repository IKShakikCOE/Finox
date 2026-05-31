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

        // Check if user has any of the required roles
        if (authService.hasAnyRole(requiredRoles)) {
            return true;
        }

        // User doesn't have required role — redirect to main app
        router.navigate(['/app']);
        return false;
    };
};
