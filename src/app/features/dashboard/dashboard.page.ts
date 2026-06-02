import { Component, inject, OnInit } from '@angular/core';
import { NotificationsWidget } from './components/notifications.widget';
import { StatsWidgetComponent } from './components/stats.widget';
import { RecentTransactionsWidget } from './components/recent-transactions.widget';
import { AssetAllocationWidget } from './components/asset-allocation.widget.';
import { CashFlowAnalysisWidget } from './components/cashflow-analysis.widget';
import { BudgetHealthWidget } from './components/budget-health.widget';
import { UpcomingEventsWidget } from './components/upcoming-events.widget';
import { InvestmentSummaryWidget } from './components/investment-summary.widget';
import { PortfolioOverviewWidget } from './components/portfolio-overview.widget';
import { LatestNewsWidget } from './components/latest-news.widget';
import { QuickAccessWidget } from './components/quick-access.widget';
import { DashboardService } from './services/dashboard.service';
import { TrackerService } from '../tracker/services/tracker.service';

@Component({
    selector: 'fx-dashboard',
    standalone: true,
    imports: [
        StatsWidgetComponent,
        RecentTransactionsWidget,
        AssetAllocationWidget,
        CashFlowAnalysisWidget,
        NotificationsWidget,
        BudgetHealthWidget,
        UpcomingEventsWidget,
        InvestmentSummaryWidget,
        PortfolioOverviewWidget,
        LatestNewsWidget,
        QuickAccessWidget
    ],
    providers: [DashboardService],
    template: `
        <div class="grid grid-cols-12 gap-4">
            <!-- P1: Financial Snapshot -->
            <fx-stats-widget class="col-span-12 grid grid-cols-12 gap-4"></fx-stats-widget>

            <!-- P2+P3: Two balanced columns -->
            <div class="col-span-12 xl:col-span-8 flex flex-col gap-4">
                <fx-recent-transactions-widget />
                <fx-cashflow-analysis-widget />
                <!-- Masonry-style: widgets flow to fill space dynamically -->
                <div class="columns-2 gap-4 space-y-4">
                    <div class="break-inside-avoid">
                        <fx-upcoming-events-widget />
                    </div>

                    <div class="break-inside-avoid">
                        <fx-portfolio-overview-widget />
                    </div>

                    <div class="break-inside-avoid">
                        <fx-investment-summary-widget />
                    </div>

                    <div class="break-inside-avoid">
                        <fx-latest-news-widget />
                    </div>
                </div>
            </div>
            <div class="col-span-12 xl:col-span-4 flex flex-col gap-4">
                <fx-budget-health-widget />
                <fx-asset-allocation-widget />
                <fx-notifications-widget />
                <fx-quick-access-widget />
            </div>
        </div>
    `
})
export class DashboardPage implements OnInit {
    dashboardService = inject(DashboardService);
    trackerService = inject(TrackerService);

    ngOnInit() {
        this.dashboardService.loadDashboardData();
        
        // Centralized API data loading for all dashboard widgets
        this.trackerService.loadTransactions();
        this.trackerService.loadBudgets();
        this.trackerService.loadCategories();
        this.trackerService.loadCategoriesFlat();
    }
}
