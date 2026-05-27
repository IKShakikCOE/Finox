import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Platform, Campaign, InvestmentDataResponse, CampaignStatus } from '../models/investment.model';

@Injectable({ providedIn: 'root' })
export class InvestmentService {
    private http = inject(HttpClient);

    platforms = signal<Platform[]>([]);
    campaigns = signal<Campaign[]>([]);
    selectedPlatformIds = signal<string[]>([]);
    selectedStatus = signal<CampaignStatus>('ALL');
    compareList = signal<Campaign[]>([]);

    filteredCampaigns = computed(() => {
        let result = this.campaigns();
        const platformIds = this.selectedPlatformIds();
        const status = this.selectedStatus();

        if (status !== 'ALL') {
            result = result.filter(c => c.status === status);
        }
        if (platformIds.length > 0) {
            result = result.filter(c => platformIds.includes(c.platformId));
        }
        return result;
    });

    // Summary computed signals
    totalBudget = computed(() => this.campaigns().reduce((sum, c) => sum + c.budget, 0));
    totalSpent = computed(() => this.campaigns().reduce((sum, c) => sum + c.spent, 0));
    totalRevenue = computed(() => this.campaigns().reduce((sum, c) => sum + c.revenue, 0));
    totalConversions = computed(() => this.campaigns().reduce((sum, c) => sum + c.conversions, 0));
    overallROAS = computed(() => {
        const spent = this.totalSpent();
        return spent > 0 ? +(this.totalRevenue() / spent).toFixed(2) : 0;
    });

    // Platform-wise breakdown
    platformBreakdown = computed(() => {
        const map = new Map<string, { platform: string; spent: number; revenue: number; conversions: number; roas: number }>();
        this.campaigns().forEach(c => {
            const existing = map.get(c.platformId) || { platform: c.platformName, spent: 0, revenue: 0, conversions: 0, roas: 0 };
            existing.spent += c.spent;
            existing.revenue += c.revenue;
            existing.conversions += c.conversions;
            map.set(c.platformId, existing);
        });
        return Array.from(map.values())
            .map(item => ({ ...item, roas: item.spent > 0 ? +(item.revenue / item.spent).toFixed(2) : 0 }))
            .sort((a, b) => b.revenue - a.revenue);
    });

    async loadData(): Promise<void> {
        try {
            const data = await firstValueFrom(
                this.http.get<InvestmentDataResponse>('demo/investments.json')
            );
            this.platforms.set(data.platforms);
            this.campaigns.set(data.campaigns);
        } catch (error) {
            console.error('Failed to load investment data', error);
        }
    }

    addToCompare(campaign: Campaign) {
        const current = this.compareList();
        if (current.length >= 4) return;
        if (!current.find(c => c.id === campaign.id)) {
            this.compareList.set([...current, campaign]);
        }
    }

    removeFromCompare(campaignId: string) {
        this.compareList.set(this.compareList().filter(c => c.id !== campaignId));
    }

    clearCompare() {
        this.compareList.set([]);
    }

    isInCompare(campaignId: string): boolean {
        return this.compareList().some(c => c.id === campaignId);
    }
}
