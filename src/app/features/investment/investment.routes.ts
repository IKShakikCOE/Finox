import { Routes } from '@angular/router';

export const investmentRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/investment-dashboard.component').then(m => m.InvestmentDashboardComponent)
    },
    {
        path: 'campaigns',
        loadComponent: () => import('./pages/investment-campaigns.component').then(m => m.InvestmentCampaignsComponent)
    },
    {
        path: 'compare',
        loadComponent: () => import('./pages/investment-compare.component').then(m => m.InvestmentCompareComponent)
    }
];
