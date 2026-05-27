import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TrackerService } from '../services/tracker.service';
import { Category } from '../models/tracker.model';
import { DynamicTableComponent } from '@/app/shared/components/dynamic-table.component';
import { DynamicDialogComponent } from '@/app/shared/components/dynamic-dialog.component';
import { DialogConfig, DialogSaveEvent, TableActionClickEvent, TableColumn, TableSettings } from '@/app/shared/models/dynamic-table.interface';

@Component({
    selector: 'fx-category-management',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ToastModule,
        ConfirmDialogModule,
        RadioButtonModule,
        DynamicTableComponent,
        DynamicDialogComponent
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />

        <div class="card">
            <h4 class="mt-0 mb-4">Category Management</h4>

            <fx-dynamic-table
                [data]="filteredCategories()"
                [settings]="tableSettings"
                [hideTitle]="true"
                (addClick)="openNew()"
                (bulkDeleteClick)="deleteSelected($event)"
                (actionClick)="handleAction($event)"
            >
                <div filter class="flex items-center gap-3">
                    <div class="flex items-center gap-2">
                        <p-radiobutton inputId="catAll" name="catFilter" value="ALL" [(ngModel)]="catFilter" (onClick)="onFilterChange()" />
                        <label for="catAll" class="font-semibold">All</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-radiobutton inputId="catExpense" name="catFilter" value="EXPENSE" [(ngModel)]="catFilter" (onClick)="onFilterChange()" />
                        <label for="catExpense" class="text-red-500 font-semibold">Expense</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-radiobutton inputId="catIncome" name="catFilter" value="INCOME" [(ngModel)]="catFilter" (onClick)="onFilterChange()" />
                        <label for="catIncome" class="text-emerald-500 font-semibold">Income</label>
                    </div>
                </div>
            </fx-dynamic-table>
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
export class CategoryManagementComponent implements OnInit {
    public trackerService = inject(TrackerService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    tableSettings: TableSettings = { endpoint: '' };
    dialogVisible = false;
    dialogConfig: DialogConfig = { header: '', fields: [] };
    formData: Record<string, any> = {};
    isNew = true;

    private _catFilter = signal<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    catFilter: 'ALL' | 'INCOME' | 'EXPENSE' = 'ALL';

    filteredCategories = computed(() => {
        const all = this.trackerService.categories();
        const filter = this._catFilter();
        if (filter === 'ALL') return all;
        return all.filter(c => c.type === filter);
    });

    onFilterChange() {
        this._catFilter.set(this.catFilter);
    }

    ngOnInit() {
        this.setupTable();
        if (!this.trackerService.categories().length) {
            this.trackerService.loadTrackerMetaData();
        }
    }

    setupTable() {
        const cols: TableColumn[] = [
            { field: 'name', header: 'Category Name' },
            { field: 'type', header: 'Type', type: 'tag', tagSeverity: (val) => (val === 'INCOME' ? 'success' : 'danger') },
            { field: 'color', header: 'Color' }
        ];

        this.tableSettings = {
            endpoint: '/api/categories',
            title: 'Category Management',
            dataKey: 'id',
            columns: cols,
            actions: [
                { show: true, label: 'Edit', icon: 'pi pi-pencil', severity: 'info', action: 'edit' },
                { show: true, label: 'Delete', icon: 'pi pi-trash', severity: 'danger', action: 'delete' }
            ],
            features: {
                add: true,
                action: true,
                bulkDelete: true,
                export: false,
                selection: true,
                pagination: { show: true, rowsPerPageOptions: [10, 25, 50], defaultRowsPerPage: 10 },
                search: { show: true, placeholder: 'Search categories...', globalFilterFields: ['name', 'type'] }
            }
        };
    }

    private buildDialogConfig(): DialogConfig {
        return {
            header: 'Category Details',
            width: '500px',
            fields: [
                {
                    key: 'name',
                    label: 'Category Name',
                    type: 'text',
                    placeholder: 'e.g., Food & Grocery',
                    required: true
                },
                {
                    key: 'type',
                    label: 'Category Type',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: 'EXPENSE', label: 'Expense', labelClass: 'text-red-500 font-semibold' },
                        { value: 'INCOME', label: 'Income', labelClass: 'text-emerald-500 font-semibold' }
                    ]
                },
                {
                    key: 'color',
                    label: 'Color Code',
                    type: 'text',
                    placeholder: '#FF5733'
                }
            ]
        };
    }

    handleAction(event: TableActionClickEvent) {
        if (event.action === 'edit') {
            this.formData = { ...event.data };
            this.isNew = false;
            this.dialogConfig = this.buildDialogConfig();
            this.dialogVisible = true;
        } else if (event.action === 'delete') {
            this.confirmationService.confirm({
                message: `Delete category "${event.data.name}"?`,
                header: 'Confirm Delete',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.trackerService.deleteCategory(event.data.id);
                    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Category removed', life: 3000 });
                }
            });
        }
    }

    openNew() {
        this.formData = { type: 'EXPENSE' };
        this.isNew = true;
        this.dialogConfig = this.buildDialogConfig();
        this.dialogVisible = true;
    }

    deleteSelected(items: any[]) {
        this.confirmationService.confirm({
            message: `Delete ${items.length} selected categories?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                items.forEach(item => this.trackerService.deleteCategory(item.id));
                this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Categories removed', life: 3000 });
            }
        });
    }

    onSave(event: DialogSaveEvent) {
        const cat = event.data as Category;
        if (event.isNew) {
            this.trackerService.addCategory(cat);
            this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Category added', life: 3000 });
        } else {
            this.trackerService.updateCategory(cat);
            this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Category updated', life: 3000 });
        }
    }
}
