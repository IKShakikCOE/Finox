import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Article, NewsDataResponse, NewsCategory } from '../models/news.model';

@Injectable({ providedIn: 'root' })
export class NewsService {
    private http = inject(HttpClient);

    articles = signal<Article[]>([]);
    categories = signal<string[]>([]);
    selectedCategory = signal<NewsCategory>('All');
    searchQuery = signal<string>('');

    filteredArticles = computed(() => {
        let result = this.articles();
        const category = this.selectedCategory();
        const query = this.searchQuery().toLowerCase();

        if (category !== 'All') {
            result = result.filter(a => a.category === category);
        }
        if (query) {
            result = result.filter(a =>
                a.title.toLowerCase().includes(query) ||
                a.excerpt.toLowerCase().includes(query) ||
                a.tags.some(t => t.toLowerCase().includes(query))
            );
        }
        return result;
    });

    featuredArticles = computed(() => this.articles().filter(a => a.featured));

    async loadData(): Promise<void> {
        try {
            const data = await firstValueFrom(
                this.http.get<NewsDataResponse>('demo/financial-news.json')
            );
            this.articles.set(data.articles);
            this.categories.set(data.categories);
        } catch (error) {
            console.error('Failed to load news data', error);
        }
    }
}
