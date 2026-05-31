import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AdminService } from '../services/admin.service';

@Component({
    selector: 'fx-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, CardModule, ButtonModule],
    template: `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-surface-500 font-medium">Total Users</span>
                    <div class="flex items-center justify-center bg-blue-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl"></i>
                    </div>
                </div>
                <div class="text-3xl font-bold text-surface-900">{{ adminService.stats()?.totalUsers || 0 }}</div>
                <span class="text-surface-500 text-sm">Active: {{ adminService.stats()?.activeUsers || 0 }}</span>
            </div>

            <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-surface-500 font-medium">Transactions</span>
                    <div class="flex items-center justify-center bg-green-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-wallet text-green-500 text-xl"></i>
                    </div>
                </div>
                <div class="text-3xl font-bold text-surface-900">{{ adminService.stats()?.totalTransactions || 0 }}</div>
                <span class="text-surface-500 text-sm">All user transactions</span>
            </div>

            <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-surface-500 font-medium">Banks</span>
                    <div class="flex items-center justify-center bg-purple-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-building text-purple-500 text-xl"></i>
                    </div>
                </div>
                <div class="text-3xl font-bold text-surface-900">{{ adminService.stats()?.totalBanks || 0 }}</div>
                <span class="text-surface-500 text-sm">Registered banks</span>
            </div>

            <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-surface-500 font-medium">Articles</span>
                    <div class="flex items-center justify-center bg-orange-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-book text-orange-500 text-xl"></i>
                    </div>
                </div>
                <div class="text-3xl font-bold text-surface-900">{{ adminService.stats()?.totalArticles || 0 }}</div>
                <span class="text-surface-500 text-sm">Published articles</span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="card p-4">
                <h5 class="mb-4">Quick Actions</h5>
                <div class="flex flex-col gap-3">
                    <button pButton label="Manage Users" icon="pi pi-users" class="p-button-outlined" routerLink="/app/admin/users"></button>
                    <button pButton label="Manage Banks" icon="pi pi-building" class="p-button-outlined" routerLink="/app/admin/banks"></button>
                    <button pButton label="Manage Insurance" icon="pi pi-shield" class="p-button-outlined" routerLink="/app/admin/insurance"></button>
                    <button pButton label="Manage Mutual Funds" icon="pi pi-chart-line" class="p-button-outlined" routerLink="/app/admin/mutual-funds"></button>
                    <button pButton label="Manage News" icon="pi pi-book" class="p-button-outlined" routerLink="/app/admin/news"></button>
                </div>
            </div>

            <div class="card p-4">
                <h5 class="mb-4">Catalog Management</h5>
                <div class="flex flex-col gap-3">
                    <button pButton label="Tracker Metadata" icon="pi pi-tags" class="p-button-outlined p-button-secondary" routerLink="/app/admin/tracker-meta"></button>
                    <button pButton label="Investment Platforms" icon="pi pi-megaphone" class="p-button-outlined p-button-secondary" routerLink="/app/admin/platforms"></button>
                </div>
            </div>

            <div class="card p-4">
                <h5 class="mb-4">System Info</h5>
                <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-center">
                        <span class="text-surface-500">Insurance Companies</span>
                        <span class="font-semibold">{{ adminService.stats()?.totalInsuranceCompanies || 0 }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-surface-500">Mutual Funds</span>
                        <span class="font-semibold">{{ adminService.stats()?.totalMutualFunds || 0 }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-surface-500">Total Banks</span>
                        <span class="font-semibold">{{ adminService.stats()?.totalBanks || 0 }}</span>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AdminDashboardComponent implements OnInit {
    adminService = inject(AdminService);

    ngOnInit() {
        this.adminService.loadStats();
    }
}
