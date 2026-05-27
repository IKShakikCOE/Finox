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
import { MutualFundService } from '../services/mutual-fund.service';
import { MutualFund, FundCategory, RiskLevel } from '../models/mutual-fund.model';

@Component({
    selector: 'fx-mutual-funds-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, TagModule, MultiSelectModule, RadioButtonModule, BadgeModule, TooltipModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">Mutual Funds - Bangladesh</h4>
                <p-button
                    [routerLink]="['/mutual-funds/compare']"
                    label="Compare"
                    icon="pi pi-arrows-h"
                    [badge]="mfService.compareList().length.toString()"
                    badgeSeverity="danger"
                    severity="secondary"
                    [disabled]="mfService.compareList().length < 2"
                />
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap items-center gap-4 mb-4 p-4 surface-ground border-round">
                <span class="font-semibold text-sm text-muted-color">Category:</span>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="mfAll" name="mfCategory" value="ALL" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="mfAll" class="font-semibold">All</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="mfGrowth" name="mfCategory" value="GROWTH" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="mfGrowth" class="font-semibold text-red-500">Growth</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="mfBalanced" name="mfCategory" value="BALANCED" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="mfBalanced" class="font-semibold text-blue-500">Balanced</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="mfFixed" name="mfCategory" value="FIXED_INCOME" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="mfFixed" class="font-semibold text-green-500">Fixed Income</label>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-4 mb-6 p-4 surface-ground border-round">
                <span class="font-semibold text-sm text-muted-color">Risk:</span>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="riskAll" name="riskLevel" value="ALL" [(ngModel)]="riskFilter" (onClick)="onRiskChange()" />
                    <label for="riskAll" class="font-semibold">All</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="riskLow" name="riskLevel" value="LOW" [(ngModel)]="riskFilter" (onClick)="onRiskChange()" />
                    <label for="riskLow" class="font-semibold text-green-500">Low</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="riskMod" name="riskLevel" value="MODERATE" [(ngModel)]="riskFilter" (onClick)="onRiskChange()" />
                    <label for="riskMod" class="font-semibold text-orange-500">Moderate</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="riskHigh" name="riskLevel" value="HIGH" [(ngModel)]="riskFilter" (onClick)="onRiskChange()" />
                    <label for="riskHigh" class="font-semibold text-red-500">High</label>
                </div>

                <div class="ml-auto" style="min-width: 250px">
                    <p-multiselect
                        [options]="mfService.amcs()"
                        [(ngModel)]="selectedAmcs"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Filter by AMC"
                        [maxSelectedLabels]="2"
                        (onChange)="onAmcFilterChange()"
                        [style]="{ width: '100%' }"
                    />
                </div>
            </div>

            <!-- Fund Cards -->
            <div class="grid grid-cols-12 gap-4">
                <div *ngFor="let fund of mfService.filteredFunds()" class="col-span-12 md:col-span-6 lg:col-span-4">
                    <div class="border surface-border border-round p-4 h-full flex flex-col">
                        <div class="flex items-center justify-between mb-3">
                            <p-tag [value]="fund.category.replace('_', ' ')" [severity]="getCategorySeverity(fund.category)" />
                            <p-tag [value]="fund.riskLevel" [severity]="getRiskSeverity(fund.riskLevel)" />
                        </div>

                        <h5 class="mt-0 mb-1">{{ fund.name }}</h5>
                        <span class="text-muted-color text-sm mb-3 block">{{ fund.amcName }}</span>

                        <div class="grid grid-cols-12 gap-2 mb-3">
                            <div class="col-span-4 text-center p-2 surface-ground border-round">
                                <span class="block text-muted-color text-xs">1Y Return</span>
                                <span class="font-bold text-green-500">{{ fund.returnRate1Y }}%</span>
                            </div>
                            <div class="col-span-4 text-center p-2 surface-ground border-round">
                                <span class="block text-muted-color text-xs">3Y Return</span>
                                <span class="font-bold text-blue-500">{{ fund.returnRate3Y }}%</span>
                            </div>
                            <div class="col-span-4 text-center p-2 surface-ground border-round">
                                <span class="block text-muted-color text-xs">5Y Return</span>
                                <span class="font-bold text-purple-500">{{ fund.returnRate5Y }}%</span>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-4 mb-3 text-sm">
                            <div>
                                <span class="text-muted-color">NAV: </span>
                                <span class="font-semibold">৳{{ fund.nav }}</span>
                            </div>
                            <div>
                                <span class="text-muted-color">Min: </span>
                                <span class="font-semibold">{{ fund.minInvestment | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                            </div>
                            <div>
                                <span class="text-muted-color">Expense: </span>
                                <span class="font-semibold">{{ fund.expenseRatio }}%</span>
                            </div>
                            <div>
                                <span class="text-muted-color">Size: </span>
                                <span class="font-semibold">{{ fund.fundSize }}</span>
                            </div>
                        </div>

                        <p class="text-sm text-muted-color mb-3 flex-1">{{ fund.objective }}</p>

                        <ul class="list-none p-0 m-0 mb-3">
                            <li *ngFor="let feature of fund.features" class="flex items-center gap-2 mb-1">
                                <i class="pi pi-check-circle text-green-500 text-xs"></i>
                                <span class="text-sm">{{ feature }}</span>
                            </li>
                        </ul>

                        <div class="flex items-center gap-2 mt-auto">
                            <p-button
                                *ngIf="!mfService.isInCompare(fund.id)"
                                label="Add to Compare"
                                icon="pi pi-plus"
                                severity="secondary"
                                [outlined]="true"
                                size="small"
                                (onClick)="addToCompare(fund)"
                                [disabled]="mfService.compareList().length >= 4"
                            />
                            <p-button
                                *ngIf="mfService.isInCompare(fund.id)"
                                label="Remove"
                                icon="pi pi-times"
                                severity="danger"
                                [outlined]="true"
                                size="small"
                                (onClick)="removeFromCompare(fund.id)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div *ngIf="mfService.filteredFunds().length === 0" class="text-center p-6 text-muted-color">
                <i class="pi pi-search text-4xl mb-3 block"></i>
                <p class="text-lg">No funds found for the selected filters.</p>
            </div>
        </div>
    `
})
export class MutualFundsListComponent implements OnInit {
    public mfService = inject(MutualFundService);

    categoryFilter: FundCategory = 'ALL';
    riskFilter: RiskLevel = 'ALL';
    selectedAmcs: string[] = [];

    ngOnInit() {
        if (!this.mfService.amcs().length) {
            this.mfService.loadData();
        }
    }

    onCategoryChange() {
        this.mfService.selectedCategory.set(this.categoryFilter);
    }

    onRiskChange() {
        this.mfService.selectedRisk.set(this.riskFilter);
    }

    onAmcFilterChange() {
        this.mfService.selectedAmcIds.set(this.selectedAmcs);
    }

    getCategorySeverity(category: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (category) {
            case 'GROWTH': return 'danger';
            case 'BALANCED': return 'info';
            case 'FIXED_INCOME': return 'success';
            default: return 'info';
        }
    }

    getRiskSeverity(risk: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (risk) {
            case 'LOW': return 'success';
            case 'MODERATE': return 'warn';
            case 'HIGH': return 'danger';
            default: return 'info';
        }
    }

    addToCompare(fund: MutualFund) {
        this.mfService.addToCompare(fund);
    }

    removeFromCompare(fundId: string) {
        this.mfService.removeFromCompare(fundId);
    }
}
