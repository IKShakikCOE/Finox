import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackerService } from '../services/tracker.service';

@Component({
    selector: 'fx-tracker-reports',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="grid grid-cols-12 gap-4 mb-6">
            <div class="col-span-12 md:col-span-4">
                <div class="card p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="block text-muted-color font-medium mb-2">Total Income</span>
                            <div class="text-2xl font-bold text-emerald-500">{{ trackerService.totalIncome() | currency: 'BDT' : 'symbol' : '1.0-0' }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-green-100 rounded-full" style="width: 3rem; height: 3rem">
                            <i class="pi pi-arrow-up-right text-green-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-4">
                <div class="card p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="block text-muted-color font-medium mb-2">Total Expense</span>
                            <div class="text-2xl font-bold text-red-500">{{ trackerService.totalExpense() | currency: 'BDT' : 'symbol' : '1.0-0' }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-red-100 rounded-full" style="width: 3rem; height: 3rem">
                            <i class="pi pi-arrow-down-right text-red-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-4">
                <div class="card p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="block text-muted-color font-medium mb-2">Net Balance</span>
                            <div class="text-2xl font-bold" [class.text-emerald-500]="trackerService.balance() >= 0" [class.text-red-500]="trackerService.balance() < 0">
                                {{ trackerService.balance() | currency: 'BDT' : 'symbol' : '1.0-0' }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-100 rounded-full" style="width: 3rem; height: 3rem">
                            <i class="pi pi-wallet text-blue-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6">
                <div class="card">
                    <h5 class="mb-4">Expense by Category</h5>
                    <div class="flex flex-col gap-3">
                        <div *ngFor="let item of expenseByCategory()" class="flex items-center justify-between p-3 border-round surface-border border">
                            <span class="font-medium inline-flex items-center gap-2">
                                <i *ngIf="item.icon" [class]="'pi ' + item.icon" [style.color]="item.color || 'inherit'"></i>
                                {{ item.category }}
                            </span>
                            <div class="flex items-center gap-3">
                                <span class="font-semibold text-red-500">{{ item.total | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                                <span class="text-muted-color text-sm">({{ item.percentage }}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-6">
                <div class="card">
                    <h5 class="mb-4">Income by Category</h5>
                    <div class="flex flex-col gap-3">
                        <div *ngFor="let item of incomeByCategory()" class="flex items-center justify-between p-3 border-round surface-border border">
                            <span class="font-medium inline-flex items-center gap-2">
                                <i *ngIf="item.icon" [class]="'pi ' + item.icon" [style.color]="item.color || 'inherit'"></i>
                                {{ item.category }}
                            </span>
                            <div class="flex items-center gap-3">
                                <span class="font-semibold text-emerald-500">{{ item.total | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                                <span class="text-muted-color text-sm">({{ item.percentage }}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class TrackerReportsComponent implements OnInit {
    public trackerService = inject(TrackerService);

    expenseByCategory = computed(() => this.groupByCategory('EXPENSE'));
    incomeByCategory = computed(() => this.groupByCategory('INCOME'));

    ngOnInit() {
        if (!this.trackerService.transactions().length) {
            this.trackerService.loadTransactions();
        }
    }

    private groupByCategory(type: 'INCOME' | 'EXPENSE') {
        const txns = this.trackerService.transactions().filter(t => t.type === type);
        const total = txns.reduce((sum, t) => sum + (t.amount || 0), 0);
        const grouped = new Map<string, { total: number; icon?: string; color?: string }>();

        txns.forEach(t => {
            const cat = t.category?.name || 'Uncategorized';
            const existing = grouped.get(cat) || { total: 0, icon: t.category?.icon, color: t.category?.color };
            existing.total += (t.amount || 0);
            grouped.set(cat, existing);
        });

        return Array.from(grouped.entries())
            .map(([category, data]) => ({
                category,
                total: data.total,
                icon: data.icon,
                color: data.color,
                percentage: total > 0 ? Math.round((data.total / total) * 100) : 0
            }))
            .sort((a, b) => b.total - a.total);
    }
}
