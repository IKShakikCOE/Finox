import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { NewsService } from '../services/news.service';
import { NewsCategory } from '../models/news.model';

@Component({
    selector: 'fx-news-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, TagModule, InputTextModule, IconFieldModule, InputIconModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h4 class="m-0">{{ pageTitle }}</h4>
                    <span class="text-muted-color text-sm">{{ pageSubtitle }}</span>
                </div>
                <p-iconfield>
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Search articles..." />
                </p-iconfield>
            </div>

            <!-- Featured Section (only on All page) -->
            <div *ngIf="currentCategory === 'All' && !searchQuery && newsService.featuredArticles().length > 0" class="mb-6">
                <h5 class="mb-4">Featured</h5>
                <div class="grid grid-cols-12 gap-4">
                    <div *ngFor="let article of newsService.featuredArticles().slice(0, 3)" class="col-span-12 md:col-span-4">
                        <div class="border surface-border border-round p-4 h-full flex flex-col cursor-pointer hover:surface-hover transition-colors" [routerLink]="['/learn/article', article.id]">
                            <div class="flex items-center justify-center surface-ground border-round mb-3 p-4">
                                <i [class]="article.image + ' text-4xl text-primary'"></i>
                            </div>
                            <p-tag [value]="article.category" [severity]="getCategorySeverity(article.category)" class="mb-2" />
                            <h5 class="mt-0 mb-2">{{ article.title }}</h5>
                            <p class="text-sm text-muted-color mb-3 flex-1">{{ article.excerpt }}</p>
                            <div class="flex items-center justify-between text-xs text-muted-color">
                                <span>{{ article.author }}</span>
                                <span>{{ article.readTime }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Articles List -->
            <h5 class="mb-4" *ngIf="currentCategory === 'All' && !searchQuery">Latest</h5>
            <div class="flex flex-col gap-4">
                <div *ngFor="let article of filteredByPage()" class="border surface-border border-round p-4 flex gap-4 cursor-pointer hover:surface-hover transition-colors" [routerLink]="['/learn/article', article.id]">
                    <div class="flex items-center justify-center surface-ground border-round p-3" style="min-width: 4rem; height: 4rem">
                        <i [class]="article.image + ' text-2xl text-primary'"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <p-tag [value]="article.category" [severity]="getCategorySeverity(article.category)" />
                            <span class="text-xs text-muted-color">{{ article.date | date: 'dd MMM yyyy' }}</span>
                        </div>
                        <h5 class="mt-0 mb-1">{{ article.title }}</h5>
                        <p class="text-sm text-muted-color m-0 mb-2">{{ article.excerpt }}</p>
                        <div class="flex items-center gap-3 text-xs text-muted-color">
                            <span><i class="pi pi-user mr-1"></i>{{ article.author }}</span>
                            <span><i class="pi pi-clock mr-1"></i>{{ article.readTime }}</span>
                            <div class="flex gap-1">
                                <span *ngFor="let tag of article.tags.slice(0, 3)" class="px-2 py-1 surface-ground border-round text-xs">{{ tag }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div *ngIf="filteredByPage().length === 0" class="text-center p-6 text-muted-color">
                <i class="pi pi-search text-4xl mb-3 block"></i>
                <p class="text-lg">No articles found.</p>
            </div>
        </div>
    `
})
export class NewsListComponent implements OnInit {
    public newsService = inject(NewsService);
    private route = inject(ActivatedRoute);

    currentCategory: NewsCategory = 'All';
    searchQuery: string = '';
    pageTitle: string = 'All Articles';
    pageSubtitle: string = 'Financial news, tips, and resources';

    ngOnInit() {
        if (!this.newsService.articles().length) {
            this.newsService.loadData();
        }

        this.currentCategory = (this.route.snapshot.data['category'] || 'All') as NewsCategory;
        this.setPageMeta();
    }

    private setPageMeta() {
        switch (this.currentCategory) {
            case 'News':
                this.pageTitle = 'Financial News';
                this.pageSubtitle = 'Latest market updates and financial news from Bangladesh';
                break;
            case 'Tips':
                this.pageTitle = 'Money Tips';
                this.pageSubtitle = 'Practical tips to manage and grow your money';
                break;
            case 'Advice':
                this.pageTitle = 'Financial Advice';
                this.pageSubtitle = 'Expert guidance for better financial decisions';
                break;
            case 'Books':
                this.pageTitle = 'Book Reviews';
                this.pageSubtitle = 'Must-read books on personal finance and investing';
                break;
            case 'Learning':
                this.pageTitle = 'Learning Center';
                this.pageSubtitle = 'Guides and tutorials for financial literacy';
                break;
            default:
                this.pageTitle = 'All Articles';
                this.pageSubtitle = 'Financial news, tips, and resources';
        }
    }

    filteredByPage() {
        let articles = this.newsService.articles();

        if (this.currentCategory !== 'All') {
            articles = articles.filter(a => a.category === this.currentCategory);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            articles = articles.filter(a =>
                a.title.toLowerCase().includes(query) ||
                a.excerpt.toLowerCase().includes(query) ||
                a.tags.some(t => t.toLowerCase().includes(query))
            );
        }

        return articles;
    }

    onSearch() {
        // Reactive filtering via filteredByPage()
    }

    getCategorySeverity(category: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (category) {
            case 'News': return 'info';
            case 'Tips': return 'success';
            case 'Advice': return 'warn';
            case 'Books': return 'secondary';
            case 'Learning': return 'info';
            default: return 'info';
        }
    }
}
