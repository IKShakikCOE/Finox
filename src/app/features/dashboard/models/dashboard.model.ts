export interface FinanceSummary {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    savingsRate: number;
    balanceChangePercent: number;
    expenseChangePercent: number;
}

export interface AssetAllocation {
    assetClass: string;
    description: string;
    percentage: number;
    colorClass: string;
    textColorClass: string;
}

export interface Transaction {
    id: number;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
}

export interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    timeGroup: 'TODAY' | 'LAST WEEK';
    icon: string;
    bgClass: string;
    iconClass: string;
}

export interface CashFlowData {
    quarter: string;
    income: number;
    expense: number;
    savings: number;
}

export interface DashboardData {
    summary: FinanceSummary;
    allocations: AssetAllocation[];
    recentTransactions: Transaction[];
    notifications: Notification[];
    cashFlow: CashFlowData[];
}