import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AMC, MutualFund, MutualFundDataResponse, FundCategory, RiskLevel } from '../models/mutual-fund.model';

@Injectable({ providedIn: 'root' })
export class MutualFundService {
    private http = inject(HttpClient);

    amcs = signal<AMC[]>([]);
    funds = signal<MutualFund[]>([]);
    selectedCategory = signal<FundCategory>('ALL');
    selectedRisk = signal<RiskLevel>('ALL');
    selectedAmcIds = signal<string[]>([]);
    compareList = signal<MutualFund[]>([]);

    filteredFunds = computed(() => {
        let result = this.funds();
        const category = this.selectedCategory();
        const risk = this.selectedRisk();
        const amcIds = this.selectedAmcIds();

        if (category !== 'ALL') {
            result = result.filter(f => f.category === category);
        }
        if (risk !== 'ALL') {
            result = result.filter(f => f.riskLevel === risk);
        }
        if (amcIds.length > 0) {
            result = result.filter(f => amcIds.includes(f.amcId));
        }
        return result;
    });

    async loadData(): Promise<void> {
        try {
            const data = await firstValueFrom(
                this.http.get<MutualFundDataResponse>('demo/mutual-funds.json')
            );
            this.amcs.set(data.amcs);
            this.funds.set(data.funds);
        } catch (error) {
            console.error('Failed to load mutual fund data', error);
        }
    }

    addToCompare(fund: MutualFund) {
        const current = this.compareList();
        if (current.length >= 4) return;
        if (!current.find(f => f.id === fund.id)) {
            this.compareList.set([...current, fund]);
        }
    }

    removeFromCompare(fundId: string) {
        this.compareList.set(this.compareList().filter(f => f.id !== fundId));
    }

    clearCompare() {
        this.compareList.set([]);
    }

    isInCompare(fundId: string): boolean {
        return this.compareList().some(f => f.id === fundId);
    }
}
