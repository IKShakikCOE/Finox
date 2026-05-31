import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from '../../messages/services/message.service';
import { InsuranceService } from '../../insurance/services/insurance.service';

@Component({
    standalone: true,
    selector: 'fx-quick-access-widget',
    imports: [CommonModule, RouterModule, ButtonModule, BadgeModule],
    template: `
    <div class="card">
        <div class="font-semibold text-xl mb-4">Quick Access</div>

        <div class="flex flex-col gap-3">
            <!-- Messages -->
            <a routerLink="/app/messages" class="no-underline">
                <div class="flex items-center gap-3 p-3 surface-ground border-round hover:surface-hover transition-colors cursor-pointer">
                    <div class="flex items-center justify-center bg-blue-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-inbox text-blue-500"></i>
                    </div>
                    <div class="flex-1">
                        <span class="font-medium text-sm block text-surface-900 dark:text-surface-0">Messages</span>
                        <span class="text-xs text-muted-color">
                            {{ msgService.totalUnread() > 0 ? msgService.totalUnread() + ' unread messages' : 'No new messages' }}
                        </span>
                    </div>
                    @if (msgService.totalUnread() > 0) {
                        <span class="flex items-center justify-center bg-primary text-white border-circle text-xs font-bold" style="width: 1.5rem; height: 1.5rem">
                            {{ msgService.totalUnread() }}
                        </span>
                    }
                </div>
            </a>

            <!-- AI Advisor -->
            <a routerLink="/app/ai-advisor" class="no-underline">
                <div class="flex items-center gap-3 p-3 surface-ground border-round hover:surface-hover transition-colors cursor-pointer">
                    <div class="flex items-center justify-center bg-purple-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-sparkles text-purple-500"></i>
                    </div>
                    <div class="flex-1">
                        <span class="font-medium text-sm block text-surface-900 dark:text-surface-0">AI Advisor</span>
                        <span class="text-xs text-muted-color">Get personalized financial advice</span>
                    </div>
                    <i class="pi pi-chevron-right text-muted-color text-sm"></i>
                </div>
            </a>

            <!-- Insurance -->
            <a routerLink="/app/insurance/products" class="no-underline">
                <div class="flex items-center gap-3 p-3 surface-ground border-round hover:surface-hover transition-colors cursor-pointer">
                    <div class="flex items-center justify-center bg-green-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shield text-green-500"></i>
                    </div>
                    <div class="flex-1">
                        <span class="font-medium text-sm block text-surface-900 dark:text-surface-0">Insurance</span>
                        <span class="text-xs text-muted-color">
                            {{ insuranceService.products().length }} products available
                        </span>
                    </div>
                    <i class="pi pi-chevron-right text-muted-color text-sm"></i>
                </div>
            </a>

            <!-- Compare Products -->
            <a routerLink="/app/bank/products" class="no-underline">
                <div class="flex items-center gap-3 p-3 surface-ground border-round hover:surface-hover transition-colors cursor-pointer">
                    <div class="flex items-center justify-center bg-orange-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-arrows-h text-orange-500"></i>
                    </div>
                    <div class="flex-1">
                        <span class="font-medium text-sm block text-surface-900 dark:text-surface-0">Compare Products</span>
                        <span class="text-xs text-muted-color">Banks, Insurance, Mutual Funds</span>
                    </div>
                    <i class="pi pi-chevron-right text-muted-color text-sm"></i>
                </div>
            </a>
        </div>
    </div>`
})
export class QuickAccessWidget {
    msgService = inject(MessageService);
    insuranceService = inject(InsuranceService);
}
