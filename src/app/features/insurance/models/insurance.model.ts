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

export interface InsuranceDataResponse {
    companies: InsuranceCompany[];
    products: InsuranceProduct[];
}

export type InsuranceCategory = 'ALL' | 'LIFE' | 'HEALTH' | 'VEHICLE' | 'PROPERTY' | 'CHILD' | 'PENSION';
