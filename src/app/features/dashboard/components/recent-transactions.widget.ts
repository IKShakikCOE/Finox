import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DashboardService } from '../services/dashboard.service';

@Component({
    standalone: true,
    selector: 'fx-recent-transactions-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    template: `
    <div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">Recent Transactions</div>
        <p-table [value]="dashboardService.recentTransactions()" [paginator]="true" [rows]="5" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th pSortableColumn="description">Description <p-sortIcon field="description"></p-sortIcon></th>
                    <th pSortableColumn="category">Category <p-sortIcon field="category"></p-sortIcon></th>
                    <th pSortableColumn="amount">Amount <p-sortIcon field="amount"></p-sortIcon></th>
                    <th>Date</th>
                </tr>
            </ng-template>
            <ng-template #body let-tx>
                <tr>
                    <td style="width: 40%;">{{ tx.description }}</td>
                    <td style="width: 25%;">
                        <span class="p-1 px-2 rounded text-xs font-semibold bg-surface-100 dark:bg-surface-800">
                            {{ tx.category }}
                        </span>
                    </td>
                    <td style="width: 20%;" [ngClass]="{'text-emerald-500 font-medium': tx.type === 'income', 'text-rose-500': tx.type === 'expense'}">
                        {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | currency: '৳':'symbol':'1.0-0' }}
                    </td>
                    <td style="width: 15%;">{{ tx.date | date: 'mediumDate' }}</td>
                </tr>
            </ng-template>
        </p-table>
    </div>`
})
export class RecentTransactionsWidget implements OnInit {
    dashboardService = inject(DashboardService);

    ngOnInit() {
        // ইনিশিয়ালি ডেটা লোড না হয়ে থাকলে কল করবে
        if (!this.dashboardService.summary()) {
            this.dashboardService.loadDashboardData();
        }
    }
}