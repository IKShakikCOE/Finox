import { Component, OnInit, inject, computed, signal } from '@angular/core';
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
        this.trackerService.loadTrackerMetaData();
    }

    setupTable() {
        this.tableCols = [
            { field: 'date', header: 'Date', type: 'date' },
            { field: 'title', header: 'Title' },
            { field: 'amount', header: 'Amount', type: 'currency' },
            { field: 'category', header: 'Category' },
            { field: 'type', header: 'Type', type: 'tag', tagSeverity: (val) => (val === 'INCOME' ? 'success' : 'danger') }
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
            width: '700px',
            fields: [
                {
                    key: 'type',
                    label: 'Transaction Type',
                    type: 'radio',
                    options: [
                        { value: 'EXPENSE', label: 'Expense', labelClass: 'text-red-500 font-semibold' },
                        { value: 'INCOME', label: 'Income', labelClass: 'text-emerald-500 font-semibold' }
                    ],
                    onChange: (_value, formData) => {
                        // Update category options when type changes
                        formData['category'] = '';
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
                    key: 'category',
                    label: 'Category',
                    type: 'select',
                    placeholder: 'Select a Category',
                    options: () => this.getAvailableCategories()
                },
                {
                    key: 'paymentMethod',
                    label: 'Payment Method',
                    type: 'select',
                    placeholder: 'Select Payment Method',
                    options: () => this.trackerService.paymentMethods()
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

    private getAvailableCategories(): string[] {
        return this.formData['type'] === 'INCOME'
            ? this.trackerService.incomeCategories()
            : this.trackerService.expenseCategories();
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
        this.formData = { ...txn };
        this.isNew = false;
        this.dialogConfig = this.buildDialogConfig();
        this.dialogVisible = true;
    }

    deleteTransaction(txn: Transaction) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this entry: ' + txn.title + '?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const updatedTxns = this.trackerService.transactions().filter((val) => val.id !== txn.id);
                this.trackerService.transactions.set(updatedTxns);
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Entry Deleted', life: 3000 });
            }
        });
    }

    deleteSelectedTransactions(selectedItems: any[]) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected transactions?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const updatedTxns = this.trackerService.transactions().filter((val) => !selectedItems.includes(val));
                this.trackerService.transactions.set(updatedTxns);
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transactions Deleted', life: 3000 });
            }
        });
    }

    onDialogSave(event: DialogSaveEvent) {
        const txn = event.data as Transaction;
        const _txns = this.trackerService.transactions();

        // Normalize date if it's a Date object
        if ((txn.date as any) instanceof Date) {
            txn.date = (txn.date as unknown as Date).toISOString().substring(0, 10);
        }

        if (event.isNew) {
            txn.id = 'TXN' + Math.floor(1000 + Math.random() * 9000);
            this.trackerService.transactions.set([txn, ..._txns]);
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transaction Created', life: 3000 });
        } else {
            const index = _txns.findIndex((t) => t.id === txn.id);
            _txns[index] = txn;
            this.trackerService.transactions.set([..._txns]);
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transaction Updated', life: 3000 });
        }
    }
}
