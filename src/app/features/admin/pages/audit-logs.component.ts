import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DynamicTableComponent } from '@/app/shared/components/dynamic-table.component';
import { TableSettings } from '@/app/shared/models/dynamic-table.interface';
import { AdminService } from '../services/admin.service';

@Component({
    selector: 'fx-audit-logs',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, InputTextModule,
        DatePickerModule, SelectModule, TagModule, DynamicTableComponent
    ],
    template: `
        <div class="card">
            <h4 class="mt-0 mb-4">Audit Logs</h4>
            <p class="text-surface-500 mb-4">
                Track all administrative actions performed in the system.
            </p>

            <!-- Filters -->
            <div class="flex flex-wrap items-end gap-4 mb-6">
                <div class="flex flex-col gap-2">
                    <label class="font-semibold text-sm">From Date</label>
                    <p-datepicker
                        [(ngModel)]="filterFrom"
                        dateFormat="yy-mm-dd"
                        [showIcon]="true"
                        placeholder="Start date"
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold text-sm">To Date</label>
                    <p-datepicker
                        [(ngModel)]="filterTo"
                        dateFormat="yy-mm-dd"
                        [showIcon]="true"
                        placeholder="End date"
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold text-sm">Action</label>
                    <p-select
                        [(ngModel)]="filterAction"
                        [options]="actionOptions"
                        placeholder="All Actions"
                        [showClear]="true"
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold text-sm">Username</label>
                    <input pInputText [(ngModel)]="filterUsername" placeholder="Filter by user..." />
                </div>
                <button pButton label="Apply Filters" icon="pi pi-filter" (click)="applyFilters()"></button>
                <button pButton label="Clear" icon="pi pi-times" class="p-button-outlined p-button-secondary" (click)="clearFilters()"></button>
            </div>

            <fx-dynamic-table
                [data]="adminService.auditLogs()"
                [settings]="tableSettings"
                [hideTitle]="true"
            />
        </div>
    `
})
export class AuditLogsComponent implements OnInit {
    adminService = inject(AdminService);

    tableSettings: TableSettings = { endpoint: '' };
    filterFrom: Date | null = null;
    filterTo: Date | null = null;
    filterAction = '';
    filterUsername = '';

    actionOptions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'IMPORT', 'SEED', 'RESET_PASSWORD', 'TOGGLE_STATUS'];

    ngOnInit() {
        this.setupTable();
        this.adminService.loadAuditLogs();
    }

    setupTable() {
        this.tableSettings = {
            endpoint: '/api/admin/audit-logs',
            title: 'Audit Logs',
            dataKey: 'id',
            columns: [
                { field: 'timestamp', header: 'Time', type: 'date' },
                { field: 'username', header: 'User' },
                { field: 'action', header: 'Action', type: 'tag', tagSeverity: (v) => {
                    if (v === 'DELETE') return 'danger';
                    if (v === 'CREATE') return 'success';
                    if (v === 'UPDATE') return 'info';
                    return 'secondary';
                }},
                { field: 'resource', header: 'Resource' },
                { field: 'resourceId', header: 'Resource ID' },
                { field: 'details', header: 'Details' },
                { field: 'ipAddress', header: 'IP Address' }
            ],
            features: {
                add: false, action: false, bulkDelete: false, export: true, selection: false,
                pagination: { show: true, rowsPerPageOptions: [25, 50, 100], defaultRowsPerPage: 25 },
                search: { show: true, placeholder: 'Search logs...', globalFilterFields: ['username', 'action', 'resource', 'details'] }
            }
        };
    }

    applyFilters() {
        const params: any = {};
        if (this.filterFrom) params.from = this.formatDate(this.filterFrom);
        if (this.filterTo) params.to = this.formatDate(this.filterTo);
        if (this.filterAction) params.action = this.filterAction;
        if (this.filterUsername) params.userId = this.filterUsername;
        this.adminService.loadAuditLogs(params);
    }

    clearFilters() {
        this.filterFrom = null;
        this.filterTo = null;
        this.filterAction = '';
        this.filterUsername = '';
        this.adminService.loadAuditLogs();
    }

    private formatDate(date: Date): string {
        return date.toISOString().substring(0, 10);
    }
}
