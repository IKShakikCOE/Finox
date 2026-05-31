import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/admin-dashboard.component').then(m => m.AdminDashboardComponent)
    },
    {
        path: 'users',
        loadComponent: () => import('./pages/user-management.component').then(m => m.UserManagementComponent)
    },
    {
        path: 'banks',
        loadComponent: () => import('./pages/bank-management.component').then(m => m.BankManagementComponent)
    },
    {
        path: 'insurance',
        loadComponent: () => import('./pages/insurance-management.component').then(m => m.InsuranceManagementComponent)
    },
    {
        path: 'mutual-funds',
        loadComponent: () => import('./pages/mutual-fund-management.component').then(m => m.MutualFundManagementComponent)
    },
    {
        path: 'news',
        loadComponent: () => import('./pages/news-management.component').then(m => m.NewsManagementComponent)
    },
    {
        path: 'tracker-meta',
        loadComponent: () => import('./pages/tracker-meta-management.component').then(m => m.TrackerMetaManagementComponent)
    },
    {
        path: 'platforms',
        loadComponent: () => import('./pages/platform-management.component').then(m => m.PlatformManagementComponent)
    },
    {
        path: 'profiles',
        loadComponent: () => import('./pages/profiles-management.component').then(m => m.ProfilesManagementComponent)
    },
    {
        path: 'audit-logs',
        loadComponent: () => import('./pages/audit-logs.component').then(m => m.AuditLogsComponent)
    },
    {
        path: 'analytics',
        loadComponent: () => import('./pages/analytics.component').then(m => m.AnalyticsComponent)
    },
    {
        path: 'announcements',
        loadComponent: () => import('./pages/announcements.component').then(m => m.AnnouncementsComponent)
    },
    {
        path: 'seed',
        loadComponent: () => import('./pages/seed-data.component').then(m => m.SeedDataComponent)
    }
];
