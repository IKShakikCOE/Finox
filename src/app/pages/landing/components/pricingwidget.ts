import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'pricing-widget',
    imports: [CommonModule, RouterModule, ButtonModule],
    template: `
        <div id="pricing" class="py-16 px-6 lg:px-20 mx-0 lg:mx-20">
            <div class="text-center mb-12">
                <span class="inline-block px-4 py-2 mb-4 border-round-3xl text-sm font-bold uppercase tracking-wider" style="background: #ede9fe; color: #7c3aed">Pricing</span>
                <h2 class="text-surface-900 dark:text-surface-0 font-bold text-4xl md:text-5xl mb-4">Simple, Transparent Pricing</h2>
                <p class="text-muted-color text-xl max-w-2xl mx-auto">Start free, upgrade when you need more power. No hidden fees.</p>
            </div>

            <div class="grid grid-cols-12 gap-6 justify-center max-w-5xl mx-auto">
                <!-- Free Plan -->
                <div class="col-span-12 md:col-span-4">
                    <div class="p-6 border-round-2xl h-full flex flex-col" style="border: 1px solid var(--surface-border); background: var(--surface-card)">
                        <h4 class="text-surface-900 dark:text-surface-0 font-bold mb-2">Free</h4>
                        <p class="text-muted-color text-sm mb-4">Perfect to get started</p>
                        <div class="mb-6">
                            <span class="text-5xl font-bold text-surface-900 dark:text-surface-0">৳0</span>
                            <span class="text-muted-color">/forever</span>
                        </div>
                        <ul class="list-none p-0 m-0 flex-1 mb-6">
                            <li *ngFor="let f of freePlan" class="flex items-center gap-3 mb-3">
                                <i class="pi pi-check text-green-500"></i>
                                <span class="text-surface-700 dark:text-surface-200">{{ f }}</span>
                            </li>
                        </ul>
                        <button pButton label="Get Started" routerLink="/auth/register" class="w-full" severity="secondary" [outlined]="true"></button>
                    </div>
                </div>

                <!-- Pro Plan -->
                <div class="col-span-12 md:col-span-4">
                    <div class="p-6 border-round-2xl h-full flex flex-col relative overflow-hidden" style="border: 2px solid #10B981; background: linear-gradient(180deg, #ecfdf5 0%, var(--surface-card) 30%)">
                        <div class="absolute top-0 right-0 px-4 py-1 text-xs font-bold text-white" style="background: linear-gradient(135deg, #10B981, #059669); border-radius: 0 0 0 12px">MOST POPULAR</div>
                        <h4 class="text-surface-900 dark:text-surface-0 font-bold mb-2">Pro</h4>
                        <p class="text-muted-color text-sm mb-4">For serious money managers</p>
                        <div class="mb-6">
                            <span class="text-5xl font-bold text-surface-900 dark:text-surface-0">৳299</span>
                            <span class="text-muted-color">/month</span>
                        </div>
                        <ul class="list-none p-0 m-0 flex-1 mb-6">
                            <li *ngFor="let f of proPlan" class="flex items-center gap-3 mb-3">
                                <i class="pi pi-check text-green-500"></i>
                                <span class="text-surface-700 dark:text-surface-200">{{ f }}</span>
                            </li>
                        </ul>
                        <button pButton label="Start Pro Trial" routerLink="/auth/register" class="w-full" style="background: linear-gradient(135deg, #10B981, #059669); border: none"></button>
                    </div>
                </div>

                <!-- Business Plan -->
                <div class="col-span-12 md:col-span-4">
                    <div class="p-6 border-round-2xl h-full flex flex-col" style="border: 1px solid var(--surface-border); background: var(--surface-card)">
                        <h4 class="text-surface-900 dark:text-surface-0 font-bold mb-2">Business</h4>
                        <p class="text-muted-color text-sm mb-4">For teams & organizations</p>
                        <div class="mb-6">
                            <span class="text-5xl font-bold text-surface-900 dark:text-surface-0">৳999</span>
                            <span class="text-muted-color">/month</span>
                        </div>
                        <ul class="list-none p-0 m-0 flex-1 mb-6">
                            <li *ngFor="let f of businessPlan" class="flex items-center gap-3 mb-3">
                                <i class="pi pi-check text-green-500"></i>
                                <span class="text-surface-700 dark:text-surface-200">{{ f }}</span>
                            </li>
                        </ul>
                        <button pButton label="Contact Sales" routerLink="/auth/register" class="w-full" severity="secondary" [outlined]="true"></button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class PricingWidget {
    freePlan = ['Expense & Income Tracking', 'Basic Budgeting', 'Bank Product Comparison', '100 transactions/month', 'Financial News & Tips'];
    proPlan = ['Everything in Free', 'Unlimited Transactions', 'AI Financial Advisor', 'Ad Investment Tracker', 'Advanced Reports & Export', 'Team Messaging', 'Priority Support'];
    businessPlan = ['Everything in Pro', 'Multi-user Access (10+)', 'Custom Categories & Accounts', 'API Access', 'White-label Option', 'Dedicated Account Manager'];
}
