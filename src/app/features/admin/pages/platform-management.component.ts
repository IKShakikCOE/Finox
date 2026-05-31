import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicTableComponent } from '@/app/shared/components/dynamic-table.component';
import { DynamicDialogComponent } from '@/app/shared/components/dynamic-dialog.component';
import { DialogConfig, DialogSaveEvent, TableActionClickEvent, TableSettings } from '@/app/shared/models/dynamic-table.interface';
import { GenericApiService } from '@/app/shared/services/generic-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'fx-platform-management',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ToastModule, ConfirmDialogModule,
        DynamicTableComponent, DynamicDialogComponent
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <div class="card">
            <h4 class="mt-0 mb-4">Investment Platforms</h4>
            <fx-dynamic-table
                [data]="platforms()"
                [settings]="tableSettings"
                [hideTitle]="true"
                (addClick)="openNew()"
                (actionClick)="handleAction($event)"
                (bulkDeleteClick)="bulkDeletePlatforms($event)"
            />
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
export class PlatformManagementComponent implements OnInit {
    private apiService = inject(GenericApiService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    platforms = signal<any[]>([]);
    tableSettings: TableSettings = { endpoint: '' };
    dialogConfig: DialogConfig = { header: '', fields: [] };
    dialogVisible = false;
    formData: Record<string, any> = {};
    isNew = true;

    ngOnInit() {
        this.setupTable();
        this.loadData();
    }

    setupTable() {
        this.tableSettings = {
            endpoint: '/api/investment/platforms',
            title: 'Platforms',
            dataKey: 'id',
            columns: [
                { field: 'id', header: 'ID' },
                { field: 'name', header: 'Platform Name' },
                { field: 'icon', header: 'Icon' },
                { field: 'color', header: 'Color' }
            ],
            actions: [
                { show: true, label: 'Edit', icon: 'pi pi-pencil', severity: 'info', action: 'edit' },
                { show: true, label: 'Delete', icon: 'pi pi-trash', severity: 'danger', action: 'delete' }
            ],
            features: {
                add: true, action: true, bulkDelete: true, export: true, selection: true,
                pagination: { show: true, rowsPerPageOptions: [10, 25, 50], defaultRowsPerPage: 10 },
                search: { show: true, placeholder: 'Search platforms...', globalFilterFields: ['name', 'id'] }
            }
        };
    }

    async loadData() {
        try {
            const data = await firstValueFrom(this.apiService.getAll<any>('/api/investment/platforms'));
            this.platforms.set(data);
        } catch { /* empty */ }
    }

    openNew() {
        this.formData = {};
        this.isNew = true;
        this.dialogConfig = this.buildDialogConfig();
        this.dialogVisible = true;
    }

    handleAction(event: TableActionClickEvent) {
        if (event.action === 'edit') {
            this.formData = { ...event.data };
            this.isNew = false;
            this.dialogConfig = this.buildDialogConfig();
            this.dialogVisible = true;
        } else if (event.action === 'delete') {
            this.confirmDelete(event.data);
        }
    }

    private buildDialogConfig(): DialogConfig {
        return {
            header: this.isNew ? 'New Platform' : 'Edit Platform',
            width: '500px',
            fields: [
                { key: 'name', label: 'Platform Name', type: 'text', required: true, placeholder: 'e.g., Google Ads' },
                { key: 'icon', label: 'Icon (CSS class)', type: 'text', placeholder: 'e.g., pi pi-google' },
                { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g., #4285F4' }
            ]
        };
    }

    async bulkDeletePlatforms(items: any[]) {
        this.confirmationService.confirm({
            message: `Delete ${items.length} selected platforms?`,
            header: 'Confirm Bulk Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const ids = items.map(i => i.id);
                await firstValueFrom(this.apiService.bulkDelete('/api/investment/platforms', ids));
                this.platforms.update(list => list.filter(p => !ids.includes(p.id)));
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Platforms deleted', life: 3000 });
            }
        });
    }

    async onDialogSave(event: DialogSaveEvent) {
        const item: any = event.data;
        try {
            if (event.isNew) {
                const created = await firstValueFrom(this.apiService.create('/api/investment/platforms', item));
                this.platforms.update(list => [created, ...list]);
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Platform created', life: 3000 });
            } else {
                const updated = await firstValueFrom(this.apiService.update('/api/investment/platforms', item.id, item));
                this.platforms.update(list => list.map(p => p.id === item.id ? updated : p));
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Platform updated', life: 3000 });
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed', life: 3000 });
        }
    }

    private confirmDelete(item: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${item.name}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await firstValueFrom(this.apiService.delete('/api/investment/platforms', item.id));
                    this.platforms.update(list => list.filter(p => p.id !== item.id));
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Platform deleted', life: 3000 });
                } catch {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
                }
            }
        });
    }
}
