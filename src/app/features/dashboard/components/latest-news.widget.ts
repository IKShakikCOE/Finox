import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { NewsService } from '../../news/services/news.service';

@Component({
    standalone: true,
    selector: 'fx-latest-news-widget',
    imports: [CommonModule, RouterModule, ButtonModule, TagModule],
    template: `
    <div class="card">
        <div class="flex items-center justify-between mb-4">
            <div class="font-semibold text-xl">Financial News</div>
            <p-button label="All News" icon="pi pi-arrow-right" [text]="true"
                severity="secondary" size="small" routerLink="/app/learn" />
        </div>

        @if (newsService.articles().length === 0) {
            <div class="text-center p-4 text-muted-color">
                <i class="pi pi-book text-2xl mb-2 block"></i>
                <p class="text-sm m-0">Loading news...</p>
            </div>
        } @else {
            <div class="flex flex-col gap-3">
                @for (article of newsService.articles().slice(0, 4); track article.id) {
                    <a [routerLink]="['/app/learn/article', article.id]" class="no-underline text-inherit">
                        <div class="flex items-start gap-3 p-2 border-round hover:surface-hover transition-colors cursor-pointer">
                            <div class="flex items-center justify-center surface-ground border-round p-2" style="min-width: 2.5rem; height: 2.5rem">
                                <i [class]="article.image + ' text-primary'"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <span class="text-sm font-medium block truncate text-surface-900 dark:text-surface-0">{{ article.title }}</span>
                                <div class="flex items-center gap-2 mt-1">
                                    <p-tag [value]="article.category" [severity]="getCategorySeverity(article.category)" />
                                    <span class="text-xs text-muted-color">{{ article.readTime }}</span>
                                </div>
                            </div>
                        </div>
                    </a>
                }
            </div>
        }
    </div>`
})
export class LatestNewsWidget implements OnInit {
    newsService = inject(NewsService);

    ngOnInit() {
        if (!this.newsService.articles().length) {
            this.newsService.loadData();
        }
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
