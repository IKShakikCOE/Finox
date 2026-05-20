import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FinanceSummary, AssetAllocation, Transaction, Notification, DashboardData, CashFlowData } from '../models/dashboard.model';

@Injectable()
export class DashboardService {
    private http = inject(HttpClient);
    // .NET API রেডি হলে URL টি জাস্ট চেঞ্জ করে দিবেন (যেমন: 'https://api.yourdomain.com/api/dashboard')
    private jsonUrl = 'demo/dashboard-finance.json'; 

    // Angular Signals for State Management
    summary = signal<FinanceSummary | null>(null);
    allocations = signal<AssetAllocation[]>([]);
    recentTransactions = signal<Transaction[]>([]);
    notifications = signal<Notification[]>([]);
    cashFlow = signal<CashFlowData[]>([]);
    loading = signal<boolean>(false);

    // Computed Signal for Net Savings Calculation
    netSavings = computed(() => {
        const data = this.summary();
        if (!data) return 0;
        return data.monthlyIncome - data.monthlyExpense;
    });

    async loadDashboardData(): Promise<void> {
        this.loading.set(true);
        try {
            const data = await firstValueFrom(this.http.get<DashboardData>(this.jsonUrl));
            if (data) {
                this.summary.set(data.summary);
                this.allocations.set(data.allocations);
                this.recentTransactions.set(data.recentTransactions);
                this.notifications.set(data.notifications);
                this.cashFlow.set(data.cashFlow ?? []);
            }
        } catch (error) {
            console.error('Failed to load financial dashboard data:', error);
        } finally {
            this.loading.set(false);
        }
    }
}