import { afterNextRender, Component, effect, inject, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { LayoutService } from '@/app/layout/service/layout.service';
import { DashboardService } from '../services/dashboard.service';

@Component({
    standalone: true,
    selector: 'fx-cashflow-analysis-widget',
    imports: [ChartModule],
    template: `
    <div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">Cash Flow Analysis</div>
        @if (dashboardService.loading()) {
            <div class="h-100 flex items-center justify-center">
                <i class="pi pi-spin pi-spinner text-2xl text-primary"></i>
            </div>
        } @else {
            <p-chart type="bar" [data]="chartData()" [options]="chartOptions()" class="h-100" />
        }
    </div>`
})
export class CashFlowAnalysisWidget {
    layoutService = inject(LayoutService);
    dashboardService = inject(DashboardService);

    chartData = signal<any>(null);
    chartOptions = signal<any>(null);

    constructor() {
        // প্রথম রেন্ডারের পর চার্ট অপশন ইনিশিয়েট করার জন্য
        afterNextRender(() => {
            this.initChartOptions();
        });

        // থিম চেঞ্জ অথবা সার্ভিস ডেটা আপডেট হলে চার্ট রেন্ডার হবে
        effect(() => {
            // রিঅ্যাক্টিভ ডিপেন্ডেন্সি ট্র্যাকিং
            const isDarkTheme = this.layoutService.layoutConfig().darkTheme;
            const flowData = this.dashboardService.cashFlow();

            if (flowData && flowData.length > 0) {
                // থিম চেঞ্জ এবং ডেটা লোড হওয়ার পর রি-ইনিশিয়েট হবে
                setTimeout(() => {
                    this.initChartOptions();
                    this.updateChartData(flowData);
                }, 50);
            }
        });
    }

    private updateChartData(data: any[]) {
        const documentStyle = getComputedStyle(document.documentElement);
        
        // ডাইনামিকালি এপিআই রেসপন্স থেকে ম্যাপ করা হচ্ছে
        const labels = data.map(item => item.quarter);
        const incomeData = data.map(item => item.income);
        const expenseData = data.map(item => item.expense);
        const savingsData = data.map(item => item.savings);

        this.chartData.set({
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Total Income',
                    backgroundColor: documentStyle.getPropertyValue('--p-emerald-500') || '#10b981',
                    data: incomeData,
                    barThickness: 24
                },
                {
                    type: 'bar',
                    label: 'Expenses',
                    backgroundColor: documentStyle.getPropertyValue('--p-red-500') || '#ef4444',
                    data: expenseData,
                    barThickness: 24
                },
                {
                    type: 'bar',
                    label: 'Net Savings',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    data: savingsData,
                    borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
                    borderSkipped: false,
                    barThickness: 24
                }
            ]
        });
    }

    private initChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartOptions.set({
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        boxWidth: 12,
                        font: { weight: '500' }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context: any) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: false, // ফিন্যান্সিয়াল কম্পারিজনের জন্য কলামগুলো পাশাপাশি (Grouped) থাকা বেস্ট
                    ticks: { color: textMutedColor },
                    grid: { color: 'transparent', borderColor: 'transparent' }
                },
                y: {
                    stacked: false,
                    ticks: { 
                        color: textMutedColor,
                        callback: function(value: number) {
                            return (value / 1000) + 'k'; // রিড্যাবিলিটির জন্য k ফরম্যাট (যেমন: 100k, 200k)
                        }
                    },
                    grid: { color: borderColor, borderColor: 'transparent', drawTicks: false }
                }
            }
        });
    }
}