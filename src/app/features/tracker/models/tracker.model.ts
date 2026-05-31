// ─── Enums (matching backend) ────────────────────────────────────────────────

export type FlowType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type AccountType = 'CASH' | 'BANK' | 'CREDIT_CARD' | 'MOBILE_BANKING';
export type PaymentMethod = 'CASH' | 'BANK' | 'MOBILE_BANKING' | 'CREDIT_CARD';
export type BudgetPeriod = 'MONTHLY' | 'WEEKLY' | 'YEARLY' | 'CUSTOM';
export type RecurringFrequency = 'MONTHLY' | 'WEEKLY' | 'YEARLY';

// ─── Entities (aligned with backend domain) ──────────────────────────────────

export interface Transaction {
    id?: string;
    title: string;
    amount: number;
    type: FlowType;
    date: string; // YYYY-MM-DD (DateOnly on backend)
    categoryId?: string;
    category?: Category; // navigation (populated by backend Include)
    accountId?: string;
    account?: Account; // navigation (populated by backend Include)
    paymentMethod?: PaymentMethod;
    remarks?: string;
    isRecurring?: boolean;
    recurringFrequency?: RecurringFrequency;
    createdAt?: string;
    updatedAt?: string;
}

export interface Category {
    id?: string;
    name: string;
    code?: string;
    type: FlowType;
    icon?: string;
    color?: string;
    parentId?: string;
    parent?: Category;
    children?: Category[];
    sortOrder?: number;
    isSystem?: boolean;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Account {
    id?: string;
    name: string;
    type: AccountType;
    balance: number;
    currency?: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Budget {
    id?: string;
    categoryId: string;
    category?: Category; // navigation
    allocatedAmount: number;
    period: BudgetPeriod;
    startDate?: string;
    endDate?: string;
    alertThreshold?: number; // percentage (e.g., 80 means alert at 80% usage)
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface TrackerMetaResponse {
    paymentMethods: PaymentMethod[];
    incomeCategories: string[];
    expenseCategories: string[];
}

// ─── Table helpers ───────────────────────────────────────────────────────────

export interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

export interface ExportColumn {
    title: string;
    dataKey: string;
}
