export interface Transaction {
    id?: string;
    title?: string;
    amount?: number;
    type?: 'INCOME' | 'EXPENSE';
    category?: string;
    date?: string; // YYYY-MM-DD
    paymentMethod?: string;
    accountId?: string;
    remarks?: string;
    isRecurring?: boolean;
    recurringFrequency?: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
}

export interface Category {
    id?: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    icon?: string;
    color?: string;
    parentId?: string;
}

export interface Account {
    id?: string;
    name: string;
    type: 'CASH' | 'BANK' | 'CREDIT_CARD' | 'MOBILE_BANKING';
    balance: number;
    currency?: string;
    icon?: string;
    color?: string;
}

export interface Budget {
    id?: string;
    category: string;
    allocatedAmount: number;
    period: 'MONTHLY' | 'WEEKLY' | 'YEARLY' | 'CUSTOM';
    startDate?: string;
    endDate?: string;
    alertThreshold?: number; // percentage (e.g., 80 means alert at 80% usage)
}

export interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

export interface ExportColumn {
    title: string;
    dataKey: string;
}
