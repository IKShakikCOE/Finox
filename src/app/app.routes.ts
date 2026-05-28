import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Landing } from './pages/landing/landing';
import { Notfound } from './pages/notfound/notfound';
import { DashboardPage } from './features/dashboard/dashboard.page';
import { authGuard } from './core/auth/auth.guard';

export const appRoutes: Routes = [
    // Public
    { path: '', component: Landing },
    { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes') },

    // Protected
    {
        path: 'app',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: DashboardPage },
            { path: 'tracker', loadChildren: () => import('./features/tracker/tracker.routes').then(m => m.trackerRoutes) },
            { path: 'bank', loadChildren: () => import('./features/bank/bank.routes').then(m => m.bankRoutes) },
            { path: 'insurance', loadChildren: () => import('./features/insurance/insurance.routes').then(m => m.insuranceRoutes) },
            { path: 'mutual-funds', loadChildren: () => import('./features/mutual-funds/mutual-funds.routes').then(m => m.mutualFundsRoutes) },
            { path: 'investment', loadChildren: () => import('./features/investment/investment.routes').then(m => m.investmentRoutes) },
            { path: 'ai-advisor', loadChildren: () => import('./features/ai-advisor/ai-advisor.routes').then(m => m.aiAdvisorRoutes) },
            { path: 'learn', loadChildren: () => import('./features/news/news.routes').then(m => m.newsRoutes) },
            { path: 'profile', loadChildren: () => import('./features/user/user.routes').then(m => m.userRoutes) },
            { path: 'messages', loadChildren: () => import('./features/messages/messages.routes').then(m => m.messagesRoutes) },
            { path: 'calendar', loadChildren: () => import('./features/calendar/calendar.routes').then(m => m.calendarRoutes) }
        ]
    },

    // Fallback (must be last)
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
