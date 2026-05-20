import { Component, inject, OnInit } from '@angular/core';
import { NotificationsWidget } from './components/notifications.widget';
import { StatsWidgetComponent } from './components/stats.widget';
import { RecentTransactionsWidget } from './components/recent-transactions.widget';
import { AssetAllocationWidget } from './components/asset-allocation.widget.';
import { CashFlowAnalysisWidget } from './components/cashflow-analysis.widget';
import { DashboardService } from './services/dashboard.service';

@Component({
    selector: 'fx-dashboard',
    standalone: true,
    imports: [StatsWidgetComponent, RecentTransactionsWidget, AssetAllocationWidget, CashFlowAnalysisWidget, NotificationsWidget],
    providers: [DashboardService],
    template: `
        <!-- <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-sales-widget />
                <app-best-selling-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-revenue-stream-widget />
                <app-notifications-widget />
            </div>
        </div> -->
        <div class="grid grid-cols-12 gap-4">
            @if (dashboardService.loading()) {
                <div class="col-span-12 flex justify-center items-center py-8">
                    <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
                </div>
            } @else {
                <fx-stats-widget class="col-span-12 grid grid-cols-12 gap-4"></fx-stats-widget>
                
                <div class="col-span-12 xl:col-span-6">
                    <fx-recent-transactions-widget />
                    <fx-cashflow-analysis-widget />
                </div>
                
                <div class="col-span-12 xl:col-span-6">
                    <fx-asset-allocation-widget></fx-asset-allocation-widget>
                    <fx-notifications-widget class="block mt-4"></fx-notifications-widget>
                </div>
            }
        </div>
    `
})
export class DashboardPage implements OnInit {
    dashboardService = inject(DashboardService);

    ngOnInit() {
        this.dashboardService.loadDashboardData();
    }
}