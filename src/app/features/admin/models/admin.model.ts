export interface AdminUser {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    enabled: boolean;
    createdTimestamp?: number;
    emailVerified?: boolean;
}

export interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalBanks: number;
    totalInsuranceCompanies: number;
    totalMutualFunds: number;
    totalArticles: number;
    totalPlatforms: number;
}

export interface TrackerMetaAdmin {
    paymentMethods: string[];
    incomeCategories: string[];
    expenseCategories: string[];
}

export interface AuditLog {
    id: string;
    userId: string;
    username: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: string;
    timestamp: string;
    ipAddress?: string;
}

export interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    active: boolean;
    createdAt: string;
    expiresAt?: string;
    createdBy?: string;
}

export interface AnalyticsData {
    userGrowth: { month: string; count: number }[];
    transactionVolume: { month: string; income: number; expense: number }[];
    popularProducts: { name: string; views: number; category: string }[];
    moduleUsage: { module: string; activeUsers: number; percentage: number }[];
}

export interface SeedStatus {
    lastSeeded?: string;
    tables: { name: string; rowCount: number; seeded: boolean }[];
}
