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

export interface BankDataResponse {
    banks: Bank[];
    products: BankProduct[];
}

export type ProductCategory = 'ALL' | 'SAVINGS' | 'LOAN' | 'FDR' | 'DPS';
