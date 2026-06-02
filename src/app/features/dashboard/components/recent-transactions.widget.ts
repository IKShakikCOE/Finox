import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TrackerService } from '../../tracker/services/tracker.service';

@Component({
    standalone: true,
    selector: 'fx-recent-transactions-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    template: `
    <div class="card">
        <div class="font-semibold text-xl mb-4">Recent Transactions</div>
        <p-table [value]="recentTransactions()" [paginator]="true" [rows]="5" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th pSortableColumn="title">Title <p-sortIcon field="title"></p-sortIcon></th>
                    <th pSortableColumn="category.name">Category <p-sortIcon field="category.name"></p-sortIcon></th>
                    <th pSortableColumn="amount">Amount <p-sortIcon field="amount"></p-sortIcon></th>
                    <th pSortableColumn="date">Date <p-sortIcon field="date"></p-sortIcon></th>
                </tr>
            </ng-template>
            <ng-template #body let-tx>
                <tr>
                    <td style="width: 40%;">{{ tx.title || 'No description' }}</td>
                    <td style="width: 25%;">
                        <span class="p-1 px-2 rounded text-xs font-semibold bg-surface-100 dark:bg-surface-800 flex items-center gap-2 w-max">
                            <i *ngIf="tx.category?.icon" [class]="'pi ' + tx.category.icon" [style.color]="tx.category.color || 'inherit'"></i>
                            {{ tx.category?.name || 'Uncategorized' }}
                        </span>
                    </td>
                    <td style="width: 20%;" [ngClass]="{'text-emerald-500 font-medium': tx.type === 'INCOME', 'text-rose-500': tx.type === 'EXPENSE'}">
                        {{ tx.type === 'INCOME' ? '+' : '-' }}{{ tx.amount | currency: 'BDT':'symbol':'1.0-0' }}
                    </td>
                    <td style="width: 15%;">{{ tx.date | date: 'mediumDate' }}</td>
                </tr>
            </ng-template>
        </p-table>
    </div>`
})
export class RecentTransactionsWidget implements OnInit {
    trackerService = inject(TrackerService);

    recentTransactions = computed(() => {
        const sorted = [...this.trackerService.transactions()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted.slice(0, 10);
    });

    ngOnInit() {
        if (!this.trackerService.transactions().length) {
            this.trackerService.loadTransactions();
        }
    }
}