import { Routes } from '@angular/router';

export const mutualFundsRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/amcs-list.component').then(m => m.AmcsListComponent)
    },
    {
        path: 'funds',
        loadComponent: () => import('./pages/mutual-funds-list.component').then(m => m.MutualFundsListComponent)
    },
    {
        path: 'compare',
        loadComponent: () => import('./pages/mutual-funds-compare.component').then(m => m.MutualFundsCompareComponent)
    }
];
