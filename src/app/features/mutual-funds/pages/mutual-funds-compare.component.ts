import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MutualFundService } from '../services/mutual-fund.service';

@Component({
    selector: 'fx-mutual-funds-compare',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">Compare Mutual Funds</h4>
                <div class="flex gap-2">
                    <p-button label="Clear All" icon="pi pi-trash" severity="danger" [outlined]="true" (onClick)="mfService.clearCompare()" [disabled]="mfService.compareList().length === 0" />
                    <p-button label="Back to Funds" icon="pi pi-arrow-left" severity="secondary" [routerLink]="['/mutual-funds']" />
                </div>
            </div>

            <div *ngIf="mfService.compareList().length < 2" class="text-center p-6">
                <i class="pi pi-info-circle text-4xl text-muted-color mb-3 block"></i>
                <p class="text-lg text-muted-color">Select at least 2 funds to compare.</p>
                <p-button label="Browse Funds" icon="pi pi-search" [routerLink]="['/mutual-funds']" severity="secondary" />
            </div>

            <div *ngIf="mfService.compareList().length >= 2" class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="p-3 text-left surface-ground font-bold" style="min-width: 150px">Metric</th>
                            <th *ngFor="let fund of mfService.compareList()" class="p-3 text-center surface-ground" style="min-width: 200px">
                                <div class="flex flex-col items-center gap-2">
                                    <div class="flex gap-2">
                                        <p-tag [value]="fund.category.replace('_', ' ')" [severity]="getCategorySeverity(fund.category)" />
                                        <p-tag [value]="fund.riskLevel" [severity]="getRiskSeverity(fund.riskLevel)" />
                                    </div>
                                    <span class="font-bold">{{ fund.name }}</span>
                                    <span class="text-sm text-muted-color">{{ fund.amcName }}</span>
                                    <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="mfService.removeFromCompare(fund.id)" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">NAV</td>
                            <td *ngFor="let fund of mfService.compareList()" class="p-3 text-center font-bold">
                                ৳{{ fund.nav }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">1 Year Return</td>
                            <td *ngFor="let fund of mfService.compareList()" class="p-3 text-center">
                                <span class="font-bold text-lg" [class.text-green-500]="isBest1Y(fund)">{{ fund.returnRate1Y }}%</span>
                                <span *ngIf="isBest1Y(fund)" class="block text-xs text-green-500 font-semibold"><i class="pi pi-star-fill"></i> Best</span>
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">3 Year Return</td>
                            <td *ngFor="let fund of mfService.compareList()" class="p-3 text-center">
                                <span class="font-bold text-lg" [class.text-green-500]="isBest3Y(fund)">{{ fund.returnRate3Y }}%</span>
                                <span *ngIf="isBest3Y(fund)" class="block text-xs text-green-500 font-semibold"><i class="pi pi-star-fill"></i> Best</span>
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">5 Year Return</td>
                            <td *ngFor="let fund of mfService.compareList()" class="p-3 text-center">
                                <span class="font-bold text-lg" [class.text-green-500]="isBest5Y(fund)">{{ fund.returnRate5Y }}%</span>
                                <span *ngIf="isBest5Y(fund)" class="block text-xs text-green-500 font-semibold"><i class="pi pi-star-fill"></i> Best</span>
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Expense Ratio</td>
                            <td *ngFor="let fund of mfService.compareList()" class="p-3 text-center">
                                <span [class.text-green-500]="isLowestExpense(fund)">{{ fund.expenseRatio }}%</span>
                                <span *ngIf="isLowestExpense(fund)" class="block text-xs text-green-500 font-semibold"><i class="pi pi-star-fill"></i> Lowest</span>
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Min Investment</td>
                            <td *ngFor="let fund of mfService.compareList()" class="p-3 text-center font-semibold">
                                {{ fund.minInvestment | currency: 'BDT' : 'symbol' : '1.0-0' }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Fund Size</td>
                            <td *ngFor="let fund of mfService.compareList()" class="p-3 text-center">
                                {{ fund.fundSize }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Objective</td>
                            <td *ngFor="let fund of mfService.compareList()" class="p-3 text-center text-sm">
                                {{ fund.objective }}
                            </td>
                        </tr>
                        <tr>
                            <td class="p-3 font-semibold align-top">Features</td>
                            <td *ngFor="let fund of mfService.compareList()" class="p-3">
                                <ul class="list-none p-0 m-0">
                                    <li *ngFor="let feature of fund.features" class="flex items-center gap-2 mb-2">
                                        <i class="pi pi-check-circle text-green-500 text-sm"></i>
                                        <span class="text-sm">{{ feature }}</span>
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
})
export class MutualFundsCompareComponent {
    public mfService = inject(MutualFundService);

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

    isBest1Y(fund: any): boolean {
        const rates = this.mfService.compareList().map(f => f.returnRate1Y);
        return fund.returnRate1Y === Math.max(...rates);
    }

    isBest3Y(fund: any): boolean {
        const rates = this.mfService.compareList().map(f => f.returnRate3Y);
        return fund.returnRate3Y === Math.max(...rates);
    }

    isBest5Y(fund: any): boolean {
        const rates = this.mfService.compareList().map(f => f.returnRate5Y);
        return fund.returnRate5Y === Math.max(...rates);
    }

    isLowestExpense(fund: any): boolean {
        const ratios = this.mfService.compareList().map(f => f.expenseRatio);
        return fund.expenseRatio === Math.min(...ratios);
    }
}
