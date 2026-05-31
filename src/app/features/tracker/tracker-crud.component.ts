import { Component, OnInit, inject, computed, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TrackerService } from './services/tracker.service';
import { Transaction } from './models/tracker.model';
import { DynamicTableComponent } from '@/app/shared/components/dynamic-table.component';
import { DynamicDialogComponent } from '@/app/shared/components/dynamic-dialog.component';
import { DialogConfig, DialogSaveEvent, TableActionClickEvent, TableColumn, TableSettings } from '@/app/shared/models/dynamic-table.interface';

@Component({
    selector: 'fx-tracker-crud',
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

        <div class="card" *ngIf="tableSettings && tableSettings.title">
            <h4 class="mt-0 mb-4">{{ tableSettings.title }}</h4>

            <fx-dynamic-table
                #fxTable
                [data]="filteredTransactions()"
                [settings]="tableSettings"
                [hideTitle]="true"
                (addClick)="openNew()"
                (bulkDeleteClick)="deleteSelectedTransactions($event)"
                (actionClick)="handleTableAction($event)"
            >
                <div filter class="flex items-center gap-3">
                    <div class="flex items-center gap-2">
                        <p-radiobutton inputId="filterAll" name="typeFilter" value="ALL" [(ngModel)]="typeFilter" (onClick)="onFilterChange()" />
                        <label for="filterAll" class="font-semibold">All</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-radiobutton inputId="filterExpense" name="typeFilter" value="EXPENSE" [(ngModel)]="typeFilter" (onClick)="onFilterChange()" />
                        <label for="filterExpense" class="text-red-500 font-semibold">Expense</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-radiobutton inputId="filterIncome" name="typeFilter" value="INCOME" [(ngModel)]="typeFilter" (onClick)="onFilterChange()" />
                        <label for="filterIncome" class="text-emerald-500 font-semibold">Income</label>
                    </div>
                </div>
            </fx-dynamic-table>
        </div>

        <fx-dynamic-dialog
            [config]="dialogConfig"
            [(visible)]="dialogVisible"
            [formData]="formData"
            [isNew]="isNew"
            (save)="onDialogSave($event)"
        />

        <p-confirmdialog [style]="{ width: '450px' }" />
    `
})
export class TrackerCrudComponent implements OnInit {
    public trackerService = inject(TrackerService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    @ViewChild('fxTable') fxTable!: DynamicTableComponent;

    tableCols: TableColumn[] = [];
    tableSettings: TableSettings = { endpoint: '' };

    dialogVisible: boolean = false;
    dialogConfig: DialogConfig = { header: '', fields: [] };
    formData: Record<string, any> = {};
    isNew: boolean = true;

    private _typeFilter = signal<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    typeFilter: 'ALL' | 'INCOME' | 'EXPENSE' = 'ALL';

    filteredTransactions = computed(() => {
        const all = this.trackerService.transactions();
        const filter = this._typeFilter();
        if (filter === 'ALL') return all;
        return all.filter(t => t.type === filter);
    });

    onFilterChange() {
        this._typeFilter.set(this.typeFilter);
    }

    ngOnInit() {
        this.setupTable();
        this.trackerService.loadAll();
    }

    setupTable() {
        this.tableCols = [
            { field: 'date', header: 'Date', type: 'date' },
            { field: 'title', header: 'Title' },
            { field: 'amount', header: 'Amount', type: 'currency' },
            { field: 'category', header: 'Category', type: 'category' },
            { field: 'type', header: 'Type', type: 'tag', tagSeverity: (val) => (val === 'INCOME' ? 'success' : 'danger') },
            { field: 'remarks', header: 'Remarks' }
        ];

        this.tableSettings = {
            endpoint: '/api/transactions',
            title: 'Financial Statements Ledger',
            dataKey: 'id',
            columns: this.tableCols,
            actions: [
                { show: true, label: 'Edit', icon: 'pi pi-pencil', severity: 'info', action: 'edit' },
                { show: true, label: 'Delete', icon: 'pi pi-trash', severity: 'danger', action: 'delete' }
            ],
            features: {
                add: true,
                action: true,
                bulkDelete: true,
                export: true,
                selection: true,
                pagination: {
                    show: true,
                    rowsPerPageOptions: [5, 10, 25],
                    defaultRowsPerPage: 10
                },
                search: {
                    show: true,
                    placeholder: 'Search transactions...',
                    globalFilterFields: ['title', 'category']
                }
            }
        };
    }

    private buildDialogConfig(): DialogConfig {
        return {
            header: 'Transaction Details',
            width: '900px',
            fields: [
                {
                    key: 'type',
                    label: 'Transaction Type',
                    type: 'radio',
                    options: [
                        { value: 'EXPENSE', label: 'Expense', labelClass: 'text-red-500 font-semibold' },
                        { value: 'INCOME', label: 'Income', labelClass: 'text-emerald-500 font-semibold' },
                        { value: 'TRANSFER', label: 'Transfer', labelClass: 'text-blue-500 font-semibold' }
                    ],
                    onChange: (_value, formData) => {
                        formData['_parentCategoryId'] = '';
                        formData['categoryId'] = '';
                    }
                },
                {
                    key: 'title',
                    label: 'Title',
                    type: 'text',
                    placeholder: 'e.g., Office Salary',
                    required: true
                },
                {
                    key: 'amount',
                    label: 'Amount',
                    type: 'currency',
                    currency: 'BDT',
                    locale: 'en-BD',
                    required: true,
                    colSpan: 6
                },
                {
                    key: 'date',
                    label: 'Date',
                    type: 'date',
                    dateFormat: 'yy-mm-dd',
                    showIcon: true,
                    colSpan: 6
                },
                {
                    key: '_parentCategoryId',
                    label: 'Category',
                    type: 'select',
                    placeholder: 'Select Category',
                    optionLabel: 'name',
                    optionValue: 'id',
                    options: () => this.getParentCategories(),
                    onChange: (_value, formData) => {
                        formData['categoryId'] = ''; // Reset sub-category when parent changes
                    },
                    colSpan: 6
                },
                {
                    key: 'categoryId',
                    label: 'Sub-category',
                    type: 'dependent-select',
                    placeholder: 'Select Sub-category',
                    optionLabel: 'name',
                    optionValue: 'id',
                    dependentOptions: (formData) => this.getChildCategories(formData['_parentCategoryId']),
                    colSpan: 6
                },
                {
                    key: 'paymentMethod',
                    label: 'Payment Method',
                    type: 'select',
                    placeholder: 'Select Payment Method',
                    options: ['CASH', 'BANK', 'MOBILE_BANKING', 'CREDIT_CARD'],
                    colSpan: 6
                },
                {
                    key: 'remarks',
                    label: 'Remarks',
                    type: 'textarea',
                    placeholder: 'Optional notes...'
                }
            ]
        };
    }

    /** Returns parent categories filtered by the current transaction type */
    private getParentCategories(): any[] {
        const type = this.formData['type'] || 'EXPENSE';
        return this.trackerService.categories()
            .filter(c => c.type === type && (!c.parentId || c.parentId === null));
    }

    /** Returns child categories for a given parent */
    private getChildCategories(parentId: string): any[] {
        if (!parentId) return [];
        const parent = this.trackerService.categories().find(c => c.id === parentId);
        return parent?.children || [];
    }

    handleTableAction(event: TableActionClickEvent) {
        switch (event.action) {
            case 'edit':
                this.editTransaction(event.data);
                break;
            case 'delete':
                this.deleteTransaction(event.data);
                break;
        }
    }

    openNew() {
        this.formData = {
            type: 'EXPENSE',
            date: new Date().toISOString().substring(0, 10),
            paymentMethod: this.trackerService.paymentMethods()[0] || 'CASH'
        };
        this.isNew = true;
        this.dialogConfig = this.buildDialogConfig();
        this.dialogVisible = true;
    }

    editTransaction(txn: Transaction) {
        // Derive parent category from the child's parentId for the two-field picker
        const parentId = txn.category?.parentId || txn.categoryId;
        this.formData = { ...txn, _parentCategoryId: parentId || '' };
        this.isNew = false;
        this.dialogConfig = this.buildDialogConfig();
        this.dialogVisible = true;
    }

    deleteTransaction(txn: Transaction) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this entry: ' + txn.title + '?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const success = await this.trackerService.deleteTransaction(txn.id!);
                if (success) {
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Entry Deleted', life: 3000 });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
                }
            }
        });
    }

    deleteSelectedTransactions(selectedItems: any[]) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected transactions?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const ids = selectedItems.map(item => item.id);
                const success = await this.trackerService.bulkDeleteTransactions(ids);
                if (success) {
                    this.fxTable?.clearSelection();
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transactions Deleted', life: 3000 });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
                }
            }
        });
    }

    async onDialogSave(event: DialogSaveEvent) {
        const txn = event.data as any;

        // Normalize date if it's a Date object
        if ((txn.date as any) instanceof Date) {
            txn.date = (txn.date as unknown as Date).toISOString().substring(0, 10);
        }

        // If sub-category not selected, fall back to parent category
        if (!txn.categoryId && txn._parentCategoryId) {
            txn.categoryId = txn._parentCategoryId;
        }

        // Remove temp UI-only fields before sending to API
        delete txn._parentCategoryId;
        delete txn.category; // Remove navigation object, API only needs categoryId

        if (event.isNew) {
            const created = await this.trackerService.addTransaction(txn);
            if (created) {
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transaction Created', life: 3000 });
            } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create', life: 3000 });
            }
        } else {
            const updated = await this.trackerService.updateTransaction(txn.id!, txn);
            if (updated) {
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transaction Updated', life: 3000 });
            } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update', life: 3000 });
            }
        }
    }
}
