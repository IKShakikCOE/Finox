import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { InvestmentService } from '../services/investment.service';
import { Campaign, CampaignStatus } from '../models/investment.model';

@Component({
    selector: 'fx-investment-campaigns',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, TagModule, MultiSelectModule, RadioButtonModule, BadgeModule, TooltipModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">All Campaigns</h4>
                <p-button
                    [routerLink]="['/investment/compare']"
                    label="Compare"
                    icon="pi pi-arrows-h"
                    [badge]="investmentService.compareList().length.toString()"
                    badgeSeverity="danger"
                    severity="secondary"
                    [disabled]="investmentService.compareList().length < 2"
                />
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap items-center gap-4 mb-6 p-4 surface-ground border-round">
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="statusAll" name="statusFilter" value="ALL" [(ngModel)]="statusFilter" (onClick)="onStatusChange()" />
                    <label for="statusAll" class="font-semibold">All</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="statusActive" name="statusFilter" value="ACTIVE" [(ngModel)]="statusFilter" (onClick)="onStatusChange()" />
                    <label for="statusActive" class="font-semibold text-green-500">Active</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="statusPaused" name="statusFilter" value="PAUSED" [(ngModel)]="statusFilter" (onClick)="onStatusChange()" />
                    <label for="statusPaused" class="font-semibold text-orange-500">Paused</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="statusCompleted" name="statusFilter" value="COMPLETED" [(ngModel)]="statusFilter" (onClick)="onStatusChange()" />
                    <label for="statusCompleted" class="font-semibold text-blue-500">Completed</label>
                </div>

                <div class="ml-auto" style="min-width: 250px">
                    <p-multiselect
                        [options]="investmentService.platforms()"
                        [(ngModel)]="selectedPlatforms"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Filter by Platform"
                        [maxSelectedLabels]="2"
                        (onChange)="onPlatformFilterChange()"
                        [style]="{ width: '100%' }"
                    />
                </div>
            </div>

            <!-- Campaign Cards -->
            <div class="grid grid-cols-12 gap-4">
                <div *ngFor="let campaign of investmentService.filteredCampaigns()" class="col-span-12 md:col-span-6 lg:col-span-4">
                    <div class="border surface-border border-round p-4 h-full flex flex-col">
                        <div class="flex items-center justify-between mb-3">
                            <p-tag [value]="campaign.platformName" severity="info" />
                            <p-tag [value]="campaign.status" [severity]="getStatusSeverity(campaign.status)" />
                        </div>

                        <h5 class="mt-0 mb-2">{{ campaign.name }}</h5>
                        <span class="text-sm text-muted-color mb-3 block">{{ campaign.type }} | {{ campaign.startDate }} → {{ campaign.endDate }}</span>

                        <div class="grid grid-cols-12 gap-2 mb-3">
                            <div class="col-span-4 text-center p-2 surface-ground border-round">
                                <span class="block text-muted-color text-xs">Budget</span>
                                <span class="font-bold text-sm">{{ campaign.budget | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                            </div>
                            <div class="col-span-4 text-center p-2 surface-ground border-round">
                                <span class="block text-muted-color text-xs">Spent</span>
                                <span class="font-bold text-sm text-orange-500">{{ campaign.spent | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                            </div>
                            <div class="col-span-4 text-center p-2 surface-ground border-round">
                                <span class="block text-muted-color text-xs">Revenue</span>
                                <span class="font-bold text-sm text-green-500">{{ campaign.revenue | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-3 mb-3 text-sm">
                            <div>
                                <span class="text-muted-color">ROAS: </span>
                                <span class="font-bold" [class.text-green-500]="campaign.roas >= 5" [class.text-orange-500]="campaign.roas < 5">{{ campaign.roas }}x</span>
                            </div>
                            <div>
                                <span class="text-muted-color">CPC: </span>
                                <span class="font-semibold">৳{{ campaign.cpc }}</span>
                            </div>
                            <div>
                                <span class="text-muted-color">CTR: </span>
                                <span class="font-semibold">{{ campaign.ctr }}%</span>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-3 mb-3 text-sm">
                            <div>
                                <span class="text-muted-color">Impressions: </span>
                                <span class="font-semibold">{{ campaign.impressions | number }}</span>
                            </div>
                            <div>
                                <span class="text-muted-color">Clicks: </span>
                                <span class="font-semibold">{{ campaign.clicks | number }}</span>
                            </div>
                            <div>
                                <span class="text-muted-color">Conversions: </span>
                                <span class="font-semibold">{{ campaign.conversions | number }}</span>
                            </div>
                        </div>

                        <!-- Budget utilization bar -->
                        <div class="mb-3">
                            <div class="flex justify-between text-xs text-muted-color mb-1">
                                <span>Budget Used</span>
                                <span>{{ getBudgetPercent(campaign) }}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="h-2 rounded-full" [style.width.%]="getBudgetPercent(campaign)" [class.bg-green-500]="getBudgetPercent(campaign) < 80" [class.bg-orange-500]="getBudgetPercent(campaign) >= 80 && getBudgetPercent(campaign) < 100" [class.bg-red-500]="getBudgetPercent(campaign) >= 100"></div>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 mt-auto">
                            <p-button
                                *ngIf="!investmentService.isInCompare(campaign.id)"
                                label="Compare"
                                icon="pi pi-plus"
                                severity="secondary"
                                [outlined]="true"
                                size="small"
                                (onClick)="addToCompare(campaign)"
                                [disabled]="investmentService.compareList().length >= 4"
                            />
                            <p-button
                                *ngIf="investmentService.isInCompare(campaign.id)"
                                label="Remove"
                                icon="pi pi-times"
                                severity="danger"
                                [outlined]="true"
                                size="small"
                                (onClick)="removeFromCompare(campaign.id)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div *ngIf="investmentService.filteredCampaigns().length === 0" class="text-center p-6 text-muted-color">
                <i class="pi pi-search text-4xl mb-3 block"></i>
                <p class="text-lg">No campaigns found for the selected filters.</p>
            </div>
        </div>
    `
})
export class InvestmentCampaignsComponent implements OnInit {
    public investmentService = inject(InvestmentService);

    statusFilter: CampaignStatus = 'ALL';
    selectedPlatforms: string[] = [];

    ngOnInit() {
        if (!this.investmentService.campaigns().length) {
            this.investmentService.loadData();
        }
    }

    onStatusChange() {
        this.investmentService.selectedStatus.set(this.statusFilter);
    }

    onPlatformFilterChange() {
        this.investmentService.selectedPlatformIds.set(this.selectedPlatforms);
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'PAUSED': return 'warn';
            case 'COMPLETED': return 'info';
            default: return 'secondary';
        }
    }

    getBudgetPercent(campaign: Campaign): number {
        return Math.round((campaign.spent / campaign.budget) * 100);
    }

    addToCompare(campaign: Campaign) {
        this.investmentService.addToCompare(campaign);
    }

    removeFromCompare(campaignId: string) {
        this.investmentService.removeFromCompare(campaignId);
    }
}
