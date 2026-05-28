import { Routes } from '@angular/router';

export const insuranceRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/insurance-list.component').then(m => m.InsuranceListComponent)
    },
    {
        path: 'products',
        loadComponent: () => import('./pages/insurance-products.component').then(m => m.InsuranceProductsComponent)
    },
    {
        path: 'compare',
        loadComponent: () => import('./pages/insurance-compare.component').then(m => m.InsuranceCompareComponent)
    }
];
