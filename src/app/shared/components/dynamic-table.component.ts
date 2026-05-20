import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TableColumn, TableSettings, TableActionClickEvent } from '../models/dynamic-table.interface';
import { TracingService } from 'node_modules/@angular/core/types/_discovery-chunk';

@Component({
    selector: 'fx-dynamic-table',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, TagModule],
    template: `
        <p-table
            #dt
            [value]="data"
            [rows]="settings.rowsPerPage || 10"
            [columns]="columns"
            [paginator]="settings.showPaginator !== false && data.length > (settings.rowsPerPage || 10)"
            [globalFilterFields]="settings.globalFilterFields || []"
            [tableStyle]="{ 'min-width': '50rem' }"
            [rowHover]="true"
            [rowsPerPageOptions]="settings.rowsPerPageOptions || [10, 20, 30, 50]"
            [(selection)]="selectedItems"
            (selectionChange)="onSelectionChange()"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            [showCurrentPageReport]="settings.showPaginator !== false && data.length > (settings.rowsPerPage || 10)"
        >
            <!-- এখানে settings.title কন্ডিশনটি যুক্ত করা হয়েছে -->
            <ng-template #caption *ngIf="settings.title || settings.showSearch || settings.showExport">
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <!-- টাইটেল -->
                    <h5 class="m-0" *ngIf="settings.title">{{ settings.title }}</h5>

                    <div class="flex items-center gap-3 ml-auto">
                        <!-- ডাইনামিক গ্লোবাল সার্চ -->
                        <p-iconfield *ngIf="settings.showSearch">
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" [placeholder]="settings.searchPlaceholder || 'Search...'" />
                        </p-iconfield>

                        <!-- ডাইনামিক এক্সপোর্ট বাটন -->
                        <p-button *ngIf="settings.showExport" label="Export" icon="pi pi-upload" severity="secondary" [outlined]="true" (onClick)="dt.exportCSV()" />
                    </div>
                </div>
            </ng-template>

            <!-- টেবিলে কলাম রেন্ডারিং -->
            <ng-template #header>
                <tr>
                    <!-- সিলেকশন চেকবক্স হেডার -->
                    <th *ngIf="settings.showSelection" style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>

                    <th *ngFor="let col of columns" [pSortableColumn]="col.field">{{ col.header }} <p-sortIcon [field]="col.field" /></th>

                    <!-- অ্যাকশন কলাম হেডার -->
                    <th *ngIf="settings.actions?.show" style="width: 12rem" class="text-center">Actions</th>
                </tr>
            </ng-template>

            <!-- টেবিল বডি রেন্ডারিং -->
            <ng-template #body let-rowData>
                <tr>
                    <!-- সিলেকশন চেকবক্স প্রতিটি রো-তে -->
                    <td *ngIf="settings.showSelection">
                        <p-tableCheckbox [value]="rowData" />
                    </td>

                    <td *ngFor="let col of columns">
                        <ng-container [ngSwitch]="col.type">
                            <span *ngSwitchCase="'date'">{{ rowData[col.field] | date: 'dd MMM yyyy' }}</span>
                            <span *ngSwitchCase="'currency'" class="font-semibold">{{ rowData[col.field] | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                            <span *ngSwitchCase="'tag'">
                                <p-tag [value]="rowData[col.field]" [severity]="col.tagSeverity ? col.tagSeverity(rowData[col.field]) : 'secondary'" />
                            </span>
                            <span *ngSwitchDefault>{{ rowData[col.field] }}</span>
                        </ng-container>
                    </td>

                    <!-- অ্যাকশন বাটন প্যানেল -->
                    <td *ngIf="settings.actions?.show" class="text-center">
                        <div class="flex items-center justify-center gap-2">
                            <!-- এডিট বাটন -->
                            <p-button *ngIf="settings.actions?.edit !== false" icon="pi pi-pencil" [rounded]="true" [outlined]="true" severity="secondary" (click)="emitAction('edit', rowData)" />

                            <!-- ডিলিট বাটন -->
                            <p-button *ngIf="settings.actions?.delete !== false" icon="pi pi-trash" [rounded]="true" [outlined]="true" severity="danger" (click)="emitAction('delete', rowData)" />

                            <!-- সম্পূর্ণ ডাইনামিক কলাম-স্পেসিফিক বা মডিউল-স্পেসিফিক কাস্টম অ্যাকশন বাটনস (যেমন: QR কোড প্রিন্ট, ভেরিফাই) -->
                            <ng-container *ngIf="settings.actions?.customActions">
                                <p-button *ngFor="let action of settings.actions?.customActions" [icon]="action.icon" [rounded]="true" [outlined]="true" [severity]="action.severity || 'secondary'" (click)="emitAction(action.id, rowData)" />
                            </ng-container>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `
})
export class DynamicTableComponent {
    @Input() data: any[] = [];
    @Input() columns: TableColumn[] = [];
    @Input() settings: TableSettings = {};

    @Output() actionClick = new EventEmitter<TableActionClickEvent>();
    @Output() selectionChange = new EventEmitter<any[]>();

    @ViewChild('dt') dt!: Table;
    selectedItems: any[] = [];

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    emitAction(action: string, rowData: any) {
        this.actionClick.emit({ action, data: rowData });
    }

    onSelectionChange() {
        this.selectionChange.emit(this.selectedItems);
    }
}
