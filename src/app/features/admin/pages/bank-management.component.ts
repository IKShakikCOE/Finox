import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabsModule } from 'primeng/tabs';
import { DynamicTableComponent } from '@/app/shared/components/dynamic-table.component';
import { DynamicDialogComponent } from '@/app/shared/components/dynamic-dialog.component';
import { DialogConfig, DialogSaveEvent, TableActionClickEvent, TableColumn, TableSettings } from '@/app/shared/models/dynamic-table.interface';
import { GenericApiService } from '@/app/shared/services/generic-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'fx-bank-management',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ToastModule,
        ConfirmDialogModule,
        TabsModule,
        DynamicTableComponent,
        DynamicDialogComponent
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />

        <div class="card">
            <h4 class="mt-0 mb-4">Bank Management</h4>

            <p-tabs value="0">
                <p-tablist>
                    <p-tab value="0">Banks</p-tab>
                    <p-tab value="1">Products</p-tab>
                </p-tablist>
                <p-tabpanels>
                    <p-tabpanel value="0">
                        <fx-dynamic-table
                            [data]="banks()"
                            [settings]="bankTableSettings"
                            [hideTitle]="true"
                            (addClick)="openNewBank()"
                            (actionClick)="handleBankAction($event)"
                            (bulkDeleteClick)="bulkDeleteBanks($event)"
                        />
                    </p-tabpanel>
                    <p-tabpanel value="1">
                        <fx-dynamic-table
                            [data]="products()"
                            [settings]="productTableSettings"
                            [hideTitle]="true"
                            (addClick)="openNewProduct()"
                            (actionClick)="handleProductAction($event)"
                            (bulkDeleteClick)="bulkDeleteProducts($event)"
                        />
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
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
export class BankManagementComponent implements OnInit {
    private apiService = inject(GenericApiService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    banks = signal<any[]>([]);
    products = signal<any[]>([]);

    bankTableSettings: TableSettings = { endpoint: '' };
    productTableSettings: TableSettings = { endpoint: '' };

    dialogConfig: DialogConfig = { header: '', fields: [] };
    dialogVisible = false;
    formData: Record<string, any> = {};
    isNew = true;
    private activeEntity: 'bank' | 'product' = 'bank';

    ngOnInit() {
        this.setupTables();
        this.loadData();
    }

    setupTables() {
        this.bankTableSettings = {
            endpoint: '/api/banks',
            title: 'Banks',
            dataKey: 'id',
            columns: [
                { field: 'id', header: 'ID' },
                { field: 'name', header: 'Name' },
                { field: 'logo', header: 'Logo' }
            ],
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
                pagination: { show: true, rowsPerPageOptions: [10, 25, 50], defaultRowsPerPage: 10 },
                search: { show: true, placeholder: 'Search banks...', globalFilterFields: ['name', 'id'] }
            }
        };

        this.productTableSettings = {
            endpoint: '/api/banks/products',
            title: 'Bank Products',
            dataKey: 'id',
            columns: [
                { field: 'bankName', header: 'Bank' },
                { field: 'name', header: 'Product Name' },
                { field: 'category', header: 'Category', type: 'tag', tagSeverity: () => 'info' },
                { field: 'interestRate', header: 'Interest Rate (%)' },
                { field: 'minDeposit', header: 'Min Deposit', type: 'currency' }
            ],
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
                pagination: { show: true, rowsPerPageOptions: [10, 25, 50], defaultRowsPerPage: 10 },
                search: { show: true, placeholder: 'Search products...', globalFilterFields: ['name', 'bankName', 'category'] }
            }
        };
    }

    async loadData() {
        try {
            const bankData = await firstValueFrom(this.apiService.getAll<any>('/api/banks'));
            this.banks.set(bankData);
        } catch { /* empty */ }

        try {
            const productData = await firstValueFrom(this.apiService.getAll<any>('/api/banks/products'));
            this.products.set(productData);
        } catch { /* empty */ }
    }

    // ─── Bank CRUD ───────────────────────────────────────────
    openNewBank() {
        this.activeEntity = 'bank';
        this.formData = {};
        this.isNew = true;
        this.dialogConfig = {
            header: 'New Bank',
            width: '500px',
            fields: [
                { key: 'name', label: 'Bank Name', type: 'text', required: true, placeholder: 'e.g., Dutch-Bangla Bank' },
                { key: 'logo', label: 'Logo (icon class)', type: 'text', placeholder: 'e.g., pi pi-building' }
            ]
        };
        this.dialogVisible = true;
    }

    handleBankAction(event: TableActionClickEvent) {
        if (event.action === 'edit') {
            this.activeEntity = 'bank';
            this.formData = { ...event.data };
            this.isNew = false;
            this.dialogConfig = {
                header: 'Edit Bank',
                width: '500px',
                fields: [
                    { key: 'name', label: 'Bank Name', type: 'text', required: true },
                    { key: 'logo', label: 'Logo (icon class)', type: 'text' }
                ]
            };
            this.dialogVisible = true;
        } else if (event.action === 'delete') {
            this.confirmDelete('bank', event.data);
        }
    }

    async bulkDeleteBanks(items: any[]) {
        this.confirmationService.confirm({
            message: `Delete ${items.length} selected banks?`,
            header: 'Confirm Bulk Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const ids = items.map(i => i.id);
                await firstValueFrom(this.apiService.bulkDelete('/api/banks', ids));
                this.banks.update(list => list.filter(b => !ids.includes(b.id)));
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Banks deleted', life: 3000 });
            }
        });
    }

    // ─── Product CRUD ────────────────────────────────────────
    openNewProduct() {
        this.activeEntity = 'product';
        this.formData = {};
        this.isNew = true;
        this.dialogConfig = this.buildProductDialogConfig();
        this.dialogVisible = true;
    }

    handleProductAction(event: TableActionClickEvent) {
        if (event.action === 'edit') {
            this.activeEntity = 'product';
            this.formData = { ...event.data };
            this.isNew = false;
            this.dialogConfig = this.buildProductDialogConfig();
            this.dialogVisible = true;
        } else if (event.action === 'delete') {
            this.confirmDelete('product', event.data);
        }
    }

    async bulkDeleteProducts(items: any[]) {
        this.confirmationService.confirm({
            message: `Delete ${items.length} selected products?`,
            header: 'Confirm Bulk Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const ids = items.map(i => i.id);
                await firstValueFrom(this.apiService.bulkDelete('/api/banks/products', ids));
                this.products.update(list => list.filter(p => !ids.includes(p.id)));
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Products deleted', life: 3000 });
            }
        });
    }

    private buildProductDialogConfig(): DialogConfig {
        return {
            header: this.isNew ? 'New Bank Product' : 'Edit Bank Product',
            width: '700px',
            fields: [
                { key: 'bankId', label: 'Bank', type: 'select', required: true, options: () => this.banks().map(b => b.name), placeholder: 'Select Bank' },
                { key: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Fixed Deposit (1 Year)' },
                { key: 'category', label: 'Category', type: 'select', required: true, options: ['SAVINGS', 'LOAN', 'FDR', 'DPS'], placeholder: 'Select Category' },
                { key: 'interestRate', label: 'Interest Rate (%)', type: 'number', required: true, colSpan: 6 },
                { key: 'minDeposit', label: 'Min Deposit', type: 'currency', currency: 'BDT', locale: 'en-BD', colSpan: 6 },
                { key: 'tenure', label: 'Tenure', type: 'text', placeholder: 'e.g., 1 Year' },
                { key: 'eligibility', label: 'Eligibility', type: 'textarea', placeholder: 'Eligibility criteria...' }
            ]
        };
    }

    // ─── Shared ──────────────────────────────────────────────
    async onDialogSave(event: DialogSaveEvent) {
        const endpoint = this.activeEntity === 'bank' ? '/api/banks' : '/api/banks/products';
        const item: any = event.data;

        if (event.isNew) {
            try {
                const created = await firstValueFrom(this.apiService.create(endpoint, item));
                if (this.activeEntity === 'bank') {
                    this.banks.update(list => [created, ...list]);
                } else {
                    this.products.update(list => [created, ...list]);
                }
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `${this.activeEntity === 'bank' ? 'Bank' : 'Product'} created`, life: 3000 });
            } catch {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create', life: 3000 });
            }
        } else {
            try {
                const updated = await firstValueFrom(this.apiService.update(endpoint, item.id, item));
                if (this.activeEntity === 'bank') {
                    this.banks.update(list => list.map(b => b.id === item.id ? updated : b));
                } else {
                    this.products.update(list => list.map(p => p.id === item.id ? updated : p));
                }
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `${this.activeEntity === 'bank' ? 'Bank' : 'Product'} updated`, life: 3000 });
            } catch {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update', life: 3000 });
            }
        }
    }

    private confirmDelete(entity: 'bank' | 'product', item: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${item.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const endpoint = entity === 'bank' ? '/api/banks' : '/api/banks/products';
                try {
                    await firstValueFrom(this.apiService.delete(endpoint, item.id));
                    if (entity === 'bank') {
                        this.banks.update(list => list.filter(b => b.id !== item.id));
                    } else {
                        this.products.update(list => list.filter(p => p.id !== item.id));
                    }
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: `${entity === 'bank' ? 'Bank' : 'Product'} deleted`, life: 3000 });
                } catch {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
                }
            }
        });
    }
}
