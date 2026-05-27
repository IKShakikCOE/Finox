import { Routes } from '@angular/router';

export const bankRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/bank-products.component').then(m => m.BankProductsComponent)
    },
    {
        path: 'compare',
        loadComponent: () => import('./pages/bank-compare.component').then(m => m.BankCompareComponent)
    },
    {
        path: 'profiles',
        loadComponent: () => import('../institutions/pages/banks-list.component').then(m => m.BanksListComponent)
    },
    {
        path: 'profiles/:id',
        loadComponent: () => import('../institutions/pages/bank-detail.component').then(m => m.BankDetailComponent)
    }
];
