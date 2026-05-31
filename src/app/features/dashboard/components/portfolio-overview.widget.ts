import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MutualFundService } from '../../mutual-funds/services/mutual-fund.service';
import { BankService } from '../../bank/services/bank.service';

@Component({
    standalone: true,
    selector: 'fx-portfolio-overview-widget',
    imports: [CommonModule, RouterModule, ButtonModule, TagModule],
    template: `
    <div class="card">
        <div class="flex items-center justify-between mb-4">
            <div class="font-semibold text-xl">Portfolio Overview</div>
            <p-button label="Explore" icon="pi pi-arrow-right" [text]="true"
                severity="secondary" size="small" routerLink="/app/mutual-funds/funds" />
        </div>

        @if (mfService.funds().length === 0 && bankService.products().length === 0) {
            <div class="text-center p-4 text-muted-color">
                <i class="pi pi-chart-line text-2xl mb-2 block"></i>
                <p class="text-sm m-0">Explore funds & bank products to build your portfolio.</p>
            </div>
        } @else {
            <!-- Fund categories summary -->
            <div class="grid grid-cols-12 gap-3 mb-4">
                <div class="col-span-4 p-3 surface-ground border-round text-center">
                    <span class="block text-xs text-muted-color mb-1">Growth</span>
                    <span class="font-bold text-red-500">{{ getCountByCategory('GROWTH') }}</span>
                </div>
                <div class="col-span-4 p-3 surface-ground border-round text-center">
                    <span class="block text-xs text-muted-color mb-1">Balanced</span>
                    <span class="font-bold text-blue-500">{{ getCountByCategory('BALANCED') }}</span>
                </div>
                <div class="col-span-4 p-3 surface-ground border-round text-center">
                    <span class="block text-xs text-muted-color mb-1">Fixed Income</span>
                    <span class="font-bold text-green-500">{{ getCountByCategory('FIXED_INCOME') }}</span>
                </div>
            </div>

            <!-- Top performing funds -->
            <span class="block text-sm font-medium text-muted-color mb-2">Top Performing Funds</span>
            <div class="flex flex-col gap-2">
                @for (fund of topFunds(); track fund.id) {
                    <div class="flex items-center justify-between p-2 surface-ground border-round">
                        <div class="min-w-0 flex-1">
                            <span class="text-sm font-medium block truncate">{{ fund.name }}</span>
                            <span class="text-xs text-muted-color">{{ fund.amcName }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-sm text-green-500">{{ fund.returnRate1Y }}%</span>
                            <p-tag [value]="fund.riskLevel" [severity]="getRiskSeverity(fund.riskLevel)" />
                        </div>
                    </div>
                }
            </div>

            <!-- Bank products highlight -->
            @if (bankService.products().length > 0) {
                <div class="mt-4 p-3 surface-ground border-round">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-muted-color">Best FDR Rate</span>
                        <span class="font-bold text-primary">{{ getBestFDRRate() }}%</span>
                    </div>
                </div>
            }
        }
    </div>`
})
export class PortfolioOverviewWidget implements OnInit {
    mfService = inject(MutualFundService);
    bankService = inject(BankService);

    ngOnInit() {
        if (!this.mfService.funds().length) this.mfService.loadData();
        if (!this.bankService.products().length) this.bankService.loadBankData();
    }

    getCountByCategory(category: string): number {
        return this.mfService.funds().filter(f => f.category === category).length;
    }

    topFunds() {
        return [...this.mfService.funds()]
            .sort((a, b) => b.returnRate1Y - a.returnRate1Y)
            .slice(0, 3);
    }

    getBestFDRRate(): number {
        const fdrs = this.bankService.products().filter(p => p.category === 'FDR');
        if (fdrs.length === 0) return 0;
        return Math.max(...fdrs.map(f => f.interestRate));
    }

    getRiskSeverity(risk: string): 'success' | 'warn' | 'danger' | 'secondary' {
        switch (risk) {
            case 'LOW': return 'success';
            case 'MODERATE': return 'warn';
            case 'HIGH': return 'danger';
            default: return 'secondary';
        }
    }
}
