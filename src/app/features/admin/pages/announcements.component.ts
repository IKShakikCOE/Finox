import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicTableComponent } from '@/app/shared/components/dynamic-table.component';
import { DynamicDialogComponent } from '@/app/shared/components/dynamic-dialog.component';
import { DialogConfig, DialogSaveEvent, TableActionClickEvent, TableSettings } from '@/app/shared/models/dynamic-table.interface';
import { AdminService } from '../services/admin.service';

@Component({
    selector: 'fx-announcements',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ToastModule, ConfirmDialogModule,
        DynamicTableComponent, DynamicDialogComponent
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <div class="card">
            <h4 class="mt-0 mb-4">Announcements</h4>
            <p class="text-surface-500 mb-4">
                Send system-wide notifications to all users.
            </p>
            <fx-dynamic-table
                [data]="adminService.announcements()"
                [settings]="tableSettings"
                [hideTitle]="true"
                (addClick)="openNew()"
                (actionClick)="handleAction($event)"
                (bulkDeleteClick)="bulkDeleteAnnouncements($event)"
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
export class AnnouncementsComponent implements OnInit {
    adminService = inject(AdminService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    tableSettings: TableSettings = { endpoint: '' };
    dialogConfig: DialogConfig = { header: '', fields: [] };
    dialogVisible = false;
    formData: Record<string, any> = {};
    isNew = true;

    ngOnInit() {
        this.setupTable();
        this.adminService.loadAnnouncements();
    }

    setupTable() {
        this.tableSettings = {
            endpoint: '/api/admin/announcements',
            title: 'Announcements',
            dataKey: 'id',
            columns: [
                { field: 'title', header: 'Title' },
                { field: 'type', header: 'Type', type: 'tag', tagSeverity: (v) => {
                    if (v === 'ERROR') return 'danger';
                    if (v === 'WARNING') return 'warn';
                    if (v === 'SUCCESS') return 'success';
                    return 'info';
                }},
                { field: 'active', header: 'Active', type: 'tag', tagSeverity: (v) => v ? 'success' : 'secondary' },
                { field: 'createdAt', header: 'Created', type: 'date' },
                { field: 'expiresAt', header: 'Expires', type: 'date' }
            ],
            actions: [
                { show: true, label: 'Edit', icon: 'pi pi-pencil', severity: 'info', action: 'edit' },
                { show: true, label: 'Delete', icon: 'pi pi-trash', severity: 'danger', action: 'delete' }
            ],
            features: {
                add: true, action: true, bulkDelete: true, export: false, selection: true,
                pagination: { show: true, rowsPerPageOptions: [10, 25, 50], defaultRowsPerPage: 10 },
                search: { show: true, placeholder: 'Search announcements...', globalFilterFields: ['title', 'message', 'type'] }
            }
        };
    }

    openNew() {
        this.formData = { type: 'INFO', active: true, createdAt: new Date().toISOString().substring(0, 10) };
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
            header: this.isNew ? 'New Announcement' : 'Edit Announcement',
            width: '600px',
            fields: [
                { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Announcement title' },
                { key: 'type', label: 'Type', type: 'select', required: true, options: ['INFO', 'WARNING', 'SUCCESS', 'ERROR'] },
                { key: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Announcement message for all users...' },
                { key: 'expiresAt', label: 'Expires At', type: 'date', dateFormat: 'yy-mm-dd', showIcon: true }
            ]
        };
    }

    async bulkDeleteAnnouncements(items: any[]) {
        this.confirmationService.confirm({
            message: `Delete ${items.length} selected announcements?`,
            header: 'Confirm Bulk Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                for (const item of items) {
                    await this.adminService.deleteAnnouncement(item.id);
                }
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Announcements deleted', life: 3000 });
            }
        });
    }

    async onDialogSave(event: DialogSaveEvent) {
        const item: any = event.data;
        if (event.isNew) {
            const success = await this.adminService.createAnnouncement(item);
            if (success) {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Announcement created', life: 3000 });
            } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create', life: 3000 });
            }
        } else {
            const success = await this.adminService.updateAnnouncement(item.id, item);
            if (success) {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Announcement updated', life: 3000 });
            } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update', life: 3000 });
            }
        }
    }

    private confirmDelete(item: any) {
        this.confirmationService.confirm({
            message: `Delete announcement "${item.title}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const success = await this.adminService.deleteAnnouncement(item.id);
                if (success) {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted', life: 3000 });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
                }
            }
        });
    }
}
