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

export interface AMCProfile {
    id: string;
    name: string;
    established: number;
    paidUpCapital: string;
    aum: string;
    totalFunds: number;
    chairman: string;
    md: string;
    headquarters: string;
    rating: string;
    ratingAgency: string;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    parentOrg: string;
    fundTypes: string[];
    investmentPhilosophy: string;
    website: string;
}

export interface InstitutionsDataResponse {
    banks: BankProfile[];
    insuranceCompanies: InsuranceProfile[];
    amcs: AMCProfile[];
}
