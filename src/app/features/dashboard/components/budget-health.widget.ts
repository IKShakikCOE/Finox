import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TrackerService } from '../../tracker/services/tracker.service';
import { AccordionModule } from 'primeng/accordion';

@Component({
    standalone: true,
    selector: 'fx-budget-health-widget',
    imports: [CommonModule, RouterModule, ButtonModule, TagModule, SkeletonModule, AccordionModule],
    template: `
    <div class="card">
        <div class="flex items-center justify-between mb-4">
            <div class="font-semibold text-xl">Budget Health</div>
            <p-button label="View All" icon="pi pi-arrow-right" [text]="true"
                severity="secondary" size="small" routerLink="/app/tracker/budgeting" />
        </div>

        @if (trackerService.loading()) {
            <div class="flex flex-col gap-4 mt-4">
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between">
                        <p-skeleton width="40%" height="1.2rem"></p-skeleton>
                        <p-skeleton width="15%" height="1.2rem"></p-skeleton>
                    </div>
                    <p-skeleton width="100%" height="0.5rem"></p-skeleton>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between">
                        <p-skeleton width="50%" height="1.2rem"></p-skeleton>
                        <p-skeleton width="15%" height="1.2rem"></p-skeleton>
                    </div>
                    <p-skeleton width="100%" height="0.5rem"></p-skeleton>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between">
                        <p-skeleton width="30%" height="1.2rem"></p-skeleton>
                        <p-skeleton width="15%" height="1.2rem"></p-skeleton>
                    </div>
                    <p-skeleton width="100%" height="0.5rem"></p-skeleton>
                </div>
            </div>
        } @else if (trackerService.groupedBudgets().length === 0) {
            <div class="text-center p-4 text-muted-color">
                <i class="pi pi-wallet text-2xl mb-2 block"></i>
                <p class="text-sm m-0">No budgets set yet.</p>
            </div>
        } @else {
            <p-accordion>
    @for (group of trackerService.groupedBudgets().slice(0, 5); track group.parentCategory.id) {

        <p-accordion-panel [value]="group.parentCategory.id">

            <p-accordion-header>

                <div class="flex items-center gap-3 w-full">

                    <div class="flex-1 min-w-0">

                        <div class="flex items-center justify-between mb-1">
                            <span class="text-sm font-medium flex items-center gap-1">
                                {{ group.parentCategory?.name }}

                                <span class="text-xs text-muted-color font-normal">
                                    ({{ group.subBudgets?.length || 0 }})
                                </span>
                            </span>

                            <span
                                class="text-xs font-bold"
                                [class.text-green-500]="group.percentage < 60"
                                [class.text-yellow-500]="group.percentage >= 60 && group.percentage < 80"
                                [class.text-orange-500]="group.percentage >= 80 && group.percentage <= 100"
                                [class.text-red-500]="group.percentage > 100">

                                {{ group.percentage }}%
                            </span>
                        </div>

                        <div class="w-full bg-gray-200 dark:bg-surface-700 rounded-full h-2">
                            <div
                                class="h-2 rounded-full transition-all"
                                [style.width.%]="group.percentage > 100 ? 100 : group.percentage"
                                [class.bg-green-500]="group.percentage < 60"
                                [class.bg-yellow-500]="group.percentage >= 60 && group.percentage < 80"
                                [class.bg-orange-500]="group.percentage >= 80 && group.percentage <= 100"
                                [class.bg-red-500]="group.percentage > 100">
                            </div>
                        </div>

                    </div>

                    <p-tag
                        [value]="group.isOverBudget ? 'Over' : group.isNearLimit ? 'Near' : 'OK'"
                        [severity]="group.isOverBudget ? 'danger' : group.isNearLimit ? 'warn' : 'success'">
                    </p-tag>

                </div>

            </p-accordion-header>

            <p-accordion-content>

    <div class="flex flex-col gap-3 pt-2">

        @for (budget of group.subBudgets; track budget.id) {

            <div class="pl-3 border-l-2 border-surface-200 dark:border-surface-700 pr-3">

                <div class="flex items-center gap-3">

                    <div class="flex-1">

                        <div class="flex items-center justify-between mb-1">

                            <span class="text-sm">
                                {{ budget.category?.name }}
                            </span>
<span
    class="text-xs font-medium"
    [class.text-green-500]="group.percentage < 60"
    [class.text-yellow-500]="group.percentage >= 60 && group.percentage < 80"
    [class.text-red-500]="group.percentage >= 80">

    {{ group.totalSpent | currency:'BDT':'symbol':'1.0-0' }}
    /
    {{ group.totalAllocated | currency:'BDT':'symbol':'1.0-0' }}
</span>
                            <span
                                class="text-xs font-bold"
                                [class.text-green-500]="budget.percentage < 60"
                                [class.text-yellow-500]="budget.percentage >= 60 && budget.percentage < 80"
                                [class.text-orange-500]="budget.percentage >= 80 && budget.percentage <= 100"
                                [class.text-red-500]="budget.percentage > 100">

                                {{ budget.percentage | number:'1.0-0' }}%
                            </span>

                        </div>

                        <div class="w-full bg-gray-200 dark:bg-surface-700 rounded-full h-2">

                            <div
                                class="h-2 rounded-full transition-all"
                                [style.width.%]="budget.percentage > 100 ? 100 : budget.percentage"
                                [class.bg-green-500]="budget.percentage < 60"
                                [class.bg-yellow-500]="budget.percentage >= 60 && budget.percentage < 80"
                                [class.bg-orange-500]="budget.percentage >= 80 && budget.percentage <= 100"
                                [class.bg-red-500]="budget.percentage > 100">
                            </div>

                        </div>

                        <div class="flex justify-between mt-1 text-xs text-muted-color">

                            <span>
                                {{ budget.spentAmount | currency:'BDT':'symbol':'1.0-0' }}
                            </span>

                            <span>
                                {{ budget.amount | currency:'BDT':'symbol':'1.0-0' }}
                            </span>

                        </div>

                    </div>

                    <p-tag
                        [value]="
                            budget.percentage > 100
                                ? 'Over'
                                : budget.percentage >= 80
                                    ? 'Near'
                                    : 'OK'
                        "
                        [severity]="
                            budget.percentage > 100
                                ? 'danger'
                                : budget.percentage >= 80
                                    ? 'warn'
                                    : 'success'
                        ">
                    </p-tag>

                </div>

            </div>

        }

    </div>

</p-accordion-content>

        </p-accordion-panel>
    }
</p-accordion>
        }
    </div>`,
    styles: [
        `
            :host ::ng-deep .p-accordionpanel {
    border: none !important;
}

:host ::ng-deep .p-accordionheader {
    border: none !important;
    background: transparent !important;
    padding: 0.5rem 0 !important;
}

:host ::ng-deep .p-accordioncontent-content {
    border: none !important;
    padding: 0.5rem 0 0.5rem 1rem !important;
}

:host ::ng-deep .p-accordion {
    border: none !important;
}
:host ::ng-deep .p-accordionheader svg[data-pc-section="toggleicon"],
:host ::ng-deep .p-accordionheader .p-icon {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    visibility: hidden !important;
}
    :host ::ng-deep .p-accordionheader {
    padding-right: 0.75rem !important;
}
    :host ::ng-deep .p-accordionheader-content {
    width: 100%;
}
        `
    ]
})
export class BudgetHealthWidget {
    trackerService = inject(TrackerService);
}
