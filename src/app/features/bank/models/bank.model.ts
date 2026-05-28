export interface Bank {
    id: string;
    name: string;
    logo?: string;
}

export interface BankProduct {
    id: string;
    bankId: string;
    bankName: string;
    category: 'SAVINGS' | 'LOAN' | 'FDR' | 'DPS';
    name: string;
    interestRate: number;
    minDeposit: number | null;
    tenure: string | null;
    features: string[];
    eligibility: string;
}

export interface BankProfile {
    id: string;
    name: string;
    type: string;
    established: number;
    authorizedCapital: string;
    paidUpCapital: string;
    totalAssets: string;
    branches: number;
    atmBooths: number;
    employees: number;
    chairman: string;
    md: string;
    headquarters: string;
    swiftCode: string;
    rating: string;
    ratingAgency: string;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    nplRatio: number;
    services: string[];
    digitalServices: string[];
    website: string;
}

export interface BankDataResponse {
    banks: Bank[];
    products: BankProduct[];
}

export interface InstitutionsDataResponse {
    banks: BankProfile[];
    insuranceCompanies: any[];
    amcs: any[];
}

export type ProductCategory = 'ALL' | 'SAVINGS' | 'LOAN' | 'FDR' | 'DPS';
