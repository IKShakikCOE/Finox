export interface Platform {
    id: string;
    name: string;
    icon?: string;
    color?: string;
}

export interface Campaign {
    id: string;
    platformId: string;
    platformName: string;
    name: string;
    type: string;
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
    startDate: string;
    endDate: string;
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    cpc: number;
    ctr: number;
    roas: number;
}

export interface InvestmentDataResponse {
    platforms: Platform[];
    campaigns: Campaign[];
}

export type CampaignStatus = 'ALL' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
