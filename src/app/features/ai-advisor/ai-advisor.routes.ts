import { Routes } from '@angular/router';

export const aiAdvisorRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/ai-advisor.component').then(m => m.AiAdvisorComponent)
    }
];
