import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TrackerService } from '../../tracker/services/tracker.service';

@Component({
    standalone: true,
    selector: 'fx-budget-health-widget',
    imports: [CommonModule, RouterModule, ButtonModule, TagModule],
    template: `
    <div class="card">
        <div class="flex items-center justify-between mb-4">
            <div class="font-semibold text-xl">Budget Health</div>
            <p-button label="View All" icon="pi pi-arrow-right" [text]="true"
                severity="secondary" size="small" routerLink="/app/tracker/budgeting" />
        </div>

        @if (trackerService.budgetVsActual().length === 0) {
            <div class="text-center p-4 text-muted-color">
                <i class="pi pi-wallet text-2xl mb-2 block"></i>
                <p class="text-sm m-0">No budgets set yet.</p>
            </div>
        } @else {
            <div class="flex flex-col gap-3">
                @for (item of trackerService.budgetVsActual().slice(0, 5); track item.id) {
                    <div class="flex items-center gap-3">
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium">{{ item.category }}</span>
                                <span class="text-xs font-bold"
                                    [class.text-green-500]="item.percentage < 60"
                                    [class.text-yellow-500]="item.percentage >= 60 && item.percentage < 80"
                                    [class.text-orange-500]="item.percentage >= 80 && item.percentage <= 100"
                                    [class.text-red-500]="item.percentage > 100"
                                >{{ item.percentage }}%</span>
                            </div>
                            <div class="w-full bg-gray-200 dark:bg-surface-700 rounded-full h-2">
                                <div class="h-2 rounded-full transition-all"
                                    [style.width.%]="item.percentage > 100 ? 100 : item.percentage"
                                    [class.bg-green-500]="item.percentage < 60"
                                    [class.bg-yellow-500]="item.percentage >= 60 && item.percentage < 80"
                                    [class.bg-orange-500]="item.percentage >= 80 && item.percentage <= 100"
                                    [class.bg-red-500]="item.percentage > 100"
                                ></div>
                            </div>
                        </div>
                        <p-tag
                            [value]="item.isOverBudget ? 'Over' : item.isNearLimit ? 'Near' : 'OK'"
                            [severity]="item.isOverBudget ? 'danger' : item.isNearLimit ? 'warn' : 'success'"
                        />
                    </div>
                }
            </div>
        }
    </div>`
})
export class BudgetHealthWidget implements OnInit {
    trackerService = inject(TrackerService);

    ngOnInit() {
        if (!this.trackerService.transactions().length) {
            this.trackerService.loadTrackerMetaData();
        }
    }
}
