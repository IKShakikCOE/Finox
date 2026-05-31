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
    selector: 'fx-mutual-fund-management',
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
            <h4 class="mt-0 mb-4">Mutual Fund Management</h4>

            <p-tabs value="0">
                <p-tablist>
                    <p-tab value="0">AMCs</p-tab>
                    <p-tab value="1">Funds</p-tab>
                </p-tablist>
                <p-tabpanels>
                    <p-tabpanel value="0">
                        <fx-dynamic-table
                            [data]="amcs()"
                            [settings]="amcTableSettings"
                            [hideTitle]="true"
                            (addClick)="openNewAmc()"
                            (actionClick)="handleAmcAction($event)"
                            (bulkDeleteClick)="bulkDelete('amc', $event)"
                        />
                    </p-tabpanel>
                    <p-tabpanel value="1">
                        <fx-dynamic-table
                            [data]="funds()"
                            [settings]="fundTableSettings"
                            [hideTitle]="true"
                            (addClick)="openNewFund()"
                            (actionClick)="handleFundAction($event)"
                            (bulkDeleteClick)="bulkDelete('fund', $event)"
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
export class MutualFundManagementComponent implements OnInit {
    private apiService = inject(GenericApiService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    amcs = signal<any[]>([]);
    funds = signal<any[]>([]);

    amcTableSettings: TableSettings = { endpoint: '' };
    fundTableSettings: TableSettings = { endpoint: '' };

    dialogConfig: DialogConfig = { header: '', fields: [] };
    dialogVisible = false;
    formData: Record<string, any> = {};
    isNew = true;
    private activeEntity: 'amc' | 'fund' = 'amc';

    ngOnInit() {
        this.setupTables();
        this.loadData();
    }

    setupTables() {
        this.amcTableSettings = {
            endpoint: '/api/mutual-funds/amcs',
            title: 'AMCs',
            dataKey: 'id',
            columns: [
                { field: 'id', header: 'ID' },
                { field: 'name', header: 'AMC Name' }
            ],
            actions: [
                { show: true, label: 'Edit', icon: 'pi pi-pencil', severity: 'info', action: 'edit' },
                { show: true, label: 'Delete', icon: 'pi pi-trash', severity: 'danger', action: 'delete' }
            ],
            features: {
                add: true, action: true, bulkDelete: true, export: true, selection: true,
                pagination: { show: true, rowsPerPageOptions: [10, 25, 50], defaultRowsPerPage: 10 },
                search: { show: true, placeholder: 'Search AMCs...', globalFilterFields: ['name', 'id'] }
            }
        };

        this.fundTableSettings = {
            endpoint: '/api/mutual-funds',
            title: 'Mutual Funds',
            dataKey: 'id',
            columns: [
                { field: 'amcName', header: 'AMC' },
                { field: 'name', header: 'Fund Name' },
                { field: 'category', header: 'Category', type: 'tag', tagSeverity: () => 'info' },
                { field: 'nav', header: 'NAV', type: 'currency' },
                { field: 'riskLevel', header: 'Risk', type: 'tag', tagSeverity: (val) => val === 'LOW' ? 'success' : val === 'HIGH' ? 'danger' : 'warn' },
                { field: 'returnRate1Y', header: '1Y Return (%)' }
            ],
            actions: [
                { show: true, label: 'Edit', icon: 'pi pi-pencil', severity: 'info', action: 'edit' },
                { show: true, label: 'Delete', icon: 'pi pi-trash', severity: 'danger', action: 'delete' }
            ],
            features: {
                add: true, action: true, bulkDelete: true, export: true, selection: true,
                pagination: { show: true, rowsPerPageOptions: [10, 25, 50], defaultRowsPerPage: 10 },
                search: { show: true, placeholder: 'Search funds...', globalFilterFields: ['name', 'amcName', 'category'] }
            }
        };
    }

    async loadData() {
        try {
            const data = await firstValueFrom(this.apiService.getAll<any>('/api/mutual-funds/amcs'));
            this.amcs.set(data);
        } catch { /* empty */ }
        try {
            const data = await firstValueFrom(this.apiService.getAll<any>('/api/mutual-funds'));
            this.funds.set(data);
        } catch { /* empty */ }
    }

    openNewAmc() {
        this.activeEntity = 'amc';
        this.formData = {};
        this.isNew = true;
        this.dialogConfig = {
            header: 'New AMC',
            width: '500px',
            fields: [
                { key: 'name', label: 'AMC Name', type: 'text', required: true, placeholder: 'e.g., ICB Asset Management' }
            ]
        };
        this.dialogVisible = true;
    }

    handleAmcAction(event: TableActionClickEvent) {
        if (event.action === 'edit') {
            this.activeEntity = 'amc';
            this.formData = { ...event.data };
            this.isNew = false;
            this.dialogConfig = {
                header: 'Edit AMC',
                width: '500px',
                fields: [
                    { key: 'name', label: 'AMC Name', type: 'text', required: true }
                ]
            };
            this.dialogVisible = true;
        } else if (event.action === 'delete') {
            this.confirmDelete('amc', event.data);
        }
    }

    openNewFund() {
        this.activeEntity = 'fund';
        this.formData = {};
        this.isNew = true;
        this.dialogConfig = this.buildFundDialogConfig();
        this.dialogVisible = true;
    }

    handleFundAction(event: TableActionClickEvent) {
        if (event.action === 'edit') {
            this.activeEntity = 'fund';
            this.formData = { ...event.data };
            this.isNew = false;
            this.dialogConfig = this.buildFundDialogConfig();
            this.dialogVisible = true;
        } else if (event.action === 'delete') {
            this.confirmDelete('fund', event.data);
        }
    }

    private buildFundDialogConfig(): DialogConfig {
        return {
            header: this.isNew ? 'New Mutual Fund' : 'Edit Mutual Fund',
            width: '700px',
            fields: [
                { key: 'amcId', label: 'AMC', type: 'select', required: true, options: () => this.amcs().map(a => a.name), placeholder: 'Select AMC' },
                { key: 'name', label: 'Fund Name', type: 'text', required: true, placeholder: 'e.g., ICB Growth Fund' },
                { key: 'category', label: 'Category', type: 'select', required: true, options: ['GROWTH', 'BALANCED', 'FIXED_INCOME'], placeholder: 'Select Category' },
                { key: 'riskLevel', label: 'Risk Level', type: 'select', required: true, options: ['LOW', 'MODERATE', 'HIGH'], placeholder: 'Select Risk Level' },
                { key: 'nav', label: 'NAV', type: 'currency', currency: 'BDT', locale: 'en-BD', colSpan: 6 },
                { key: 'minInvestment', label: 'Min Investment', type: 'currency', currency: 'BDT', locale: 'en-BD', colSpan: 6 },
                { key: 'returnRate1Y', label: '1Y Return (%)', type: 'number', colSpan: 4 },
                { key: 'returnRate3Y', label: '3Y Return (%)', type: 'number', colSpan: 4 },
                { key: 'returnRate5Y', label: '5Y Return (%)', type: 'number', colSpan: 4 },
                { key: 'expenseRatio', label: 'Expense Ratio (%)', type: 'number', colSpan: 6 },
                { key: 'fundSize', label: 'Fund Size', type: 'text', placeholder: 'e.g., ৳500 Cr', colSpan: 6 },
                { key: 'objective', label: 'Objective', type: 'textarea', placeholder: 'Fund investment objective...' }
            ]
        };
    }

    async bulkDelete(entity: 'amc' | 'fund', items: any[]) {
        this.confirmationService.confirm({
            message: `Delete ${items.length} selected items?`,
            header: 'Confirm Bulk Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const endpoint = entity === 'amc' ? '/api/mutual-funds/amcs' : '/api/mutual-funds';
                const ids = items.map(i => i.id);
                await firstValueFrom(this.apiService.bulkDelete(endpoint, ids));
                if (entity === 'amc') {
                    this.amcs.update(list => list.filter(a => !ids.includes(a.id)));
                } else {
                    this.funds.update(list => list.filter(f => !ids.includes(f.id)));
                }
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Items deleted', life: 3000 });
            }
        });
    }

    async onDialogSave(event: DialogSaveEvent) {
        const endpoint = this.activeEntity === 'amc' ? '/api/mutual-funds/amcs' : '/api/mutual-funds';
        const item: any = event.data;

        try {
            if (event.isNew) {
                const created = await firstValueFrom(this.apiService.create(endpoint, item));
                if (this.activeEntity === 'amc') {
                    this.amcs.update(list => [created, ...list]);
                } else {
                    this.funds.update(list => [created, ...list]);
                }
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Created successfully', life: 3000 });
            } else {
                const updated = await firstValueFrom(this.apiService.update(endpoint, item.id, item));
                if (this.activeEntity === 'amc') {
                    this.amcs.update(list => list.map(a => a.id === item.id ? updated : a));
                } else {
                    this.funds.update(list => list.map(f => f.id === item.id ? updated : f));
                }
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Updated successfully', life: 3000 });
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed', life: 3000 });
        }
    }

    private confirmDelete(entity: 'amc' | 'fund', item: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${item.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const endpoint = entity === 'amc' ? '/api/mutual-funds/amcs' : '/api/mutual-funds';
                try {
                    await firstValueFrom(this.apiService.delete(endpoint, item.id));
                    if (entity === 'amc') {
                        this.amcs.update(list => list.filter(a => a.id !== item.id));
                    } else {
                        this.funds.update(list => list.filter(f => f.id !== item.id));
                    }
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted successfully', life: 3000 });
                } catch {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
                }
            }
        });
    }
}
