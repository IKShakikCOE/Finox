import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TrackerService } from '../services/tracker.service';
import { Account } from '../models/tracker.model';
import { DynamicTableComponent } from '@/app/shared/components/dynamic-table.component';
import { DynamicDialogComponent } from '@/app/shared/components/dynamic-dialog.component';
import { DialogConfig, DialogSaveEvent, TableActionClickEvent, TableColumn, TableSettings } from '@/app/shared/models/dynamic-table.interface';

@Component({
    selector: 'fx-account-management',
    standalone: true,
    imports: [
        CommonModule,
        ToastModule,
        ConfirmDialogModule,
        DynamicTableComponent,
        DynamicDialogComponent
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />

        <div class="card">
            <fx-dynamic-table
                #fxTable
                [data]="trackerService.accounts()"
                [settings]="tableSettings"
                (addClick)="openNew()"
                (bulkDeleteClick)="deleteSelected($event)"
                (actionClick)="handleAction($event)"
            />
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
export class AccountManagementComponent implements OnInit {
    public trackerService = inject(TrackerService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    @ViewChild('fxTable') fxTable!: DynamicTableComponent;

    tableSettings: TableSettings = { endpoint: '' };
    dialogVisible = false;
    dialogConfig: DialogConfig = { header: '', fields: [] };
    formData: Record<string, any> = {};
    isNew = true;

    ngOnInit() {
        this.setupTable();
        if (!this.trackerService.accounts().length) {
            this.trackerService.loadAccounts();
        }
    }

    setupTable() {
        const cols: TableColumn[] = [
            { field: 'name', header: 'Account Name' },
            { field: 'type', header: 'Type', type: 'tag', tagSeverity: () => 'info' },
            { field: 'balance', header: 'Balance', type: 'currency' },
            { field: 'currency', header: 'Currency' }
        ];

        this.tableSettings = {
            endpoint: '/api/accounts',
            title: 'Account Management',
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
                pagination: { show: true, rowsPerPageOptions: [10, 25], defaultRowsPerPage: 10 },
                search: { show: true, placeholder: 'Search accounts...', globalFilterFields: ['name', 'type'] }
            }
        };
    }

    private buildDialogConfig(): DialogConfig {
        return {
            header: 'Account Details',
            width: '900px',
            fields: [
                {
                    key: 'name',
                    label: 'Account Name',
                    type: 'text',
                    placeholder: 'e.g., DBBL Savings',
                    required: true
                },
                {
                    key: 'type',
                    label: 'Account Type',
                    type: 'select',
                    required: true,
                    options: ['CASH', 'BANK', 'CREDIT_CARD', 'MOBILE_BANKING'],
                    placeholder: 'Select account type'
                },
                {
                    key: 'balance',
                    label: 'Current Balance',
                    type: 'currency',
                    currency: 'BDT',
                    locale: 'en-BD',
                    required: true,
                    colSpan: 6
                },
                {
                    key: 'currency',
                    label: 'Currency',
                    type: 'select',
                    options: ['BDT', 'USD', 'EUR', 'GBP'],
                    placeholder: 'Select currency',
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
                message: `Delete account "${event.data.name}"?`,
                header: 'Confirm Delete',
                icon: 'pi pi-exclamation-triangle',
                accept: async () => {
                    const success = await this.trackerService.deleteAccount(event.data.id);
                    this.messageService.add(success
                        ? { severity: 'success', summary: 'Deleted', detail: 'Account removed', life: 3000 }
                        : { severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
                }
            });
        }
    }

    openNew() {
        this.formData = { type: 'BANK', balance: 0, currency: 'BDT' };
        this.isNew = true;
        this.dialogConfig = this.buildDialogConfig();
        this.dialogVisible = true;
    }

    deleteSelected(items: any[]) {
        this.confirmationService.confirm({
            message: `Delete ${items.length} selected accounts?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const ids = items.map(item => item.id);
                const success = await this.trackerService.bulkDeleteAccounts(ids);
                if (success) this.fxTable?.clearSelection();
                this.messageService.add(success
                    ? { severity: 'success', summary: 'Deleted', detail: 'Accounts removed', life: 3000 }
                    : { severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
            }
        });
    }

    async onSave(event: DialogSaveEvent) {
        const acc = event.data as Account;
        if (event.isNew) {
            const created = await this.trackerService.addAccount(acc);
            this.messageService.add(created
                ? { severity: 'success', summary: 'Created', detail: 'Account added', life: 3000 }
                : { severity: 'error', summary: 'Error', detail: 'Failed to create', life: 3000 });
        } else {
            const updated = await this.trackerService.updateAccount(acc.id!, acc);
            this.messageService.add(updated
                ? { severity: 'success', summary: 'Updated', detail: 'Account updated', life: 3000 }
                : { severity: 'error', summary: 'Error', detail: 'Failed to update', life: 3000 });
        }
    }
}
