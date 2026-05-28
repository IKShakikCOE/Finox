import { Routes } from '@angular/router';

export const bankRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/banks-list.component').then(m => m.BanksListComponent)
    },
    {
        path: ':id',
        loadComponent: () => import('./pages/bank-detail.component').then(m => m.BankDetailComponent)
    },
    {
        path: 'products',
        loadComponent: () => import('./pages/bank-products.component').then(m => m.BankProductsComponent)
    },
    {
        path: 'compare',
        loadComponent: () => import('./pages/bank-compare.component').then(m => m.BankCompareComponent)
    }
];
