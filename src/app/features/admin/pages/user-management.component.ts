import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DynamicTableComponent } from '@/app/shared/components/dynamic-table.component';
import { TableColumn, TableSettings, TableActionClickEvent } from '@/app/shared/models/dynamic-table.interface';
import { AdminService } from '../services/admin.service';
import { AdminUser } from '../models/admin.model';

@Component({
    selector: 'fx-user-management',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ToastModule,
        ConfirmDialogModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        TagModule,
        DynamicTableComponent
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />

        <div class="card">
            <div class="flex items-center justify-between mb-4">
                <h4 class="m-0">User Management</h4>
                <div class="flex gap-2">
                    <button pButton label="Import Users" icon="pi pi-upload" class="p-button-outlined p-button-secondary" (click)="importDialogVisible = true"></button>
                </div>
            </div>

            <fx-dynamic-table
                [data]="adminService.users()"
                [settings]="tableSettings"
                [hideTitle]="true"
                (actionClick)="handleTableAction($event)"
            />
        </div>

        <!-- Reset Password Dialog -->
        <p-dialog
            [(visible)]="resetPasswordVisible"
            [style]="{ width: '450px' }"
            header="Reset User Password"
            [modal]="true"
        >
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">User</label>
                        <span class="text-surface-600">{{ selectedUser?.username }} ({{ selectedUser?.email }})</span>
                    </div>
                    <div>
                        <label for="newPassword" class="block font-bold mb-2">New Password</label>
                        <input type="password" pInputText id="newPassword" [(ngModel)]="newPassword" class="w-full" placeholder="Enter new password" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="resetPasswordVisible = false" />
                <p-button label="Reset Password" icon="pi pi-check" severity="warn" (click)="confirmResetPassword()" />
            </ng-template>
        </p-dialog>

        <!-- Bulk Import Dialog -->
        <p-dialog
            [(visible)]="importDialogVisible"
            [style]="{ width: '500px' }"
            header="Bulk Import Users"
            [modal]="true"
        >
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <p class="text-surface-500 m-0">
                        Upload a CSV file with columns: <strong>username, email, password, firstName, lastName</strong>
                    </p>
                    <div class="p-4 surface-ground rounded-lg">
                        <input type="file" accept=".csv,.xlsx" (change)="onFileSelected($event)" #fileInput />
                    </div>
                    @if (importFile) {
                        <p class="text-sm text-surface-600 m-0">Selected: {{ importFile.name }} ({{ (importFile.size / 1024).toFixed(1) }} KB)</p>
                    }
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="importDialogVisible = false" />
                <p-button label="Import" icon="pi pi-upload" [disabled]="!importFile || importing" [loading]="importing" (click)="doImport()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `
})
export class UserManagementComponent implements OnInit {
    adminService = inject(AdminService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    tableSettings: TableSettings = { endpoint: '' };
    resetPasswordVisible = false;
    selectedUser: AdminUser | null = null;
    newPassword = '';
    importDialogVisible = false;
    importFile: File | null = null;
    importing = false;

    ngOnInit() {
        this.setupTable();
        this.adminService.loadUsers();
    }

    setupTable() {
        const columns: TableColumn[] = [
            { field: 'username', header: 'Username' },
            { field: 'email', header: 'Email' },
            { field: 'firstName', header: 'First Name' },
            { field: 'lastName', header: 'Last Name' },
            {
                field: 'enabled', header: 'Status', type: 'tag',
                tagSeverity: (val) => val ? 'success' : 'danger'
            }
        ];

        this.tableSettings = {
            endpoint: '/api/admin/users',
            title: 'User Management',
            dataKey: 'id',
            columns,
            actions: [
                { show: true, label: 'Toggle Status', icon: 'pi pi-power-off', severity: 'warn', action: 'toggle' },
                { show: true, label: 'Reset Password', icon: 'pi pi-lock', severity: 'info', action: 'reset-password' },
                { show: true, label: 'Delete', icon: 'pi pi-trash', severity: 'danger', action: 'delete' }
            ],
            features: {
                add: false,
                action: true,
                bulkDelete: false,
                export: true,
                selection: false,
                pagination: {
                    show: true,
                    rowsPerPageOptions: [10, 25, 50],
                    defaultRowsPerPage: 10
                },
                search: {
                    show: true,
                    placeholder: 'Search users...',
                    globalFilterFields: ['username', 'email', 'firstName', 'lastName']
                }
            }
        };
    }

    handleTableAction(event: TableActionClickEvent) {
        const user = event.data as AdminUser;
        switch (event.action) {
            case 'toggle':
                this.toggleUserStatus(user);
                break;
            case 'reset-password':
                this.openResetPassword(user);
                break;
            case 'delete':
                this.deleteUser(user);
                break;
        }
    }

    async toggleUserStatus(user: AdminUser) {
        const newStatus = !user.enabled;
        const success = await this.adminService.toggleUserStatus(user.id, newStatus);
        if (success) {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `User ${user.username} ${newStatus ? 'enabled' : 'disabled'}`,
                life: 3000
            });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user status', life: 3000 });
        }
    }

    openResetPassword(user: AdminUser) {
        this.selectedUser = user;
        this.newPassword = '';
        this.resetPasswordVisible = true;
    }

    async confirmResetPassword() {
        if (!this.selectedUser || !this.newPassword) return;

        const success = await this.adminService.resetUserPassword(this.selectedUser.id, this.newPassword);
        if (success) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password reset successfully', life: 3000 });
            this.resetPasswordVisible = false;
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to reset password', life: 3000 });
        }
    }

    deleteUser(user: AdminUser) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const success = await this.adminService.deleteUser(user.id);
                if (success) {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted', life: 3000 });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user', life: 3000 });
                }
            }
        });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.importFile = input.files[0];
        }
    }

    async doImport() {
        if (!this.importFile) return;
        this.importing = true;
        const result = await this.adminService.bulkImportUsers(this.importFile);
        this.importing = false;

        if (result.success) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: `${result.imported} users imported successfully`, life: 3000 });
            this.importDialogVisible = false;
            this.importFile = null;
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: result.error || 'Import failed', life: 3000 });
        }
    }
}
