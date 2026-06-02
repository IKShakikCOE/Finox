import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TableColumn, TableSettings, TableActionClickEvent } from '../models/dynamic-table.interface';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
    selector: 'fx-dynamic-table',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, ToolbarModule, InputTextModule, IconFieldModule, InputIconModule, TagModule, SkeletonModule],
    template: `
        @if (loading) {
            <div class="flex justify-between items-center mb-4">
                <p-skeleton width="15rem" height="1.75rem"></p-skeleton>
                <p-skeleton width="8rem" height="2.5rem"></p-skeleton>
            </div>
            <div class="flex flex-col gap-2">
                <p-skeleton width="100%" height="3rem"></p-skeleton>
                <p-skeleton width="100%" height="3.5rem"></p-skeleton>
                <p-skeleton width="100%" height="3.5rem"></p-skeleton>
                <p-skeleton width="100%" height="3.5rem"></p-skeleton>
                <p-skeleton width="100%" height="3.5rem"></p-skeleton>
            </div>
        } @else {
            <p-table
            #dt
            [value]="data"
            [rows]="settings.features?.pagination?.defaultRowsPerPage || 10"
            [columns]="settings.columns || []"
            [paginator]="settings.features?.pagination?.show !== false && data.length > (settings.features?.pagination?.defaultRowsPerPage || 10)"
            [globalFilterFields]="settings.features?.search?.globalFilterFields || []"
            [tableStyle]="{ 'min-width': '50rem' }"
            [rowHover]="true"
            [rowsPerPageOptions]="settings.features?.pagination?.rowsPerPageOptions || [10, 20, 30, 50, 100]"
            [(selection)]="selectedItems"
            (selectionChange)="onSelectionChange()"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            [showCurrentPageReport]="settings.features?.pagination?.show !== false && data.length > (settings.features?.pagination?.defaultRowsPerPage || 10)"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between flex-wrap gap-3 w-full clearfix">
                    <div class="flex items-center gap-3">
                        <h5 class="m-0" *ngIf="settings.title && !hideTitle">{{ settings.title }}</h5>
                        <ng-content select="[filter]"></ng-content>
                    </div>

                    <div class="flex items-center gap-3 ml-auto">
                        <p-iconfield *ngIf="settings.features?.search?.show">
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" [placeholder]="settings.features?.search?.placeholder || 'Search...'" />
                        </p-iconfield>

                        <button pButton *ngIf="settings.features?.add" [label]="'Add'" [icon]="'pi pi-plus'" class="p-button-secondary p-button-outlined" (click)="addClick.emit()"></button>

                        <button
                            pButton
                            *ngIf="settings.features?.bulkDelete && selectedItems && selectedItems.length > 0"
                            [label]="'Delete' + ' (' + selectedItems.length + ')'"
                            icon="pi pi-trash"
                            class="p-button-danger p-button-outlined"
                            (click)="onBulkDelete()"
                        ></button>

                        <button pButton *ngIf="settings.features?.export" label="Export" icon="pi pi-upload" class="p-button-secondary p-button-outlined" (click)="dt.exportCSV()"></button>
                    </div>
                </div>
            </ng-template>

            <!-- টেবিলে কলাম রেন্ডারিং -->
            <ng-template #header>
                <tr> 
                    <!-- সিলেকশন চেকবক্স হেডার -->
                    <th *ngIf="settings.features?.selection" style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>

                    <th *ngFor="let col of settings.columns || []" [pSortableColumn]="col.field">{{ col.header }} <p-sortIcon [field]="col.field" /></th>

                    <!-- অ্যাকশন কলাম হেডার -->
                    <th *ngIf="settings.actions?.length" style="width: 12rem" class="text-center">Actions</th>
                </tr>
            </ng-template>

            <!-- টেবিল বডি রেন্ডারিং -->
            <ng-template #body let-rowData>
                <tr>
                    <!-- সিলেকশন চেকবক্স প্রতিটি রো-তে -->
                    <td *ngIf="settings.features?.selection">
                        <p-tableCheckbox [value]="rowData" />
                    </td>

                    <td *ngFor="let col of settings.columns || []">
                        <ng-container [ngSwitch]="col.type">
                            <span *ngSwitchCase="'date'">{{ resolveField(rowData, col.field) | date: 'dd MMM yyyy' }}</span>
                            <span *ngSwitchCase="'currency'" class="font-semibold">{{ resolveField(rowData, col.field) | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                            <span *ngSwitchCase="'tag'">
                                <p-tag [value]="resolveField(rowData, col.field)" [severity]="col.tagSeverity ? col.tagSeverity(resolveField(rowData, col.field)) : 'secondary'" />
                            </span>
                            <span *ngSwitchCase="'icon'">
                                <i *ngIf="resolveField(rowData, col.field)" [class]="'pi ' + resolveField(rowData, col.field)" [style.color]="rowData.color || 'inherit'" style="font-size: 1.2rem"></i>
                            </span>
                            <span *ngSwitchCase="'color'">
                                <span *ngIf="resolveField(rowData, col.field)" class="inline-flex items-center gap-2">
                                    <span [style.background-color]="resolveField(rowData, col.field)" style="width: 20px; height: 20px; border-radius: 4px; display: inline-block; border: 1px solid #ccc"></span>
                                    <span class="text-sm text-muted-color">{{ resolveField(rowData, col.field) }}</span>
                                </span>
                            </span>
                            <span *ngSwitchCase="'category'">
                                <span class="inline-flex items-center gap-2">
                                    <i *ngIf="(rowData.category?.icon || rowData.icon)" [class]="'pi ' + (rowData.category?.icon || rowData.icon)" [style.color]="rowData.category?.color || rowData.color || 'inherit'" style="font-size: 1rem"></i>
                                    <span>{{ rowData.category?.name || rowData.name || resolveField(rowData, col.field) }}</span>
                                </span>
                            </span>
                            <span *ngSwitchDefault>{{ resolveField(rowData, col.field) }}</span>
                        </ng-container>
                    </td>

                    <td *ngIf="settings.features?.action" class="text-center">
                        <div class="flex items-center justify-center gap-2">
                            <ng-container *ngFor="let action of settings.actions">
                                <p-button *ngIf="action.show" [icon]="action.icon" [rounded]="true" [outlined]="true" [severity]="action.severity || 'secondary'" (click)="emitAction(action.action, rowData)"> </p-button>
                            </ng-container>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
        }
    `
})
export class DynamicTableComponent {
    @Input() data: any[] = [];
    @Input() settings: TableSettings = {endpoint: ''};
    @Input() hideTitle: boolean = false;
    @Input() loading: boolean = false;

    @Output() actionClick = new EventEmitter<TableActionClickEvent>();
    @Output() selectionChange = new EventEmitter<any[]>();
    @Output() addClick = new EventEmitter<void>();
    @Output() bulkDeleteClick = new EventEmitter<any[]>();

    @ViewChild('dt') dt!: Table;
    selectedItems: any[] = [];

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    emitAction(action: string, rowData: any) {
        this.actionClick.emit({ action, data: rowData });
    }

    onBulkDelete() {
        this.bulkDeleteClick.emit([...this.selectedItems]);
    }

    /** Called by parent after successful bulk delete to clear selection */
    clearSelection() {
        this.selectedItems = [];
    }

    onSelectionChange() {
        this.selectionChange.emit(this.selectedItems);
    }

    /** Resolves dot-notation field paths like 'category.name' */
    resolveField(row: any, field: string): any {
        return field.split('.').reduce((obj, key) => obj?.[key], row) ?? '';
    }

    openNew() {}

    deleteSelectedProducts() {
        // this.confirmationService.confirm({
        //     message: 'Are you sure you want to delete the selected products?',
        //     header: 'Confirm',
        //     icon: 'pi pi-exclamation-triangle',
        //     accept: () => {
        //         this.products.set(this.products().filter((val) => !this.selectedProducts?.includes(val)));
        //         this.selectedProducts = null;
        //         this.messageService.add({
        //             severity: 'success',
        //             summary: 'Successful',
        //             detail: 'Products Deleted',
        //             life: 3000
        //         });
        //     }
        // });
    }

    exportCSV() {
        this.dt.exportCSV();
    }
}
