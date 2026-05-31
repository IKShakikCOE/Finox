import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InvestmentService } from '../../investment/services/investment.service';

@Component({
    standalone: true,
    selector: 'fx-investment-summary-widget',
    imports: [CommonModule, RouterModule, ButtonModule, TagModule],
    template: `
    <div class="card">
        <div class="flex items-center justify-between mb-4">
            <div class="font-semibold text-xl">Investment Performance</div>
            <p-button label="Details" icon="pi pi-arrow-right" [text]="true"
                severity="secondary" size="small" routerLink="/app/investment" />
        </div>

        @if (investmentService.campaigns().length === 0) {
            <div class="text-center p-4 text-muted-color">
                <i class="pi pi-chart-line text-2xl mb-2 block"></i>
                <p class="text-sm m-0">No campaigns yet.</p>
            </div>
        } @else {
            <!-- Summary metrics -->
            <div class="grid grid-cols-12 gap-3 mb-4">
                <div class="col-span-6 p-3 surface-ground border-round text-center">
                    <span class="block text-xs text-muted-color mb-1">Total Spent</span>
                    <span class="font-bold text-orange-500">
                        ৳{{ investmentService.totalSpent() | number:'1.0-0' }}
                    </span>
                </div>
                <div class="col-span-6 p-3 surface-ground border-round text-center">
                    <span class="block text-xs text-muted-color mb-1">Revenue</span>
                    <span class="font-bold text-green-500">
                        ৳{{ investmentService.totalRevenue() | number:'1.0-0' }}
                    </span>
                </div>
            </div>

            <!-- ROAS highlight -->
            <div class="flex items-center justify-center p-3 mb-4 border-round"
                [class.bg-green-50]="investmentService.overallROAS() >= 3"
                [class.bg-orange-50]="investmentService.overallROAS() < 3">
                <div class="text-center">
                    <span class="block text-xs text-muted-color">Overall ROAS</span>
                    <span class="text-2xl font-bold"
                        [class.text-green-600]="investmentService.overallROAS() >= 3"
                        [class.text-orange-600]="investmentService.overallROAS() < 3"
                    >{{ investmentService.overallROAS() }}x</span>
                </div>
            </div>

            <!-- Top 3 campaigns -->
            <span class="block text-sm font-medium text-muted-color mb-2">Top Campaigns</span>
            <div class="flex flex-col gap-2">
                @for (campaign of topCampaigns(); track campaign.id) {
                    <div class="flex items-center justify-between p-2 border-round surface-ground">
                        <div class="min-w-0">
                            <span class="text-sm font-medium block truncate">{{ campaign.name }}</span>
                            <span class="text-xs text-muted-color">{{ campaign.platformName }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-sm text-green-500">{{ campaign.roas }}x</span>
                            <p-tag [value]="campaign.status" [severity]="getStatusSeverity(campaign.status)" />
                        </div>
                    </div>
                }
            </div>
        }
    </div>`
})
export class InvestmentSummaryWidget implements OnInit {
    investmentService = inject(InvestmentService);

    ngOnInit() {
        if (!this.investmentService.campaigns().length) {
            this.investmentService.loadData();
        }
    }

    topCampaigns() {
        return [...this.investmentService.campaigns()]
            .sort((a, b) => b.roas - a.roas)
            .slice(0, 3);
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'info' | 'secondary' {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'PAUSED': return 'warn';
            case 'COMPLETED': return 'info';
            default: return 'secondary';
        }
    }
}
