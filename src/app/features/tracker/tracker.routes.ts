import { Routes } from '@angular/router';

export const trackerRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./tracker-crud.component').then(m => m.TrackerCrudComponent)
    },
    {
        path: 'categories',
        loadComponent: () => import('./pages/category-management.component').then(m => m.CategoryManagementComponent)
    },
    {
        path: 'accounts',
        loadComponent: () => import('./pages/account-management.component').then(m => m.AccountManagementComponent)
    },
    {
        path: 'budgeting',
        loadComponent: () => import('./pages/budgeting.component').then(m => m.BudgetingComponent)
    },
    {
        path: 'reports',
        loadComponent: () => import('./pages/tracker-reports.component').then(m => m.TrackerReportsComponent)
    }
];
