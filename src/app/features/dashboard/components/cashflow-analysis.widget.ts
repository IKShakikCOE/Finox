import { afterNextRender, Component, effect, inject, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { LayoutService } from '@/app/layout/service/layout.service';
import { DashboardService } from '../services/dashboard.service';
import { TrackerService } from '../../tracker/services/tracker.service';

@Component({
    standalone: true,
    selector: 'fx-cashflow-analysis-widget',
    imports: [ChartModule, SkeletonModule],
    template: `
    <div class="card">
        <div class="flex items-center justify-between mb-4">
            <div class="font-semibold text-xl">Cash Flow — Last 6 Months</div>
            <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-1">
                    <span class="inline-block w-3 h-3 rounded-sm bg-green-500"></span>
                    <span class="text-muted-color">Income</span>
                </div>
                <div class="flex items-center gap-1">
                    <span class="inline-block w-3 h-3 rounded-sm bg-red-500"></span>
                    <span class="text-muted-color">Expense</span>
                </div>
                <div class="flex items-center gap-1">
                    <span class="inline-block w-3 h-3 rounded-full border-2 border-blue-500"></span>
                    <span class="text-muted-color">Savings</span>
                </div>
            </div>
        </div>
        @if (trackerService.loading()) {
            <p-skeleton width="100%" height="320px"></p-skeleton>
        } @else {
            <p-chart type="bar" [data]="chartData()" [options]="chartOptions()" style="height: 320px" />
        }
    </div>`
})
export class CashFlowAnalysisWidget {
    private layoutService = inject(LayoutService);
    private dashboardService = inject(DashboardService);
    trackerService = inject(TrackerService);

    chartData = signal<any>(this.getDefaultChartData());
    chartOptions = signal<any>(this.getDefaultChartOptions());

    constructor() {
        afterNextRender(() => {
            this.initChartOptions();
            this.initChartData();
        });

        effect(() => {
            // Track reactive dependencies
            const isDarkTheme = this.layoutService.layoutConfig().darkTheme;
            const transactions = this.trackerService.transactions();
            const cashFlow = this.dashboardService.cashFlow();

            setTimeout(() => {
                this.initChartOptions();

                if (transactions && transactions.length > 0) {
                    this.buildFromTransactions(transactions);
                } else if (cashFlow && cashFlow.length > 0) {
                    this.buildFromCashFlow(cashFlow);
                } else {
                    this.initChartData(); // Use dummy data
                }
            }, 100);
        });
    }

    /** Always-available dummy data so chart renders immediately */
    private initChartData() {
        const months = this.getLast6Months();
        // Realistic dummy data for a Bangladesh professional
        const dummyIncome =  [165000, 180000, 175000, 180000, 185000, 180000];
        const dummyExpense = [72000,  68000,  85000,  65000,  78000,  70000];
        const dummySavings = dummyIncome.map((inc, i) => inc - dummyExpense[i]);

        this.setChartData(months.map(m => m.label), dummyIncome, dummyExpense, dummySavings);
    }

    private buildFromTransactions(transactions: any[]) {
        const months = this.getLast6Months();
        const incomeData: number[] = [];
        const expenseData: number[] = [];
        const savingsData: number[] = [];

        for (const month of months) {
            const monthTxns = transactions.filter((t: any) => {
                if (!t.date) return false;
                return t.date.substring(0, 7) === month.key;
            });

            const income = monthTxns
                .filter((t: any) => t.type === 'INCOME')
                .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
            const expense = monthTxns
                .filter((t: any) => t.type === 'EXPENSE')
                .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

            incomeData.push(income);
            expenseData.push(expense);
            savingsData.push(income - expense);
        }

        // Only use real data if at least some months have values
        const hasData = incomeData.some(v => v > 0) || expenseData.some(v => v > 0);
        if (hasData) {
            this.setChartData(months.map(m => m.label), incomeData, expenseData, savingsData);
        }
    }

    private buildFromCashFlow(data: any[]) {
        this.setChartData(
            data.map(item => item.quarter),
            data.map(item => item.income),
            data.map(item => item.expense),
            data.map(item => item.savings)
        );
    }

    private setChartData(labels: string[], income: number[], expense: number[], savings: number[]) {
        this.chartData.set({
            labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Income',
                    backgroundColor: '#10b981',
                    hoverBackgroundColor: '#059669',
                    data: income,
                    barThickness: 22,
                    borderRadius: 4,
                    order: 2
                },
                {
                    type: 'bar',
                    label: 'Expense',
                    backgroundColor: '#ef4444',
                    hoverBackgroundColor: '#dc2626',
                    data: expense,
                    barThickness: 22,
                    borderRadius: 4,
                    order: 3
                },
                {
                    type: 'line',
                    label: 'Net Savings',
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.06)',
                    data: savings,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2.5,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    order: 1
                }
            ]
        });
    }

    private getLast6Months(): { key: string; label: string }[] {
        const months: { key: string; label: string }[] = [];
        const now = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toISOString().substring(0, 7);
            const label = monthNames[d.getMonth()] + ' ' + d.getFullYear().toString().slice(-2);
            months.push({ key, label });
        }
        return months;
    }

    private initChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary') || '#6b7280';
        const borderColor = documentStyle.getPropertyValue('--surface-border') || '#e5e7eb';

        this.chartOptions.set(this.buildChartOptions(textMutedColor, borderColor));
    }

    private getDefaultChartData(): any {
        const months = this.getLast6MonthLabels();
        return {
            labels: months,
            datasets: [
                { type: 'bar', label: 'Income', backgroundColor: '#10b981', data: [165000, 180000, 175000, 180000, 185000, 180000], barThickness: 22, borderRadius: 4, order: 2 },
                { type: 'bar', label: 'Expense', backgroundColor: '#ef4444', data: [72000, 68000, 85000, 65000, 78000, 70000], barThickness: 22, borderRadius: 4, order: 3 },
                { type: 'line', label: 'Net Savings', borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.06)', data: [93000, 112000, 90000, 115000, 107000, 110000], fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 5, pointBackgroundColor: '#3b82f6', pointBorderColor: '#fff', pointBorderWidth: 2, order: 1 }
            ]
        };
    }

    private getDefaultChartOptions(): any {
        return this.buildChartOptions('#6b7280', '#e5e7eb');
    }

    private buildChartOptions(textMutedColor: string, borderColor: string): any {
        return {
            maintainAspectRatio: false,
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 13 },
                    bodyFont: { size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context: any) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += '৳' + context.parsed.y.toLocaleString('en-BD');
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: textMutedColor, font: { size: 11, weight: '500' } },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textMutedColor,
                        font: { size: 11 },
                        maxTicksLimit: 6,
                        callback: function(value: number) {
                            if (value >= 100000) return (value / 100000).toFixed(1) + 'L';
                            if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                            return value.toString();
                        }
                    },
                    grid: { color: borderColor, drawTicks: false }
                }
            }
        };
    }

    private getLast6MonthLabels(): string[] {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const labels: string[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(monthNames[d.getMonth()] + ' ' + d.getFullYear().toString().slice(-2));
        }
        return labels;
    }
}
