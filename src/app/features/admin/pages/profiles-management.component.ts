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
    selector: 'fx-profiles-management',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ToastModule, ConfirmDialogModule,
        TabsModule, DynamicTableComponent, DynamicDialogComponent
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <div class="card">
            <h4 class="mt-0 mb-4">Institution Profiles Management</h4>
            <p-tabs value="0">
                <p-tablist>
                    <p-tab value="0">Bank Profiles</p-tab>
                    <p-tab value="1">Insurance Profiles</p-tab>
                    <p-tab value="2">AMC Profiles</p-tab>
                </p-tablist>
                <p-tabpanels>
                    <p-tabpanel value="0">
                        <fx-dynamic-table
                            [data]="bankProfiles()"
                            [settings]="bankProfileSettings"
                            [hideTitle]="true"
                            (addClick)="openNew('bank')"
                            (actionClick)="handleAction('bank', $event)"
                            (bulkDeleteClick)="bulkDelete('bank', $event)"
                        />
                    </p-tabpanel>
                    <p-tabpanel value="1">
                        <fx-dynamic-table
                            [data]="insuranceProfiles()"
                            [settings]="insuranceProfileSettings"
                            [hideTitle]="true"
                            (addClick)="openNew('insurance')"
                            (actionClick)="handleAction('insurance', $event)"
                            (bulkDeleteClick)="bulkDelete('insurance', $event)"
                        />
                    </p-tabpanel>
                    <p-tabpanel value="2">
                        <fx-dynamic-table
                            [data]="amcProfiles()"
                            [settings]="amcProfileSettings"
                            [hideTitle]="true"
                            (addClick)="openNew('amc')"
                            (actionClick)="handleAction('amc', $event)"
                            (bulkDeleteClick)="bulkDelete('amc', $event)"
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
export class ProfilesManagementComponent implements OnInit {
    private apiService = inject(GenericApiService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    bankProfiles = signal<any[]>([]);
    insuranceProfiles = signal<any[]>([]);
    amcProfiles = signal<any[]>([]);

    bankProfileSettings: TableSettings = { endpoint: '' };
    insuranceProfileSettings: TableSettings = { endpoint: '' };
    amcProfileSettings: TableSettings = { endpoint: '' };

    dialogConfig: DialogConfig = { header: '', fields: [] };
    dialogVisible = false;
    formData: Record<string, any> = {};
    isNew = true;
    private activeType: 'bank' | 'insurance' | 'amc' = 'bank';

    ngOnInit() {
        this.setupTables();
        this.loadData();
    }

    setupTables() {
        const commonFeatures = {
            add: true, action: true, bulkDelete: true, export: true, selection: true,
            pagination: { show: true, rowsPerPageOptions: [10, 25, 50], defaultRowsPerPage: 10 },
            search: { show: true, placeholder: 'Search profiles...', globalFilterFields: ['name', 'headquarters'] }
        };
        const commonActions = [
            { show: true, label: 'Edit', icon: 'pi pi-pencil', severity: 'info' as const, action: 'edit' },
            { show: true, label: 'Delete', icon: 'pi pi-trash', severity: 'danger' as const, action: 'delete' }
        ];

        this.bankProfileSettings = {
            endpoint: '/api/banks/profiles', title: 'Bank Profiles', dataKey: 'id',
            columns: [
                { field: 'name', header: 'Bank Name' },
                { field: 'type', header: 'Type' },
                { field: 'established', header: 'Established' },
                { field: 'branches', header: 'Branches' },
                { field: 'riskLevel', header: 'Risk', type: 'tag', tagSeverity: (v) => v === 'LOW' ? 'success' : v === 'HIGH' ? 'danger' : 'warn' },
                { field: 'headquarters', header: 'HQ' }
            ],
            actions: commonActions, features: commonFeatures
        };

        this.insuranceProfileSettings = {
            endpoint: '/api/insurance/profiles', title: 'Insurance Profiles', dataKey: 'id',
            columns: [
                { field: 'name', header: 'Company' },
                { field: 'type', header: 'Type' },
                { field: 'established', header: 'Established' },
                { field: 'claimSettlementRatio', header: 'Claim Ratio (%)' },
                { field: 'branches', header: 'Branches' },
                { field: 'riskLevel', header: 'Risk', type: 'tag', tagSeverity: (v) => v === 'LOW' ? 'success' : v === 'HIGH' ? 'danger' : 'warn' }
            ],
            actions: commonActions, features: commonFeatures
        };

        this.amcProfileSettings = {
            endpoint: '/api/mutual-funds/profiles', title: 'AMC Profiles', dataKey: 'id',
            columns: [
                { field: 'name', header: 'AMC Name' },
                { field: 'established', header: 'Established' },
                { field: 'aum', header: 'AUM' },
                { field: 'totalFunds', header: 'Total Funds' },
                { field: 'riskLevel', header: 'Risk', type: 'tag', tagSeverity: (v) => v === 'LOW' ? 'success' : v === 'HIGH' ? 'danger' : 'warn' },
                { field: 'headquarters', header: 'HQ' }
            ],
            actions: commonActions, features: commonFeatures
        };
    }

    async loadData() {
        try { this.bankProfiles.set(await firstValueFrom(this.apiService.getAll<any>('/api/banks/profiles'))); } catch {}
        try { this.insuranceProfiles.set(await firstValueFrom(this.apiService.getAll<any>('/api/insurance/profiles'))); } catch {}
        try { this.amcProfiles.set(await firstValueFrom(this.apiService.getAll<any>('/api/mutual-funds/profiles'))); } catch {}
    }

    openNew(type: 'bank' | 'insurance' | 'amc') {
        this.activeType = type;
        this.formData = {};
        this.isNew = true;
        this.dialogConfig = this.buildDialogConfig(type);
        this.dialogVisible = true;
    }

    handleAction(type: 'bank' | 'insurance' | 'amc', event: TableActionClickEvent) {
        this.activeType = type;
        if (event.action === 'edit') {
            this.formData = { ...event.data };
            this.isNew = false;
            this.dialogConfig = this.buildDialogConfig(type);
            this.dialogVisible = true;
        } else if (event.action === 'delete') {
            this.confirmDelete(type, event.data);
        }
    }

    async bulkDelete(type: 'bank' | 'insurance' | 'amc', items: any[]) {
        this.confirmationService.confirm({
            message: `Delete ${items.length} selected profiles?`,
            header: 'Confirm Bulk Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const endpoint = this.getEndpoint(type);
                const ids = items.map(i => i.id);
                await firstValueFrom(this.apiService.bulkDelete(endpoint, ids));
                this.getSignal(type).update(list => list.filter(p => !ids.includes(p.id)));
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profiles deleted', life: 3000 });
            }
        });
    }

    async onDialogSave(event: DialogSaveEvent) {
        const endpoint = this.getEndpoint(this.activeType);
        const item: any = event.data;
        try {
            if (event.isNew) {
                const created = await firstValueFrom(this.apiService.create(endpoint, item));
                this.getSignal(this.activeType).update(list => [created, ...list]);
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile created', life: 3000 });
            } else {
                const updated = await firstValueFrom(this.apiService.update(endpoint, item.id, item));
                this.getSignal(this.activeType).update(list => list.map(p => p.id === item.id ? updated : p));
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile updated', life: 3000 });
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed', life: 3000 });
        }
    }

    private confirmDelete(type: 'bank' | 'insurance' | 'amc', item: any) {
        this.confirmationService.confirm({
            message: `Delete profile "${item.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const endpoint = this.getEndpoint(type);
                await firstValueFrom(this.apiService.delete(endpoint, item.id));
                this.getSignal(type).update(list => list.filter(p => p.id !== item.id));
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile deleted', life: 3000 });
            }
        });
    }

    private getEndpoint(type: 'bank' | 'insurance' | 'amc'): string {
        switch (type) {
            case 'bank': return '/api/banks/profiles';
            case 'insurance': return '/api/insurance/profiles';
            case 'amc': return '/api/mutual-funds/profiles';
        }
    }

    private getSignal(type: 'bank' | 'insurance' | 'amc') {
        switch (type) {
            case 'bank': return this.bankProfiles;
            case 'insurance': return this.insuranceProfiles;
            case 'amc': return this.amcProfiles;
        }
    }

    private buildDialogConfig(type: 'bank' | 'insurance' | 'amc'): DialogConfig {
        const base = [
            { key: 'name', label: 'Name', type: 'text' as const, required: true },
            { key: 'type', label: 'Type', type: 'text' as const, placeholder: 'e.g., Private Commercial' },
            { key: 'established', label: 'Established (Year)', type: 'number' as const, colSpan: 6 },
            { key: 'headquarters', label: 'Headquarters', type: 'text' as const, colSpan: 6 },
            { key: 'riskLevel', label: 'Risk Level', type: 'select' as const, options: ['LOW', 'MODERATE', 'HIGH'] },
            { key: 'chairman', label: 'Chairman', type: 'text' as const, colSpan: 6 },
            { key: 'md', label: 'MD/CEO', type: 'text' as const, colSpan: 6 },
            { key: 'rating', label: 'Rating', type: 'text' as const, colSpan: 6 },
            { key: 'ratingAgency', label: 'Rating Agency', type: 'text' as const, colSpan: 6 },
            { key: 'website', label: 'Website', type: 'text' as const }
        ];

        if (type === 'bank') {
            return {
                header: this.isNew ? 'New Bank Profile' : 'Edit Bank Profile', width: '750px',
                fields: [
                    ...base,
                    { key: 'authorizedCapital', label: 'Authorized Capital', type: 'text' as const, colSpan: 6 },
                    { key: 'paidUpCapital', label: 'Paid-up Capital', type: 'text' as const, colSpan: 6 },
                    { key: 'totalAssets', label: 'Total Assets', type: 'text' as const, colSpan: 6 },
                    { key: 'branches', label: 'Branches', type: 'number' as const, colSpan: 6 },
                    { key: 'atmBooths', label: 'ATM Booths', type: 'number' as const, colSpan: 6 },
                    { key: 'employees', label: 'Employees', type: 'number' as const, colSpan: 6 },
                    { key: 'swiftCode', label: 'SWIFT Code', type: 'text' as const, colSpan: 6 },
                    { key: 'nplRatio', label: 'NPL Ratio (%)', type: 'number' as const, colSpan: 6 }
                ]
            };
        } else if (type === 'insurance') {
            return {
                header: this.isNew ? 'New Insurance Profile' : 'Edit Insurance Profile', width: '750px',
                fields: [
                    ...base,
                    { key: 'paidUpCapital', label: 'Paid-up Capital', type: 'text' as const, colSpan: 6 },
                    { key: 'totalAssets', label: 'Total Assets', type: 'text' as const, colSpan: 6 },
                    { key: 'claimSettlementRatio', label: 'Claim Settlement (%)', type: 'number' as const, colSpan: 6 },
                    { key: 'solvencyRatio', label: 'Solvency Ratio (%)', type: 'number' as const, colSpan: 6 },
                    { key: 'branches', label: 'Branches', type: 'number' as const, colSpan: 6 },
                    { key: 'employees', label: 'Employees', type: 'number' as const, colSpan: 6 },
                    { key: 'agents', label: 'Agents', type: 'number' as const, colSpan: 6 }
                ]
            };
        } else {
            return {
                header: this.isNew ? 'New AMC Profile' : 'Edit AMC Profile', width: '750px',
                fields: [
                    ...base,
                    { key: 'paidUpCapital', label: 'Paid-up Capital', type: 'text' as const, colSpan: 6 },
                    { key: 'aum', label: 'AUM', type: 'text' as const, colSpan: 6 },
                    { key: 'totalFunds', label: 'Total Funds', type: 'number' as const, colSpan: 6 },
                    { key: 'parentOrg', label: 'Parent Organization', type: 'text' as const, colSpan: 6 },
                    { key: 'investmentPhilosophy', label: 'Investment Philosophy', type: 'textarea' as const }
                ]
            };
        }
    }
}
