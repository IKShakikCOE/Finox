import { Routes } from '@angular/router';

export const userRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/user-profile.component').then(m => m.UserProfileComponent)
    },
    {
        path: 'settings',
        loadComponent: () => import('./pages/user-settings.component').then(m => m.UserSettingsComponent)
    },
    {
        path: 'change-password',
        loadComponent: () => import('./pages/change-password.component').then(m => m.ChangePasswordComponent)
    }
];
