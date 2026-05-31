import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { AdminService } from '../services/admin.service';

@Component({
    selector: 'fx-admin-analytics',
    standalone: true,
    imports: [CommonModule, ChartModule, CardModule],
    template: `
        <div class="card">
            <h4 class="mt-0 mb-6">System Analytics</h4>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- User Growth Chart -->
                <div class="card surface-ground p-4">
                    <h5 class="mb-4">User Growth</h5>
                    @if (userGrowthData) {
                        <p-chart type="line" [data]="userGrowthData" [options]="lineOptions" />
                    } @else {
                        <p class="text-surface-500">Loading...</p>
                    }
                </div>

                <!-- Transaction Volume Chart -->
                <div class="card surface-ground p-4">
                    <h5 class="mb-4">Transaction Volume</h5>
                    @if (transactionVolumeData) {
                        <p-chart type="bar" [data]="transactionVolumeData" [options]="barOptions" />
                    } @else {
                        <p class="text-surface-500">Loading...</p>
                    }
                </div>

                <!-- Module Usage Chart -->
                <div class="card surface-ground p-4">
                    <h5 class="mb-4">Module Usage</h5>
                    @if (moduleUsageData) {
                        <p-chart type="doughnut" [data]="moduleUsageData" [options]="doughnutOptions" />
                    } @else {
                        <p class="text-surface-500">Loading...</p>
                    }
                </div>

                <!-- Popular Products Table -->
                <div class="card surface-ground p-4">
                    <h5 class="mb-4">Popular Products</h5>
                    @if (adminService.analytics()?.popularProducts?.length) {
                        <div class="flex flex-col gap-3">
                            @for (product of adminService.analytics()!.popularProducts; track product.name) {
                                <div class="flex justify-between items-center p-3 surface-card rounded-lg">
                                    <div>
                                        <span class="font-semibold">{{ product.name }}</span>
                                        <span class="text-surface-500 text-sm ml-2">({{ product.category }})</span>
                                    </div>
                                    <span class="font-bold text-primary">{{ product.views }} views</span>
                                </div>
                            }
                        </div>
                    } @else {
                        <p class="text-surface-500">Loading...</p>
                    }
                </div>
            </div>
        </div>
    `
})
export class AnalyticsComponent implements OnInit {
    adminService = inject(AdminService);

    userGrowthData: any = null;
    transactionVolumeData: any = null;
    moduleUsageData: any = null;

    lineOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
    };

    barOptions = {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
    };

    doughnutOptions = {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
    };

    ngOnInit() {
        this.loadAnalytics();
    }

    async loadAnalytics() {
        await this.adminService.loadAnalytics();
        const data = this.adminService.analytics();
        if (!data) return;

        // User Growth
        if (data.userGrowth?.length) {
            this.userGrowthData = {
                labels: data.userGrowth.map(d => d.month),
                datasets: [{
                    label: 'Users',
                    data: data.userGrowth.map(d => d.count),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            };
        }

        // Transaction Volume
        if (data.transactionVolume?.length) {
            this.transactionVolumeData = {
                labels: data.transactionVolume.map(d => d.month),
                datasets: [
                    {
                        label: 'Income',
                        data: data.transactionVolume.map(d => d.income),
                        backgroundColor: '#10B981'
                    },
                    {
                        label: 'Expense',
                        data: data.transactionVolume.map(d => d.expense),
                        backgroundColor: '#EF4444'
                    }
                ]
            };
        }

        // Module Usage
        if (data.moduleUsage?.length) {
            this.moduleUsageData = {
                labels: data.moduleUsage.map(d => d.module),
                datasets: [{
                    data: data.moduleUsage.map(d => d.percentage),
                    backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']
                }]
            };
        }
    }
}
