import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InvestmentService } from '../services/investment.service';

@Component({
    selector: 'fx-investment-compare',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">Compare Campaigns</h4>
                <div class="flex gap-2">
                    <p-button label="Clear All" icon="pi pi-trash" severity="danger" [outlined]="true" (onClick)="investmentService.clearCompare()" [disabled]="investmentService.compareList().length === 0" />
                    <p-button label="Back to Campaigns" icon="pi pi-arrow-left" severity="secondary" [routerLink]="['/investment/campaigns']" />
                </div>
            </div>

            <div *ngIf="investmentService.compareList().length < 2" class="text-center p-6">
                <i class="pi pi-info-circle text-4xl text-muted-color mb-3 block"></i>
                <p class="text-lg text-muted-color">Select at least 2 campaigns to compare.</p>
                <p-button label="Browse Campaigns" icon="pi pi-search" [routerLink]="['/investment/campaigns']" severity="secondary" />
            </div>

            <div *ngIf="investmentService.compareList().length >= 2" class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="p-3 text-left surface-ground font-bold" style="min-width: 140px">Metric</th>
                            <th *ngFor="let c of investmentService.compareList()" class="p-3 text-center surface-ground" style="min-width: 200px">
                                <div class="flex flex-col items-center gap-2">
                                    <p-tag [value]="c.platformName" severity="info" />
                                    <span class="font-bold">{{ c.name }}</span>
                                    <p-tag [value]="c.status" [severity]="getStatusSeverity(c.status)" />
                                    <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="investmentService.removeFromCompare(c.id)" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Budget</td>
                            <td *ngFor="let c of investmentService.compareList()" class="p-3 text-center font-semibold">
                                {{ c.budget | currency: 'BDT' : 'symbol' : '1.0-0' }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Spent</td>
                            <td *ngFor="let c of investmentService.compareList()" class="p-3 text-center text-orange-500 font-semibold">
                                {{ c.spent | currency: 'BDT' : 'symbol' : '1.0-0' }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Revenue</td>
                            <td *ngFor="let c of investmentService.compareList()" class="p-3 text-center font-bold">
                                <span [class.text-green-500]="isBestRevenue(c)">{{ c.revenue | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                                <span *ngIf="isBestRevenue(c)" class="block text-xs text-green-500"><i class="pi pi-star-fill"></i> Best</span>
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">ROAS</td>
                            <td *ngFor="let c of investmentService.compareList()" class="p-3 text-center">
                                <span class="text-xl font-bold" [class.text-green-500]="isBestROAS(c)">{{ c.roas }}x</span>
                                <span *ngIf="isBestROAS(c)" class="block text-xs text-green-500"><i class="pi pi-star-fill"></i> Best</span>
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">CPC</td>
                            <td *ngFor="let c of investmentService.compareList()" class="p-3 text-center">
                                <span [class.text-green-500]="isLowestCPC(c)">৳{{ c.cpc }}</span>
                                <span *ngIf="isLowestCPC(c)" class="block text-xs text-green-500"><i class="pi pi-star-fill"></i> Lowest</span>
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">CTR</td>
                            <td *ngFor="let c of investmentService.compareList()" class="p-3 text-center">
                                <span [class.text-green-500]="isBestCTR(c)">{{ c.ctr }}%</span>
                                <span *ngIf="isBestCTR(c)" class="block text-xs text-green-500"><i class="pi pi-star-fill"></i> Best</span>
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Impressions</td>
                            <td *ngFor="let c of investmentService.compareList()" class="p-3 text-center font-semibold">
                                {{ c.impressions | number }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Clicks</td>
                            <td *ngFor="let c of investmentService.compareList()" class="p-3 text-center font-semibold">
                                {{ c.clicks | number }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Conversions</td>
                            <td *ngFor="let c of investmentService.compareList()" class="p-3 text-center">
                                <span class="font-bold" [class.text-green-500]="isBestConversions(c)">{{ c.conversions | number }}</span>
                                <span *ngIf="isBestConversions(c)" class="block text-xs text-green-500"><i class="pi pi-star-fill"></i> Best</span>
                            </td>
                        </tr>
                        <tr>
                            <td class="p-3 font-semibold">Period</td>
                            <td *ngFor="let c of investmentService.compareList()" class="p-3 text-center text-sm">
                                {{ c.startDate }} → {{ c.endDate }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
})
export class InvestmentCompareComponent {
    public investmentService = inject(InvestmentService);

    getStatusSeverity(status: string): 'success' | 'warn' | 'info' | 'secondary' {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'PAUSED': return 'warn';
            case 'COMPLETED': return 'info';
            default: return 'secondary';
        }
    }

    isBestROAS(c: any): boolean {
        return c.roas === Math.max(...this.investmentService.compareList().map(x => x.roas));
    }

    isBestRevenue(c: any): boolean {
        return c.revenue === Math.max(...this.investmentService.compareList().map(x => x.revenue));
    }

    isLowestCPC(c: any): boolean {
        return c.cpc === Math.min(...this.investmentService.compareList().map(x => x.cpc));
    }

    isBestCTR(c: any): boolean {
        return c.ctr === Math.max(...this.investmentService.compareList().map(x => x.ctr));
    }

    isBestConversions(c: any): boolean {
        return c.conversions === Math.max(...this.investmentService.compareList().map(x => x.conversions));
    }
}
