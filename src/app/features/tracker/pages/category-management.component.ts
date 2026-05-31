import { Component, OnInit, inject, computed, signal, ViewChild } from '@angular/core';
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
                #fxTable
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
                    <div class="flex items-center gap-2">
                        <p-radiobutton inputId="catTransfer" name="catFilter" value="TRANSFER" [(ngModel)]="catFilter" (onClick)="onFilterChange()" />
                        <label for="catTransfer" class="text-blue-500 font-semibold">Transfer</label>
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

    @ViewChild('fxTable') fxTable!: DynamicTableComponent;

    tableSettings: TableSettings = { endpoint: '' };
    dialogVisible = false;
    dialogConfig: DialogConfig = { header: '', fields: [] };
    formData: Record<string, any> = {};
    isNew = true;

    private _catFilter = signal<'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER'>('ALL');
    catFilter: 'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER' = 'ALL';

    filteredCategories = computed(() => {
        const all = this.trackerService.categoriesFlat();
        const filter = this._catFilter();
        if (filter === 'ALL') return all;
        return all.filter(c => c.type === filter);
    });

    onFilterChange() {
        this._catFilter.set(this.catFilter);
    }

    ngOnInit() {
        this.setupTable();
        if (!this.trackerService.categoriesFlat().length) {
            this.trackerService.loadCategories();
            this.trackerService.loadCategoriesFlat();
        }
    }

    setupTable() {
        const cols: TableColumn[] = [
            { field: 'name', header: 'Category', type: 'category' },
            { field: 'type', header: 'Type', type: 'tag', tagSeverity: (val) => (val === 'INCOME' ? 'success' : val === 'TRANSFER' ? 'info' : 'danger') },
            { field: 'parent.name', header: 'Parent' },
            { field: 'color', header: 'Color', type: 'color' },
            { field: 'sortOrder', header: 'Order' }
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
            width: '900px',
            fields: [
                {
                    key: 'name',
                    label: 'Category Name',
                    type: 'text',
                    placeholder: 'e.g., Groceries',
                    required: true,
                    colSpan: 6
                },
                {
                    key: 'type',
                    label: 'Category Type',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: 'EXPENSE', label: 'Expense', labelClass: 'text-red-500 font-semibold' },
                        { value: 'INCOME', label: 'Income', labelClass: 'text-emerald-500 font-semibold' },
                        { value: 'TRANSFER', label: 'Transfer', labelClass: 'text-blue-500 font-semibold' }
                    ]
                },
                {
                    key: 'parentId',
                    label: 'Parent Category (optional)',
                    type: 'select',
                    placeholder: 'None (top-level)',
                    optionLabel: 'name',
                    optionValue: 'id',
                    options: () => this.trackerService.categories()
                        .filter(c => !c.parentId || c.parentId === null)
                },
                {
                    key: 'icon',
                    label: 'Icon',
                    type: 'select',
                    placeholder: 'Search icon...',
                    filter: true,
                    options: [
                        'pi-shopping-cart', 'pi-car', 'pi-home', 'pi-heart', 'pi-book',
                        'pi-wallet', 'pi-credit-card', 'pi-gift', 'pi-briefcase', 'pi-building',
                        'pi-bolt', 'pi-globe', 'pi-users', 'pi-chart-line', 'pi-chart-bar',
                        'pi-dollar', 'pi-calculator', 'pi-shield', 'pi-star', 'pi-play',
                        'pi-send', 'pi-desktop', 'pi-mobile', 'pi-wifi', 'pi-wrench',
                        'pi-truck', 'pi-tag', 'pi-calendar', 'pi-clock', 'pi-cog',
                        'pi-code', 'pi-pencil', 'pi-palette', 'pi-video', 'pi-box',
                        'pi-map', 'pi-directions', 'pi-sun', 'pi-cloud', 'pi-plus-circle',
                        'pi-exclamation-triangle', 'pi-ellipsis-h', 'pi-question', 'pi-id-card',
                        'pi-percentage', 'pi-replay', 'pi-arrow-up', 'pi-chart-pie', 'pi-comments'
                    ],
                    colSpan: 6
                },
                {
                    key: 'color',
                    label: 'Color',
                    type: 'color',
                    colSpan: 6
                },
                {
                    key: 'sortOrder',
                    label: 'Sort Order',
                    type: 'number',
                    placeholder: '0',
                    min: 0,
                    max: 999,
                    colSpan: 6
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
                accept: async () => {
                    const success = await this.trackerService.deleteCategory(event.data.id);
                    this.messageService.add(success
                        ? { severity: 'success', summary: 'Deleted', detail: 'Category removed', life: 3000 }
                        : { severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
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
            accept: async () => {
                const ids = items.map(item => item.id);
                const success = await this.trackerService.bulkDeleteCategories(ids);
                if (success) this.fxTable?.clearSelection();
                this.messageService.add(success
                    ? { severity: 'success', summary: 'Deleted', detail: 'Categories removed', life: 3000 }
                    : { severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
            }
        });
    }

    async onSave(event: DialogSaveEvent) {
        const cat = event.data as Category;
        if (event.isNew) {
            const created = await this.trackerService.addCategory(cat);
            this.messageService.add(created
                ? { severity: 'success', summary: 'Created', detail: 'Category added', life: 3000 }
                : { severity: 'error', summary: 'Error', detail: 'Failed to create', life: 3000 });
        } else {
            const updated = await this.trackerService.updateCategory(cat.id!, cat);
            this.messageService.add(updated
                ? { severity: 'success', summary: 'Updated', detail: 'Category updated', life: 3000 }
                : { severity: 'error', summary: 'Error', detail: 'Failed to update', life: 3000 });
        }
    }
}
