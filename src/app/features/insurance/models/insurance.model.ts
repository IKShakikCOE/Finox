export interface InsuranceCompany {
    id: string;
    name: string;
}

export interface InsuranceProduct {
    id: string;
    companyId: string;
    companyName: string;
    category: 'LIFE' | 'HEALTH' | 'VEHICLE' | 'PROPERTY' | 'CHILD' | 'PENSION';
    name: string;
    premiumRange: string;
    coverageAmount: string;
    tenure: string;
    maturityBenefit: string;
    features: string[];
    eligibility: string;
}

export interface InsuranceProfile {
    id: string;
    name: string;
    type: string;
    established: number;
    paidUpCapital: string;
    totalAssets: string;
    claimSettlementRatio: number;
    branches: number;
    employees: number;
    agents: number;
    chairman: string;
    md: string;
    headquarters: string;
    rating: string;
    ratingAgency: string;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    solvencyRatio: number;
    products: string[];
    website: string;
}

export interface InsuranceDataResponse {
    companies: InsuranceCompany[];
    products: InsuranceProduct[];
}

export type InsuranceCategory = 'ALL' | 'LIFE' | 'HEALTH' | 'VEHICLE' | 'PROPERTY' | 'CHILD' | 'PENSION';
