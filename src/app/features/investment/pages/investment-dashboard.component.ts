import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InvestmentService } from '../services/investment.service';

@Component({
    selector: 'fx-investment-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule],
    template: `
        <div class="flex items-center justify-between mb-6">
            <h4 class="m-0">Investment Overview</h4>
            <p-button label="View All Campaigns" icon="pi pi-list" severity="secondary" [routerLink]="['/investment/campaigns']" />
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-12 gap-4 mb-6">
            <div class="col-span-12 md:col-span-3">
                <div class="card p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="block text-muted-color font-medium mb-2">Total Budget</span>
                            <div class="text-2xl font-bold">{{ investmentService.totalBudget() | currency: 'BDT' : 'symbol' : '1.0-0' }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-100 rounded-full" style="width: 3rem; height: 3rem">
                            <i class="pi pi-wallet text-blue-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-3">
                <div class="card p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="block text-muted-color font-medium mb-2">Total Spent</span>
                            <div class="text-2xl font-bold text-orange-500">{{ investmentService.totalSpent() | currency: 'BDT' : 'symbol' : '1.0-0' }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-orange-100 rounded-full" style="width: 3rem; height: 3rem">
                            <i class="pi pi-money-bill text-orange-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-3">
                <div class="card p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="block text-muted-color font-medium mb-2">Total Revenue</span>
                            <div class="text-2xl font-bold text-green-500">{{ investmentService.totalRevenue() | currency: 'BDT' : 'symbol' : '1.0-0' }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-green-100 rounded-full" style="width: 3rem; height: 3rem">
                            <i class="pi pi-chart-line text-green-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-3">
                <div class="card p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="block text-muted-color font-medium mb-2">Overall ROAS</span>
                            <div class="text-2xl font-bold text-purple-500">{{ investmentService.overallROAS() }}x</div>
                        </div>
                        <div class="flex items-center justify-center bg-purple-100 rounded-full" style="width: 3rem; height: 3rem">
                            <i class="pi pi-percentage text-purple-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Platform Breakdown -->
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 lg:col-span-7">
                <div class="card">
                    <h5 class="mb-4">Platform-wise Performance</h5>
                    <div class="flex flex-col gap-3">
                        <div *ngFor="let item of investmentService.platformBreakdown()" class="flex items-center justify-between p-3 border-round surface-border border">
                            <div class="flex items-center gap-3">
                                <span class="font-semibold">{{ item.platform }}</span>
                            </div>
                            <div class="flex items-center gap-4 text-sm">
                                <div class="text-center">
                                    <span class="block text-muted-color">Spent</span>
                                    <span class="font-semibold text-orange-500">{{ item.spent | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                                </div>
                                <div class="text-center">
                                    <span class="block text-muted-color">Revenue</span>
                                    <span class="font-semibold text-green-500">{{ item.revenue | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                                </div>
                                <div class="text-center">
                                    <span class="block text-muted-color">ROAS</span>
                                    <span class="font-bold" [class.text-green-500]="item.roas >= 5" [class.text-orange-500]="item.roas < 5 && item.roas >= 3" [class.text-red-500]="item.roas < 3">
                                        {{ item.roas }}x
                                    </span>
                                </div>
                                <div class="text-center">
                                    <span class="block text-muted-color">Conv.</span>
                                    <span class="font-semibold">{{ item.conversions | number }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-5">
                <div class="card">
                    <h5 class="mb-4">Top Campaigns by ROAS</h5>
                    <div class="flex flex-col gap-3">
                        <div *ngFor="let campaign of topCampaigns()" class="flex items-center justify-between p-3 border-round surface-border border">
                            <div>
                                <span class="font-medium block">{{ campaign.name }}</span>
                                <span class="text-sm text-muted-color">{{ campaign.platformName }}</span>
                            </div>
                            <div class="text-right">
                                <span class="font-bold text-lg text-green-500 block">{{ campaign.roas }}x</span>
                                <p-tag [value]="campaign.status" [severity]="getStatusSeverity(campaign.status)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class InvestmentDashboardComponent implements OnInit {
    public investmentService = inject(InvestmentService);

    ngOnInit() {
        if (!this.investmentService.campaigns().length) {
            this.investmentService.loadData();
        }
    }

    topCampaigns() {
        return [...this.investmentService.campaigns()]
            .sort((a, b) => b.roas - a.roas)
            .slice(0, 5);
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'PAUSED': return 'warn';
            case 'COMPLETED': return 'info';
            default: return 'secondary';
        }
    }
}
