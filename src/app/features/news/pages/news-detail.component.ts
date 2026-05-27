import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { NewsService } from '../services/news.service';
import { Article } from '../models/news.model';

@Component({
    selector: 'fx-news-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule],
    template: `
        <div class="card" *ngIf="article">
            <p-button label="Back to Articles" icon="pi pi-arrow-left" severity="secondary" [text]="true" [routerLink]="['/learn']" class="mb-4" />

            <div class="flex items-center justify-center surface-ground border-round mb-4 p-6">
                <i [class]="article.image + ' text-6xl text-primary'"></i>
            </div>

            <div class="flex items-center gap-2 mb-3">
                <p-tag [value]="article.category" [severity]="getCategorySeverity(article.category)" />
                <span class="text-sm text-muted-color">{{ article.date | date: 'dd MMM yyyy' }}</span>
                <span class="text-sm text-muted-color">•</span>
                <span class="text-sm text-muted-color"><i class="pi pi-clock mr-1"></i>{{ article.readTime }}</span>
            </div>

            <h2 class="mt-0 mb-3">{{ article.title }}</h2>

            <div class="flex items-center gap-2 mb-4 text-sm text-muted-color">
                <i class="pi pi-user"></i>
                <span>{{ article.author }}</span>
            </div>

            <div class="text-lg leading-relaxed mb-6 p-4 surface-ground border-round">
                {{ article.excerpt }}
            </div>

            <div class="p-4 border-round surface-ground mb-4">
                <p class="text-muted-color text-sm m-0">
                    <i class="pi pi-info-circle mr-2"></i>
                    This is a preview. Full article content will be available when connected to a CMS or API backend.
                </p>
            </div>

            <div class="flex flex-wrap gap-2">
                <span *ngFor="let tag of article.tags" class="px-3 py-1 surface-ground border-round text-sm font-medium">
                    #{{ tag }}
                </span>
            </div>
        </div>

        <!-- Related Articles -->
        <div class="card mt-4" *ngIf="relatedArticles.length > 0">
            <h5 class="mb-4">Related Articles</h5>
            <div class="grid grid-cols-12 gap-4">
                <div *ngFor="let related of relatedArticles" class="col-span-12 md:col-span-4">
                    <div class="border surface-border border-round p-3 cursor-pointer hover:surface-hover transition-colors" [routerLink]="['/learn/article', related.id]">
                        <p-tag [value]="related.category" [severity]="getCategorySeverity(related.category)" class="mb-2" />
                        <h6 class="mt-0 mb-1">{{ related.title }}</h6>
                        <span class="text-xs text-muted-color">{{ related.readTime }}</span>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class NewsDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private newsService = inject(NewsService);

    article: Article | undefined;
    relatedArticles: Article[] = [];

    ngOnInit() {
        if (!this.newsService.articles().length) {
            this.newsService.loadData().then(() => this.loadArticle());
        } else {
            this.loadArticle();
        }
    }

    private loadArticle() {
        const id = this.route.snapshot.paramMap.get('id');
        this.article = this.newsService.articles().find(a => a.id === id);

        if (this.article) {
            // Find related articles by same category or overlapping tags
            this.relatedArticles = this.newsService.articles()
                .filter(a => a.id !== this.article!.id && (a.category === this.article!.category || a.tags.some(t => this.article!.tags.includes(t))))
                .slice(0, 3);
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
