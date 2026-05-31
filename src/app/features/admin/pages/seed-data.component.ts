import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { AdminService } from '../services/admin.service';

@Component({
    selector: 'fx-seed-data',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ToastModule, ConfirmDialogModule,
        ButtonModule, TagModule, CheckboxModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast />
        <div class="card">
            <h4 class="mt-0 mb-2">Database Seeding</h4>
            <p class="text-surface-500 mb-6">
                Seed the database with demo data from the static JSON files. This populates catalog tables with initial data.
            </p>

            @if (adminService.seedStatus(); as status) {
                @if (status.lastSeeded) {
                    <div class="mb-4 p-3 surface-ground rounded-lg">
                        <span class="text-surface-500">Last seeded:</span>
                        <span class="font-semibold ml-2">{{ status.lastSeeded | date:'medium' }}</span>
                    </div>
                }

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    @for (table of status.tables; track table.name) {
                        <div class="p-4 surface-ground rounded-lg flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <p-checkbox
                                    [(ngModel)]="selectedTables"
                                    [value]="table.name"
                                    [inputId]="table.name"
                                />
                                <label [for]="table.name" class="cursor-pointer">
                                    <span class="font-semibold">{{ table.name }}</span>
                                    <span class="text-surface-500 text-sm block">{{ table.rowCount }} rows</span>
                                </label>
                            </div>
                            <p-tag
                                [value]="table.seeded ? 'Seeded' : 'Empty'"
                                [severity]="table.seeded ? 'success' : 'warn'"
                            />
                        </div>
                    }
                </div>
            } @else {
                <div class="mb-6 p-4 surface-ground rounded-lg text-center">
                    <i class="pi pi-spin pi-spinner text-2xl text-surface-500"></i>
                    <p class="text-surface-500 mt-2">Loading seed status...</p>
                </div>
            }

            <div class="flex gap-3">
                <button
                    pButton
                    label="Seed Selected Tables"
                    icon="pi pi-database"
                    [disabled]="selectedTables.length === 0 || seeding()"
                    [loading]="seeding()"
                    (click)="seedSelected()"
                ></button>
                <button
                    pButton
                    label="Seed All Tables"
                    icon="pi pi-refresh"
                    class="p-button-outlined p-button-secondary"
                    [disabled]="seeding()"
                    [loading]="seeding()"
                    (click)="seedAll()"
                ></button>
            </div>
        </div>
        <p-confirmdialog [style]="{ width: '450px' }" />
    `
})
export class SeedDataComponent implements OnInit {
    adminService = inject(AdminService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    selectedTables: string[] = [];
    seeding = signal(false);

    ngOnInit() {
        this.adminService.loadSeedStatus();
    }

    seedSelected() {
        this.confirmationService.confirm({
            message: `Seed ${this.selectedTables.length} selected tables? Existing data in these tables will remain unchanged.`,
            header: 'Confirm Seed',
            icon: 'pi pi-database',
            accept: () => this.doSeed(this.selectedTables)
        });
    }

    seedAll() {
        this.confirmationService.confirm({
            message: 'Seed ALL tables with demo data? Existing data will remain unchanged.',
            header: 'Confirm Full Seed',
            icon: 'pi pi-database',
            accept: () => this.doSeed()
        });
    }

    private async doSeed(tables?: string[]) {
        this.seeding.set(true);
        const success = await this.adminService.triggerSeed(tables);
        this.seeding.set(false);

        if (success) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Database seeded successfully', life: 3000 });
            this.selectedTables = [];
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Seeding failed', life: 3000 });
        }
    }
}
