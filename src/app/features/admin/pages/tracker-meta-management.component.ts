import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { AdminService } from '../services/admin.service';
import { TrackerMetaAdmin } from '../models/admin.model';

@Component({
    selector: 'fx-tracker-meta-management',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ToastModule,
        ButtonModule, InputTextModule, CardModule, ChipModule
    ],
    providers: [MessageService],
    template: `
        <p-toast />
        <div class="card">
            <h4 class="mt-0 mb-4">Tracker Metadata Management</h4>
            <p class="text-surface-500 mb-6">
                Manage payment methods and category lists used across the Tracker module.
            </p>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Payment Methods -->
                <div class="card surface-ground p-4">
                    <h5 class="mb-4">Payment Methods</h5>
                    <div class="flex flex-wrap gap-2 mb-4">
                        @for (method of meta()?.paymentMethods || []; track method) {
                            <p-chip [label]="method" [removable]="true" (onRemove)="removeItem('paymentMethods', method)" />
                        }
                    </div>
                    <div class="flex gap-2">
                        <input pInputText [(ngModel)]="newPaymentMethod" placeholder="New method..." class="flex-1" (keyup.enter)="addItem('paymentMethods', newPaymentMethod); newPaymentMethod = ''" />
                        <button pButton icon="pi pi-plus" class="p-button-sm" (click)="addItem('paymentMethods', newPaymentMethod); newPaymentMethod = ''"></button>
                    </div>
                </div>

                <!-- Income Categories -->
                <div class="card surface-ground p-4">
                    <h5 class="mb-4">Income Categories</h5>
                    <div class="flex flex-wrap gap-2 mb-4">
                        @for (cat of meta()?.incomeCategories || []; track cat) {
                            <p-chip [label]="cat" [removable]="true" (onRemove)="removeItem('incomeCategories', cat)" />
                        }
                    </div>
                    <div class="flex gap-2">
                        <input pInputText [(ngModel)]="newIncomeCategory" placeholder="New category..." class="flex-1" (keyup.enter)="addItem('incomeCategories', newIncomeCategory); newIncomeCategory = ''" />
                        <button pButton icon="pi pi-plus" class="p-button-sm" (click)="addItem('incomeCategories', newIncomeCategory); newIncomeCategory = ''"></button>
                    </div>
                </div>

                <!-- Expense Categories -->
                <div class="card surface-ground p-4">
                    <h5 class="mb-4">Expense Categories</h5>
                    <div class="flex flex-wrap gap-2 mb-4">
                        @for (cat of meta()?.expenseCategories || []; track cat) {
                            <p-chip [label]="cat" [removable]="true" (onRemove)="removeItem('expenseCategories', cat)" />
                        }
                    </div>
                    <div class="flex gap-2">
                        <input pInputText [(ngModel)]="newExpenseCategory" placeholder="New category..." class="flex-1" (keyup.enter)="addItem('expenseCategories', newExpenseCategory); newExpenseCategory = ''" />
                        <button pButton icon="pi pi-plus" class="p-button-sm" (click)="addItem('expenseCategories', newExpenseCategory); newExpenseCategory = ''"></button>
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-6">
                <button pButton label="Save Changes" icon="pi pi-save" (click)="save()"></button>
            </div>
        </div>
    `
})
export class TrackerMetaManagementComponent implements OnInit {
    private adminService = inject(AdminService);
    private messageService = inject(MessageService);

    meta = signal<TrackerMetaAdmin | null>(null);
    newPaymentMethod = '';
    newIncomeCategory = '';
    newExpenseCategory = '';

    ngOnInit() {
        this.loadMeta();
    }

    async loadMeta() {
        await this.adminService.loadTrackerMeta();
        this.meta.set(this.adminService.trackerMeta());
    }

    addItem(field: keyof TrackerMetaAdmin, value: string) {
        if (!value?.trim()) return;
        const current = this.meta();
        if (!current) return;
        const list = [...(current[field] as string[])];
        if (!list.includes(value.trim())) {
            list.push(value.trim());
            this.meta.set({ ...current, [field]: list });
        }
    }

    removeItem(field: keyof TrackerMetaAdmin, value: string) {
        const current = this.meta();
        if (!current) return;
        const list = (current[field] as string[]).filter(i => i !== value);
        this.meta.set({ ...current, [field]: list });
    }

    async save() {
        const current = this.meta();
        if (!current) return;
        const success = await this.adminService.updateTrackerMeta(current);
        if (success) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tracker metadata updated', life: 3000 });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update metadata', life: 3000 });
        }
    }
}
