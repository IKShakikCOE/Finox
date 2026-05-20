export interface Transaction {
    id?: string;
    title?: string;
    amount?: number;
    type?: 'INCOME' | 'EXPENSE';
    category?: string;
    date?: string; // YYYY-MM-DD
    paymentMethod?: 'CASH' | 'BANK' | 'MOBILE_BANKING';
    remarks?: string;
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