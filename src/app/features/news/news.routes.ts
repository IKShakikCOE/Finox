import { Routes } from '@angular/router';

export const newsRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/news-list.component').then(m => m.NewsListComponent),
        data: { category: 'All' }
    },
    {
        path: 'news',
        loadComponent: () => import('./pages/news-list.component').then(m => m.NewsListComponent),
        data: { category: 'News' }
    },
    {
        path: 'tips',
        loadComponent: () => import('./pages/news-list.component').then(m => m.NewsListComponent),
        data: { category: 'Tips' }
    },
    {
        path: 'advice',
        loadComponent: () => import('./pages/news-list.component').then(m => m.NewsListComponent),
        data: { category: 'Advice' }
    },
    {
        path: 'books',
        loadComponent: () => import('./pages/news-list.component').then(m => m.NewsListComponent),
        data: { category: 'Books' }
    },
    {
        path: 'learning',
        loadComponent: () => import('./pages/news-list.component').then(m => m.NewsListComponent),
        data: { category: 'Learning' }
    },
    {
        path: 'article/:id',
        loadComponent: () => import('./pages/news-detail.component').then(m => m.NewsDetailComponent)
    }
];
