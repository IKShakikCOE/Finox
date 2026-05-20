import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Documentation } from './pages/documentation/documentation';
import { Landing } from './pages/landing/landing';
import { Notfound } from './pages/notfound/notfound';
import { DashboardPage } from './features/dashboard/dashboard.page';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: DashboardPage },
            { 
                path: 'tracker', 
                loadComponent: () => import('./features/tracker/tracker-crud.component').then(m => m.TrackerCrudComponent) 
            },
            { path: 'uikit', loadChildren: () => import('./pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
