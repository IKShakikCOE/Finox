import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TrackerService } from '../services/tracker.service';
import { Budget } from '../models/tracker.model';
import { DynamicDialogComponent } from '@/app/shared/components/dynamic-dialog.component';
import { DialogConfig, DialogSaveEvent } from '@/app/shared/models/dynamic-table.interface';

@Component({
    selector: 'fx-budgeting',
    standalone: true,
    imports: [CommonModule, FormsModule, ToastModule, ConfirmDialogModule, ButtonModule, TagModule, DynamicDialogComponent],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />

        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">Budget Management</h4>
                <p-button label="Add Budget" icon="pi pi-plus" severity="secondary" (onClick)="openNew()" />
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-12 gap-4 mb-6">
                <div class="col-span-12 md:col-span-4">
                    <div class="p-4 border-round surface-ground">
                        <span class="block text-muted-color font-medium mb-2">Total Allocated</span>
                        <div class="text-2xl font-bold">{{ trackerService.totalBudgetAllocated() | currency: 'BDT' : 'symbol' : '1.0-0' }}</div>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <div class="p-4 border-round surface-ground">
                        <span class="block text-muted-color font-medium mb-2">Total Spent</span>
                        <div class="text-2xl font-bold text-orange-500">{{ trackerService.totalBudgetSpent() | currency: 'BDT' : 'symbol' : '1.0-0' }}</div>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <div class="p-4 border-round surface-ground">
                        <span class="block text-muted-color font-medium mb-2">Remaining</span>
                        <div class="text-2xl font-bold" [class.text-green-500]="(trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent()) >= 0" [class.text-red-500]="(trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent()) < 0">
                            {{ (trackerService.totalBudgetAllocated() - trackerService.totalBudgetSpent()) | currency: 'BDT' : 'symbol' : '1.0-0' }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Budget Cards -->
            <div class="grid grid-cols-12 gap-4">
                <div *ngFor="let item of trackerService.budgetVsActual()" class="col-span-12 md:col-span-6 lg:col-span-4">
                    <div class="border surface-border border-round p-4 h-full flex flex-col">
                        <div class="flex items-center justify-between mb-3">
                            <h5 class="m-0">{{ item.category }}</h5>
                            <div class="flex gap-1">
                                <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" size="small" (onClick)="editBudget(item)" />
                                <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="deleteBudget(item)" />
                            </div>
                        </div>

                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm text-muted-color">{{ item.period }}</span>
                            <p-tag
                                *ngIf="item.isOverBudget"
                                value="Over Budget"
                                severity="danger"
                            />
                            <p-tag
                                *ngIf="item.isNearLimit && !item.isOverBudget"
                                value="Near Limit"
                                severity="warn"
                            />
                            <p-tag
                                *ngIf="!item.isOverBudget && !item.isNearLimit"
                                value="On Track"
                                severity="success"
                            />
                        </div>

                        <div class="flex items-center justify-between mb-2 text-sm">
                            <span>Spent: <strong class="text-orange-500">{{ item.spent | currency: 'BDT' : 'symbol' : '1.0-0' }}</strong></span>
                            <span>Budget: <strong>{{ item.allocatedAmount | currency: 'BDT' : 'symbol' : '1.0-0' }}</strong></span>
                        </div>

                        <!-- Progress bar -->
                        <div class="mb-2">
                            <div class="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    class="h-3 rounded-full transition-all"
                                    [style.width.%]="item.percentage > 100 ? 100 : item.percentage"
                                    [class.bg-green-500]="item.percentage < 60"
                                    [class.bg-yellow-500]="item.percentage >= 60 && item.percentage < 80"
                                    [class.bg-orange-500]="item.percentage >= 80 && item.percentage <= 100"
                                    [class.bg-red-500]="item.percentage > 100"
                                ></div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between text-sm">
                            <span class="font-bold" [class.text-red-500]="item.isOverBudget" [class.text-green-500]="!item.isOverBudget">
                                {{ item.percentage }}% used
                            </span>
                            <span class="text-muted-color">
                                {{ item.remaining >= 0 ? 'Remaining: ' : 'Exceeded by: ' }}
                                <strong [class.text-red-500]="item.remaining < 0">{{ (item.remaining < 0 ? -item.remaining : item.remaining) | currency: 'BDT' : 'symbol' : '1.0-0' }}</strong>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div *ngIf="trackerService.budgetVsActual().length === 0" class="text-center p-6 text-muted-color">
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
            this.trackerService.loadTrackerMetaData();
        }
    }

    private buildDialogConfig(): DialogConfig {
        return {
            header: 'Budget Details',
            width: '500px',
            fields: [
                {
                    key: 'category',
                    label: 'Category',
                    type: 'select',
                    required: true,
                    placeholder: 'Select expense category',
                    options: () => this.trackerService.expenseCategories()
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
        this.formData = { ...budget };
        this.isNew = false;
        this.dialogConfig = this.buildDialogConfig();
        this.dialogVisible = true;
    }

    deleteBudget(budget: any) {
        this.confirmationService.confirm({
            message: `Delete budget for "${budget.category}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.trackerService.deleteBudget(budget.id);
                this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Budget removed', life: 3000 });
            }
        });
    }

    onSave(event: DialogSaveEvent) {
        const budget = event.data as Budget;
        if (event.isNew) {
            this.trackerService.addBudget(budget);
            this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Budget added', life: 3000 });
        } else {
            this.trackerService.updateBudget(budget);
            this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Budget updated', life: 3000 });
        }
    }
}
