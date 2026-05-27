import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'features-widget',
    imports: [CommonModule],
    template: `
        <div id="features" class="py-16 px-6 lg:px-20 mx-0 lg:mx-20">
            <div class="text-center mb-12">
                <span class="inline-block px-4 py-2 mb-4 border-round-3xl text-sm font-bold uppercase tracking-wider" style="background: #eff6ff; color: #3B82F6">Features</span>
                <h2 class="text-surface-900 dark:text-surface-0 font-bold text-4xl md:text-5xl mb-4">Everything You Need</h2>
                <p class="text-muted-color text-xl max-w-2xl mx-auto">One platform for tracking, comparing, investing, and learning — designed for the Bangladesh financial ecosystem.</p>
            </div>

            <div class="grid grid-cols-12 gap-6">
                <div *ngFor="let feature of features" class="col-span-12 md:col-span-6 lg:col-span-4">
                    <div class="p-6 h-full border-round-2xl transition-all hover:shadow-4" style="border: 1px solid var(--surface-border); background: var(--surface-card)">
                        <div class="flex items-center justify-center border-round-xl mb-4" [style.background]="feature.bgColor" style="width: 3.5rem; height: 3.5rem">
                            <i [class]="feature.icon + ' text-xl'" [style.color]="feature.color"></i>
                        </div>
                        <h5 class="mb-2 text-surface-900 dark:text-surface-0 font-bold text-lg">{{ feature.title }}</h5>
                        <p class="text-muted-color leading-relaxed m-0">{{ feature.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class FeaturesWidget {
    features = [
        { icon: 'pi pi-wallet', title: 'Expense Tracker', description: 'Track income & expenses with categories, budgets, and visual reports. Know where every taka goes.', color: '#10B981', bgColor: '#D1FAE5' },
        { icon: 'pi pi-building', title: 'Bank Comparison', description: 'Compare savings, FDR, DPS, and loan products from all major Bangladesh banks side by side.', color: '#3B82F6', bgColor: '#DBEAFE' },
        { icon: 'pi pi-shield', title: 'Insurance Plans', description: 'Browse and compare life, health, vehicle, and pension insurance from top BD companies.', color: '#8B5CF6', bgColor: '#EDE9FE' },
        { icon: 'pi pi-chart-line', title: 'Mutual Funds', description: 'Explore growth, balanced, and fixed income funds. Compare NAV, returns, and risk levels.', color: '#F59E0B', bgColor: '#FEF3C7' },
        { icon: 'pi pi-megaphone', title: 'Ad Investment Tracker', description: 'Track ROI across Google, Facebook, YouTube, and other platforms. Compare campaign performance.', color: '#EF4444', bgColor: '#FEE2E2' },
        { icon: 'pi pi-sparkles', title: 'AI Financial Advisor', description: 'Get personalized advice based on your actual spending, investments, and financial goals.', color: '#6366F1', bgColor: '#E0E7FF' },
        { icon: 'pi pi-book', title: 'News & Learning', description: 'Stay updated with financial news, tips, book reviews, and educational content.', color: '#14B8A6', bgColor: '#CCFBF1' },
        { icon: 'pi pi-calculator', title: 'Smart Budgeting', description: 'Set category-wise budgets with threshold alerts. Track budget vs actual spending in real-time.', color: '#EC4899', bgColor: '#FCE7F3' },
        { icon: 'pi pi-comments', title: 'Team Messaging', description: 'Chat with team members about financial decisions. Collaborate on investment strategies.', color: '#06B6D4', bgColor: '#CFFAFE' }
    ];
}
