import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';
import { TrackerService } from '../services/tracker.service';
import { Budget } from '../models/tracker.model';
import { DynamicDialogComponent } from '@/app/shared/components/dynamic-dialog.component';
import { DialogConfig, DialogSaveEvent } from '@/app/shared/models/dynamic-table.interface';

@Component({
    selector: 'fx-budgeting',
    standalone: true,
    imports: [CommonModule, FormsModule, ToastModule, ConfirmDialogModule, ButtonModule, TagModule, AccordionModule, DynamicDialogComponent],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
<!-- Header -->
<div class="card mb-4">
    <div class="flex items-center justify-between">
        <h4 class="m-0">Budget Management</h4>
        <p-button
            label="Add Budget"
            icon="pi pi-plus"
            severity="secondary"
            (onClick)="openNew()">
        </p-button>
    </div>

<!-- Summary Cards -->
<div class="grid grid-cols-12 gap-4">

    <!-- Total Allocated -->
    <div class="col-span-12 md:col-span-4">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">
                        Total Allocated
                    </span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                        {{ trackerService.totalBudgetAllocated() | currency:'BDT':'symbol':'1.0-0' }}
                    </div>
                </div>

                <div
                    class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                    style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-wallet text-blue-500 text-xl!"></i>
                </div>
            </div>

            <span class="text-muted-color">Allocated across all budgets</span>
        </div>
    </div>

    <!-- Total Spent -->
    <div class="col-span-12 md:col-span-4">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">
                        Total Spent
                    </span>
                    <div class="text-orange-500 font-medium text-xl">
                        {{ trackerService.totalBudgetSpent() | currency:'BDT':'symbol':'1.0-0' }}
                    </div>
                </div>

                <div
                    class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border"
                    style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-credit-card text-orange-500 text-xl!"></i>
                </div>
            </div>

            <span class="text-muted-color">Expenses recorded</span>
        </div>
    </div>

    <!-- Remaining -->
    <div class="col-span-12 md:col-span-4">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">
                        Remaining
                    </span>

                    <div
                        class="font-medium text-xl"
                        [class.text-green-500]="(trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent()) >= 0"
                        [class.text-red-500]="(trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent()) < 0">

                        {{
                            (trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent())
                            | currency:'BDT':'symbol':'1.0-0'
                        }}
                    </div>
                </div>

                <div
                    class="flex items-center justify-center rounded-border"
                    [ngClass]="{
                        'bg-green-100 dark:bg-green-400/10':
                            (trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent()) >= 0,
                        'bg-red-100 dark:bg-red-400/10':
                            (trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent()) < 0
                    }"
                    style="width: 2.5rem; height: 2.5rem">

                    <i
                        class="pi text-xl!"
                        [ngClass]="{
                            'pi-check-circle text-green-500':
                                (trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent()) >= 0,
                            'pi-exclamation-circle text-red-500':
                                (trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent()) < 0
                        }">
                    </i>
                </div>
            </div>

            <span
                [class.text-green-500]="(trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent()) >= 0"
                [class.text-red-500]="(trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent()) < 0">

                {{
                    (trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent()) >= 0
                        ? 'Within budget'
                        : 'Budget exceeded'
                }}
            </span>
        </div>
    </div>
</div>

</div>
            <!-- Budget Cards -->
            <div class="card">
            <div class="grid grid-cols-12 gap-4">
                <ng-container *ngFor="let group of trackerService.groupedBudgets()">

                    <!-- ═══ Case 1: Parent-only budget (no sub-budgets) ═══ -->
                    <div *ngIf="group.parentBudget && group.subBudgets.length === 0" class="col-span-12 md:col-span-6 lg:col-span-4">
                        <div class="border surface-border border-round p-4 h-full flex flex-col">
                            <div class="flex items-center justify-between mb-3">
                                <h5 class="m-0 inline-flex items-center gap-2">
                                    <span *ngIf="group.parentBudget.category?.color" [style.background-color]="group.parentBudget.category?.color" style="width: 12px; height: 12px; border-radius: 50%; display: inline-block"></span>
                                    <i *ngIf="group.parentBudget.category?.icon" [class]="'pi ' + group.parentBudget.category?.icon" [style.color]="group.parentBudget.category?.color || 'inherit'"></i>
                                    {{ group.parentBudget.categoryName }}
                                </h5>
                                <div class="flex gap-1">
                                    <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" size="small" (onClick)="editBudget(group.parentBudget)" />
                                    <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="deleteBudget(group.parentBudget)" />
                                </div>
                            </div>

                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm text-muted-color">{{ group.parentBudget.period }}</span>
                                <p-tag
                                    *ngIf="group.parentBudget.isOverBudget"
                                    value="Over Budget"
                                    severity="danger"
                                />
                                <p-tag
                                    *ngIf="group.parentBudget.isNearLimit && !group.parentBudget.isOverBudget"
                                    value="Near Limit"
                                    severity="warn"
                                />
                                <p-tag
                                    *ngIf="!group.parentBudget.isOverBudget && !group.parentBudget.isNearLimit"
                                    value="On Track"
                                    severity="success"
                                />
                            </div>

                            <div class="flex items-center justify-between mb-2 text-sm">
                                <span>Spent: <strong class="text-orange-500">{{ group.parentBudget.spent | currency: 'BDT' : 'symbol' : '1.0-0' }}</strong></span>
                                <span>Budget: <strong>{{ group.parentBudget.allocatedAmount | currency: 'BDT' : 'symbol' : '1.0-0' }}</strong></span>
                            </div>

                            <!-- Progress bar -->
                            <div class="mb-2">
                                <div class="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        class="h-3 rounded-full transition-all"
                                        [style.width.%]="group.parentBudget.percentage > 100 ? 100 : group.parentBudget.percentage"
                                        [class.bg-green-500]="group.parentBudget.percentage < 60"
                                        [class.bg-yellow-500]="group.parentBudget.percentage >= 60 && group.parentBudget.percentage < 80"
                                        [class.bg-orange-500]="group.parentBudget.percentage >= 80 && group.parentBudget.percentage <= 100"
                                        [class.bg-red-500]="group.parentBudget.percentage > 100"
                                    ></div>
                                </div>
                            </div>

                            <div class="flex items-center justify-between text-sm">
                                <span class="font-bold" [class.text-red-500]="group.parentBudget.isOverBudget" [class.text-green-500]="!group.parentBudget.isOverBudget">
                                    {{ group.parentBudget.percentage }}% used
                                </span>
                                <span class="text-muted-color">
                                    {{ group.parentBudget.remaining >= 0 ? 'Remaining: ' : 'Exceeded by: ' }}
                                    <strong [class.text-red-500]="group.parentBudget.remaining < 0">{{ (group.parentBudget.remaining < 0 ? -group.parentBudget.remaining : group.parentBudget.remaining) | currency: 'BDT' : 'symbol' : '1.0-0' }}</strong>
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- ═══ Case 2: Sub-category budgets (accordion) ═══ -->
                    <div *ngIf="group.subBudgets.length > 0" class="col-span-12 md:col-span-6 lg:col-span-4">
                        <div class="border surface-border border-round p-4 h-full flex flex-col">
                            <div class="flex items-center justify-between mb-3">
                                <h5 class="m-0 inline-flex items-center gap-2">
                                    <span *ngIf="group.parentCategory?.color" [style.background-color]="group.parentCategory?.color" style="width: 12px; height: 12px; border-radius: 50%; display: inline-block"></span>
                                    <i *ngIf="group.parentCategory?.icon" [class]="'pi ' + group.parentCategory?.icon" [style.color]="group.parentCategory?.color || 'inherit'"></i>
                                    {{ group.parentCategory.name }}
                                </h5>
                            </div>

                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm text-muted-color">{{ group.subPeriods }}</span>
                                <p-tag
                                    *ngIf="group.isOverBudget"
                                    value="Over Budget"
                                    severity="danger"
                                />
                                <p-tag
                                    *ngIf="group.isNearLimit && !group.isOverBudget"
                                    value="Near Limit"
                                    severity="warn"
                                />
                                <p-tag
                                    *ngIf="!group.isOverBudget && !group.isNearLimit"
                                    value="On Track"
                                    severity="success"
                                />
                            </div>

                            <div class="flex items-center justify-between mb-2 text-sm">
                                <span>Spent: <strong class="text-orange-500">{{ group.totalSpent | currency: 'BDT' : 'symbol' : '1.0-0' }}</strong></span>
                                <span>Budget: <strong>{{ group.totalAllocated | currency: 'BDT' : 'symbol' : '1.0-0' }}</strong></span>
                            </div>

                            <!-- Progress bar -->
                            <div class="mb-2">
                                <div class="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        class="h-3 rounded-full transition-all"
                                        [style.width.%]="group.percentage > 100 ? 100 : group.percentage"
                                        [class.bg-green-500]="group.percentage < 60"
                                        [class.bg-yellow-500]="group.percentage >= 60 && group.percentage < 80"
                                        [class.bg-orange-500]="group.percentage >= 80 && group.percentage <= 100"
                                        [class.bg-red-500]="group.percentage > 100"
                                    ></div>
                                </div>
                            </div>

                            <div class="flex items-center justify-between text-sm mb-4">
                                <span class="font-bold" [class.text-red-500]="group.isOverBudget" [class.text-green-500]="!group.isOverBudget">
                                    {{ group.percentage }}% used
                                </span>
                                <span class="text-muted-color">
                                    {{ group.remaining >= 0 ? 'Remaining: ' : 'Exceeded by: ' }}
                                    <strong [class.text-red-500]="group.remaining < 0">{{ (group.remaining < 0 ? -group.remaining : group.remaining) | currency: 'BDT' : 'symbol' : '1.0-0' }}</strong>
                                </span>
                            </div>

                            <p-accordion styleClass="w-full">
                                <p-accordion-panel value="0">
                                    <p-accordion-header>
                                        <span class="text-sm font-semibold">View Sub Budgets</span>
                                        <span class="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full ml-2">{{ group.subBudgets.length }}</span>
                                    </p-accordion-header>
                                    <p-accordion-content>
                                        <div *ngFor="let sub of group.subBudgets" class="mb-3 p-3 surface-ground border-t border-round">
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="text-sm font-medium">{{ sub.categoryName }}</span>
                                                <div class="flex gap-1">
                                                    <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" size="small" (onClick)="editBudget(sub)" />
                                                    <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="deleteBudget(sub)" />
                                                </div>
                                            </div>
                                            <div class="flex items-center justify-between mb-1 text-xs">
                                                <span class="text-muted-color">{{ sub.period }}</span>
                                                <p-tag
                                                    *ngIf="sub.isOverBudget"
                                                    value="Over Budget"
                                                    severity="danger"
                                                />
                                                <p-tag
                                                    *ngIf="sub.isNearLimit && !sub.isOverBudget"
                                                    value="Near Limit"
                                                    severity="warn"
                                                />
                                                <p-tag
                                                    *ngIf="!sub.isOverBudget && !sub.isNearLimit"
                                                    value="On Track"
                                                    severity="success"
                                                />
                                            </div>
                                            <div class="flex items-center justify-between text-xs mb-2">
                                                <span>Spent: <strong class="text-orange-500">{{ sub.spent | currency: 'BDT' : 'symbol' : '1.0-0' }}</strong></span>
                                                <span>Budget: <strong>{{ sub.allocatedAmount | currency: 'BDT' : 'symbol' : '1.0-0' }}</strong></span>
                                            </div>
                                            <div class="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    class="h-2 rounded-full transition-all"
                                                    [style.width.%]="sub.percentage > 100 ? 100 : sub.percentage"
                                                    [class.bg-green-500]="sub.percentage < 60"
                                                    [class.bg-yellow-500]="sub.percentage >= 60 && sub.percentage < 80"
                                                    [class.bg-orange-500]="sub.percentage >= 80 && sub.percentage <= 100"
                                                    [class.bg-red-500]="sub.percentage > 100"
                                                ></div>
                                            </div>
                                            <div class="flex items-center justify-between text-xs mt-1">
                                                <span class="font-bold" [class.text-red-500]="sub.isOverBudget" [class.text-green-500]="!sub.isOverBudget">
                                                    {{ sub.percentage }}% used
                                                </span>
                                                <span class="text-muted-color">
                                                    {{ sub.remaining >= 0 ? 'Remaining: ' : 'Exceeded: ' }}
                                                    <strong [class.text-red-500]="sub.remaining < 0">{{ (sub.remaining < 0 ? -sub.remaining : sub.remaining) | currency: 'BDT' : 'symbol' : '1.0-0' }}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </p-accordion-content>
                                </p-accordion-panel>
                            </p-accordion>
                        </div>
                    </div>

                </ng-container>
            </div>

            <div *ngIf="trackerService.groupedBudgets().length === 0" class="text-center p-6 text-muted-color">
                <i class="pi pi-wallet text-4xl mb-3 block"></i>
                <p class="text-lg">No budgets set yet. Click "Add Budget" to get started.</p>
            </div>
        </div>

        <fx-dynamic-dialog
            [config]="dialogConfig"
            [(visible)]="dialogVisible"
            [formData]="formData"
            [isNew]="isNew"
            (save)="onSave($event)"
        />

        <p-confirmdialog [style]="{ width: '450px' }" />
    `
})
export class BudgetingComponent implements OnInit {
    public trackerService = inject(TrackerService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    dialogVisible = false;
    dialogConfig: DialogConfig = { header: '', fields: [] };
    formData: Record<string, any> = {};
    isNew = true;

    ngOnInit() {
        if (!this.trackerService.transactions().length) {
            this.trackerService.loadAll();
        }
    }

    private buildDialogConfig(): DialogConfig {
        return {
            header: 'Budget Details',
            width: '900px',
            fields: [
                {
                    key: '_parentCategoryId',
                    label: 'Category',
                    type: 'select',
                    required: true,
                    placeholder: 'Select category group',
                    optionLabel: 'name',
                    optionValue: 'id',
                    options: () => this.trackerService.categories()
                        .filter(c => c.type === 'EXPENSE' && (!c.parentId || c.parentId === null)),
                    onChange: (_value, formData) => {
                        formData['categoryId'] = '';
                    },
                    colSpan: 6
                },
                {
                    key: 'categoryId',
                    label: 'Sub-category (Optional)',
                    type: 'dependent-select',
                    required: false,
                    placeholder: 'Leave blank for overall limit',
                    optionLabel: 'name',
                    optionValue: 'id',
                    dependentOptions: (formData) => {
                        const parentId = formData['_parentCategoryId'];
                        if (!parentId) return [];
                        const parent = this.trackerService.categories().find(c => c.id === parentId);
                        return parent?.children || [];
                    },
                    colSpan: 6
                },
                {
                    key: 'allocatedAmount',
                    label: 'Budget Amount',
                    type: 'currency',
                    currency: 'BDT',
                    locale: 'en-BD',
                    required: true,
                    colSpan: 6
                },
                {
                    key: 'period',
                    label: 'Period',
                    type: 'select',
                    required: true,
                    options: ['MONTHLY', 'WEEKLY', 'YEARLY', 'CUSTOM'],
                    placeholder: 'Select period',
                    colSpan: 6
                },
                {
                    key: 'alertThreshold',
                    label: 'Alert at (%)',
                    type: 'number',
                    placeholder: 'e.g., 80'
                }
            ]
        };
    }

    openNew() {
        this.formData = { period: 'MONTHLY', alertThreshold: 80 };
        this.isNew = true;
        this.dialogConfig = this.buildDialogConfig();
        this.dialogVisible = true;
    }

    editBudget(budget: any) {
        // Derive parent from category's parentId for the two-field picker
        const parentId = budget.category?.parentId || budget.categoryId;
        this.formData = { ...budget, _parentCategoryId: parentId || '' };
        this.isNew = false;
        this.dialogConfig = this.buildDialogConfig();
        this.dialogVisible = true;
    }

    deleteBudget(budget: any) {
        this.confirmationService.confirm({
            message: `Delete budget for "${budget.categoryName}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const success = await this.trackerService.deleteBudget(budget.id);
                this.messageService.add(success
                    ? { severity: 'success', summary: 'Deleted', detail: 'Budget removed', life: 3000 }
                    : { severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
            }
        });
    }

    async onSave(event: DialogSaveEvent) {
        const budget = event.data as any;

        // If sub-category not selected, fall back to parent category
        if (!budget.categoryId && budget._parentCategoryId) {
            budget.categoryId = budget._parentCategoryId;
        }

        // Remove temp UI-only fields
        delete budget._parentCategoryId;
        delete budget.category;
        delete budget.categoryName;
        delete budget.spent;
        delete budget.remaining;
        delete budget.percentage;
        delete budget.isOverBudget;
        delete budget.isNearLimit;

        if (event.isNew) {
            const created = await this.trackerService.addBudget(budget);
            this.messageService.add(created
                ? { severity: 'success', summary: 'Created', detail: 'Budget added', life: 3000 }
                : { severity: 'error', summary: 'Error', detail: 'Failed to create', life: 3000 });
        } else {
            const updated = await this.trackerService.updateBudget(budget.id!, budget);
            this.messageService.add(updated
                ? { severity: 'success', summary: 'Updated', detail: 'Budget updated', life: 3000 }
                : { severity: 'error', summary: 'Error', detail: 'Failed to update', life: 3000 });
        }
    }
}
