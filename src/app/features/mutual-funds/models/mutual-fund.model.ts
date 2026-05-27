export interface AMC {
    id: string;
    name: string;
}

export interface MutualFund {
    id: string;
    amcId: string;
    amcName: string;
    category: 'GROWTH' | 'BALANCED' | 'FIXED_INCOME';
    name: string;
    nav: number;
    returnRate1Y: number;
    returnRate3Y: number;
    returnRate5Y: number;
    minInvestment: number;
    expenseRatio: number;
    fundSize: string;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    features: string[];
    objective: string;
}

export interface MutualFundDataResponse {
    amcs: AMC[];
    funds: MutualFund[];
}

export type FundCategory = 'ALL' | 'GROWTH' | 'BALANCED' | 'FIXED_INCOME';
export type RiskLevel = 'ALL' | 'LOW' | 'MODERATE' | 'HIGH';
