import { Routes } from '@angular/router';

export const messagesRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/messages.component').then(m => m.MessagesComponent)
    }
];
