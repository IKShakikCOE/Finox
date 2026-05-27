import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'highlights-widget',
    imports: [CommonModule],
    template: `
        <div id="highlights" class="py-16 px-6 lg:px-20" style="background: linear-gradient(180deg, #f8fafc 0%, #ecfdf5 50%, #f8fafc 100%)">
            <div class="text-center mb-12">
                <span class="inline-block px-4 py-2 mb-4 border-round-3xl text-sm font-bold uppercase tracking-wider" style="background: #d1fae5; color: #059669">Why FinOx</span>
                <h2 class="text-surface-900 dark:text-surface-0 font-bold text-4xl md:text-5xl mb-4">Built for Bangladesh</h2>
                <p class="text-muted-color text-xl max-w-2xl mx-auto">Not just another finance app. FinOx understands the local banking system, regulations, and financial culture.</p>
            </div>

            <div class="grid grid-cols-12 gap-6">
                <div *ngFor="let item of highlights; let i = index" class="col-span-12 md:col-span-6">
                    <div class="flex items-start gap-5 p-6 border-round-2xl h-full" style="background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.04)">
                        <div class="flex items-center justify-center border-round-xl shrink-0" [style.background]="item.bgColor" style="width: 3rem; height: 3rem">
                            <i [class]="item.icon + ' text-lg'" [style.color]="item.color"></i>
                        </div>
                        <div>
                            <h5 class="m-0 mb-2 text-surface-900 dark:text-surface-0 font-bold">{{ item.title }}</h5>
                            <p class="m-0 text-muted-color leading-relaxed">{{ item.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class HighlightsWidget {
    highlights = [
        { icon: 'pi pi-globe', title: 'Bangladesh Focused', description: 'All data, banks, insurance companies, and AMCs are from Bangladesh. BDT currency, local context, Bangla support.', color: '#059669', bgColor: '#d1fae5' },
        { icon: 'pi pi-lock', title: 'Secure & Private', description: 'Your financial data stays private. No third-party sharing, no ads, no tracking. Bank-grade security.', color: '#6366F1', bgColor: '#e0e7ff' },
        { icon: 'pi pi-bolt', title: 'Real-time Insights', description: 'Instant budget alerts, live portfolio tracking, and AI-powered recommendations as your data changes.', color: '#F59E0B', bgColor: '#fef3c7' },
        { icon: 'pi pi-mobile', title: 'Works Everywhere', description: 'Fully responsive design works on desktop, tablet, and mobile. Access your finances from anywhere.', color: '#EC4899', bgColor: '#fce7f3' },
        { icon: 'pi pi-arrows-h', title: 'Compare Everything', description: 'Side-by-side comparison for banks, insurance, mutual funds, and ad campaigns with best-pick indicators.', color: '#3B82F6', bgColor: '#dbeafe' },
        { icon: 'pi pi-chart-bar', title: 'Visual Reports', description: 'Category-wise breakdowns, trend analysis, budget vs actual charts, and exportable PDF/Excel reports.', color: '#14B8A6', bgColor: '#ccfbf1' },
        { icon: 'pi pi-graduation-cap', title: 'Financial Literacy', description: 'Curated articles, book reviews, tips, and learning resources to grow your financial knowledge.', color: '#8B5CF6', bgColor: '#ede9fe' },
        { icon: 'pi pi-sync', title: 'Always Up-to-date', description: 'Latest interest rates, fund NAVs, insurance premiums, and market news updated regularly.', color: '#EF4444', bgColor: '#fee2e2' }
    ];
}
