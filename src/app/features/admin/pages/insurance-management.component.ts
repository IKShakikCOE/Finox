import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabsModule } from 'primeng/tabs';
import { DynamicTableComponent } from '@/app/shared/components/dynamic-table.component';
import { DynamicDialogComponent } from '@/app/shared/components/dynamic-dialog.component';
import { DialogConfig, DialogSaveEvent, TableActionClickEvent, TableSettings } from '@/app/shared/models/dynamic-table.interface';
import { GenericApiService } from '@/app/shared/services/generic-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'fx-insurance-management',
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
            <h4 class="mt-0 mb-4">Insurance Management</h4>

            <p-tabs value="0">
                <p-tablist>
                    <p-tab value="0">Companies</p-tab>
                    <p-tab value="1">Products</p-tab>
                </p-tablist>
                <p-tabpanels>
                    <p-tabpanel value="0">
                        <fx-dynamic-table
                            [data]="companies()"
                            [settings]="companyTableSettings"
                            [hideTitle]="true"
                            (addClick)="openNewCompany()"
                            (actionClick)="handleCompanyAction($event)"
                            (bulkDeleteClick)="bulkDelete('company', $event)"
                        />
                    </p-tabpanel>
                    <p-tabpanel value="1">
                        <fx-dynamic-table
                            [data]="products()"
                            [settings]="productTableSettings"
                            [hideTitle]="true"
                            (addClick)="openNewProduct()"
                            (actionClick)="handleProductAction($event)"
                            (bulkDeleteClick)="bulkDelete('product', $event)"
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
export class InsuranceManagementComponent implements OnInit {
    private apiService = inject(GenericApiService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    companies = signal<any[]>([]);
    products = signal<any[]>([]);

    companyTableSettings: TableSettings = { endpoint: '' };
    productTableSettings: TableSettings = { endpoint: '' };

    dialogConfig: DialogConfig = { header: '', fields: [] };
    dialogVisible = false;
    formData: Record<string, any> = {};
    isNew = true;
    private activeEntity: 'company' | 'product' = 'company';

    ngOnInit() {
        this.setupTables();
        this.loadData();
    }

    setupTables() {
        this.companyTableSettings = {
            endpoint: '/api/insurance/companies',
            title: 'Insurance Companies',
            dataKey: 'id',
            columns: [
                { field: 'id', header: 'ID' },
                { field: 'name', header: 'Company Name' }
            ],
            actions: [
                { show: true, label: 'Edit', icon: 'pi pi-pencil', severity: 'info', action: 'edit' },
                { show: true, label: 'Delete', icon: 'pi pi-trash', severity: 'danger', action: 'delete' }
            ],
            features: {
                add: true, action: true, bulkDelete: true, export: true, selection: true,
                pagination: { show: true, rowsPerPageOptions: [10, 25, 50], defaultRowsPerPage: 10 },
                search: { show: true, placeholder: 'Search companies...', globalFilterFields: ['name', 'id'] }
            }
        };

        this.productTableSettings = {
            endpoint: '/api/insurance/products',
            title: 'Insurance Products',
            dataKey: 'id',
            columns: [
                { field: 'companyName', header: 'Company' },
                { field: 'name', header: 'Product Name' },
                { field: 'category', header: 'Category', type: 'tag', tagSeverity: () => 'info' },
                { field: 'premiumRange', header: 'Premium Range' },
                { field: 'coverageAmount', header: 'Coverage' }
            ],
            actions: [
                { show: true, label: 'Edit', icon: 'pi pi-pencil', severity: 'info', action: 'edit' },
                { show: true, label: 'Delete', icon: 'pi pi-trash', severity: 'danger', action: 'delete' }
            ],
            features: {
                add: true, action: true, bulkDelete: true, export: true, selection: true,
                pagination: { show: true, rowsPerPageOptions: [10, 25, 50], defaultRowsPerPage: 10 },
                search: { show: true, placeholder: 'Search products...', globalFilterFields: ['name', 'companyName', 'category'] }
            }
        };
    }

    async loadData() {
        try {
            const data = await firstValueFrom(this.apiService.getAll<any>('/api/insurance/companies'));
            this.companies.set(data);
        } catch { /* empty */ }
        try {
            const data = await firstValueFrom(this.apiService.getAll<any>('/api/insurance/products'));
            this.products.set(data);
        } catch { /* empty */ }
    }

    openNewCompany() {
        this.activeEntity = 'company';
        this.formData = {};
        this.isNew = true;
        this.dialogConfig = {
            header: 'New Insurance Company',
            width: '500px',
            fields: [
                { key: 'name', label: 'Company Name', type: 'text', required: true, placeholder: 'e.g., MetLife Bangladesh' }
            ]
        };
        this.dialogVisible = true;
    }

    handleCompanyAction(event: TableActionClickEvent) {
        if (event.action === 'edit') {
            this.activeEntity = 'company';
            this.formData = { ...event.data };
            this.isNew = false;
            this.dialogConfig = {
                header: 'Edit Insurance Company',
                width: '500px',
                fields: [
                    { key: 'name', label: 'Company Name', type: 'text', required: true }
                ]
            };
            this.dialogVisible = true;
        } else if (event.action === 'delete') {
            this.confirmDelete('company', event.data);
        }
    }

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

    private buildProductDialogConfig(): DialogConfig {
        return {
            header: this.isNew ? 'New Insurance Product' : 'Edit Insurance Product',
            width: '700px',
            fields: [
                { key: 'companyId', label: 'Company', type: 'select', required: true, options: () => this.companies().map(c => c.name), placeholder: 'Select Company' },
                { key: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Term Life Plan' },
                { key: 'category', label: 'Category', type: 'select', required: true, options: ['LIFE', 'HEALTH', 'VEHICLE', 'PROPERTY', 'CHILD', 'PENSION'], placeholder: 'Select Category' },
                { key: 'premiumRange', label: 'Premium Range', type: 'text', placeholder: 'e.g., ৳5,000 - ৳50,000/year', colSpan: 6 },
                { key: 'coverageAmount', label: 'Coverage Amount', type: 'text', placeholder: 'e.g., ৳10,00,000', colSpan: 6 },
                { key: 'tenure', label: 'Tenure', type: 'text', placeholder: 'e.g., 10-30 years' },
                { key: 'maturityBenefit', label: 'Maturity Benefit', type: 'text', placeholder: 'e.g., Sum assured + bonus' },
                { key: 'eligibility', label: 'Eligibility', type: 'textarea', placeholder: 'Eligibility criteria...' }
            ]
        };
    }

    async bulkDelete(entity: 'company' | 'product', items: any[]) {
        this.confirmationService.confirm({
            message: `Delete ${items.length} selected items?`,
            header: 'Confirm Bulk Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const endpoint = entity === 'company' ? '/api/insurance/companies' : '/api/insurance/products';
                const ids = items.map(i => i.id);
                await firstValueFrom(this.apiService.bulkDelete(endpoint, ids));
                if (entity === 'company') {
                    this.companies.update(list => list.filter(c => !ids.includes(c.id)));
                } else {
                    this.products.update(list => list.filter(p => !ids.includes(p.id)));
                }
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Items deleted', life: 3000 });
            }
        });
    }

    async onDialogSave(event: DialogSaveEvent) {
        const endpoint = this.activeEntity === 'company' ? '/api/insurance/companies' : '/api/insurance/products';
        const item: any = event.data;

        try {
            if (event.isNew) {
                const created = await firstValueFrom(this.apiService.create(endpoint, item));
                if (this.activeEntity === 'company') {
                    this.companies.update(list => [created, ...list]);
                } else {
                    this.products.update(list => [created, ...list]);
                }
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Created successfully', life: 3000 });
            } else {
                const updated = await firstValueFrom(this.apiService.update(endpoint, item.id, item));
                if (this.activeEntity === 'company') {
                    this.companies.update(list => list.map(c => c.id === item.id ? updated : c));
                } else {
                    this.products.update(list => list.map(p => p.id === item.id ? updated : p));
                }
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Updated successfully', life: 3000 });
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed', life: 3000 });
        }
    }

    private confirmDelete(entity: 'company' | 'product', item: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${item.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const endpoint = entity === 'company' ? '/api/insurance/companies' : '/api/insurance/products';
                try {
                    await firstValueFrom(this.apiService.delete(endpoint, item.id));
                    if (entity === 'company') {
                        this.companies.update(list => list.filter(c => c.id !== item.id));
                    } else {
                        this.products.update(list => list.filter(p => p.id !== item.id));
                    }
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted successfully', life: 3000 });
                } catch {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
                }
            }
        });
    }
}
