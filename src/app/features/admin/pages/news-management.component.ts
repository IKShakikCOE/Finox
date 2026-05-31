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
    selector: 'fx-news-management',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ToastModule, ConfirmDialogModule,
        DynamicTableComponent, DynamicDialogComponent
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <div class="card">
            <h4 class="mt-0 mb-4">News & Articles Management</h4>
            <fx-dynamic-table
                [data]="articles()"
                [settings]="tableSettings"
                [hideTitle]="true"
                (addClick)="openNew()"
                (actionClick)="handleAction($event)"
                (bulkDeleteClick)="bulkDeleteArticles($event)"
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
export class NewsManagementComponent implements OnInit {
    private apiService = inject(GenericApiService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    articles = signal<any[]>([]);
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
            endpoint: '/api/news',
            title: 'Articles',
            dataKey: 'id',
            columns: [
                { field: 'title', header: 'Title' },
                { field: 'category', header: 'Category', type: 'tag', tagSeverity: () => 'info' },
                { field: 'author', header: 'Author' },
                { field: 'date', header: 'Date', type: 'date' },
                { field: 'featured', header: 'Featured', type: 'tag', tagSeverity: (val) => val ? 'success' : 'secondary' }
            ],
            actions: [
                { show: true, label: 'Edit', icon: 'pi pi-pencil', severity: 'info', action: 'edit' },
                { show: true, label: 'Delete', icon: 'pi pi-trash', severity: 'danger', action: 'delete' }
            ],
            features: {
                add: true, action: true, bulkDelete: true, export: true, selection: true,
                pagination: { show: true, rowsPerPageOptions: [10, 25, 50], defaultRowsPerPage: 10 },
                search: { show: true, placeholder: 'Search articles...', globalFilterFields: ['title', 'author', 'category'] }
            }
        };
    }

    async loadData() {
        try {
            const response = await firstValueFrom(this.apiService.getAll<any>('/api/news'));
            // The news endpoint returns { categories, articles }
            const data = response as any;
            this.articles.set(data.articles || data);
        } catch { /* empty */ }
    }

    openNew() {
        this.formData = { featured: false, date: new Date().toISOString().substring(0, 10) };
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
            header: this.isNew ? 'New Article' : 'Edit Article',
            width: '700px',
            fields: [
                { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Article title' },
                { key: 'category', label: 'Category', type: 'select', required: true, options: ['News', 'Tips', 'Advice', 'Books', 'Learning'], placeholder: 'Select Category' },
                { key: 'author', label: 'Author', type: 'text', required: true, placeholder: 'Author name', colSpan: 6 },
                { key: 'date', label: 'Date', type: 'date', dateFormat: 'yy-mm-dd', showIcon: true, colSpan: 6 },
                { key: 'readTime', label: 'Read Time', type: 'text', placeholder: 'e.g., 5 min read', colSpan: 6 },
                { key: 'image', label: 'Image URL', type: 'text', placeholder: 'https://...', colSpan: 6 },
                { key: 'excerpt', label: 'Excerpt', type: 'textarea', required: true, placeholder: 'Short description...' },
                { key: 'content', label: 'Content (Markdown)', type: 'textarea', placeholder: 'Full article content...' }
            ]
        };
    }

    async bulkDeleteArticles(items: any[]) {
        this.confirmationService.confirm({
            message: `Delete ${items.length} selected articles?`,
            header: 'Confirm Bulk Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const ids = items.map(i => i.id);
                await firstValueFrom(this.apiService.bulkDelete('/api/news', ids));
                this.articles.update(list => list.filter(a => !ids.includes(a.id)));
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Articles deleted', life: 3000 });
            }
        });
    }

    async onDialogSave(event: DialogSaveEvent) {
        const item: any = event.data;
        try {
            if (event.isNew) {
                const created = await firstValueFrom(this.apiService.create('/api/news', item));
                this.articles.update(list => [created, ...list]);
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Article created', life: 3000 });
            } else {
                const updated = await firstValueFrom(this.apiService.update('/api/news', item.id, item));
                this.articles.update(list => list.map(a => a.id === item.id ? updated : a));
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Article updated', life: 3000 });
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed', life: 3000 });
        }
    }

    private confirmDelete(item: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${item.title}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await firstValueFrom(this.apiService.delete('/api/news', item.id));
                    this.articles.update(list => list.filter(a => a.id !== item.id));
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Article deleted', life: 3000 });
                } catch {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
                }
            }
        });
    }
}
