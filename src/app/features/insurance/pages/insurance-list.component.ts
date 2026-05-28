import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InsuranceService } from '../services/insurance.service';

@Component({
    selector: 'fx-insurance-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TagModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">Insurance Companies</h4>
                <p-iconfield>
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" [(ngModel)]="searchQuery" placeholder="Search companies..." />
                </p-iconfield>
            </div>

            <div class="flex flex-col gap-4">
                <div *ngFor="let company of filteredCompanies()" class="border surface-border border-round p-5">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h4 class="m-0 mb-1">{{ company.name }}</h4>
                            <div class="flex items-center gap-2">
                                <p-tag [value]="company.type" severity="info" />
                                <p-tag [value]="'Est. ' + company.established" severity="secondary" />
                                <p-tag [value]="'Rating: ' + company.rating" [severity]="getRatingSeverity(company.rating)" />
                                <p-tag [value]="company.riskLevel + ' Risk'" [severity]="getRiskSeverity(company.riskLevel)" />
                            </div>
                        </div>
                        <a [href]="company.website" target="_blank" class="no-underline">
                            <p-button icon="pi pi-external-link" [rounded]="true" [text]="true" severity="secondary" />
                        </a>
                    </div>

                    <div class="grid grid-cols-12 gap-4 mb-4">
                        <div class="col-span-6 md:col-span-3">
                            <span class="block text-muted-color text-sm">Paid-up Capital</span>
                            <span class="font-bold">৳{{ company.paidUpCapital }}</span>
                        </div>
                        <div class="col-span-6 md:col-span-3">
                            <span class="block text-muted-color text-sm">Total Assets</span>
                            <span class="font-bold">৳{{ company.totalAssets }}</span>
                        </div>
                        <div class="col-span-6 md:col-span-3">
                            <span class="block text-muted-color text-sm">Claim Settlement</span>
                            <span class="font-bold" [class.text-green-500]="company.claimSettlementRatio >= 90" [class.text-orange-500]="company.claimSettlementRatio < 90">{{ company.claimSettlementRatio }}%</span>
                        </div>
                        <div class="col-span-6 md:col-span-3">
                            <span class="block text-muted-color text-sm">Solvency Ratio</span>
                            <span class="font-bold" [class.text-green-500]="company.solvencyRatio >= 150">{{ company.solvencyRatio }}%</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-4 mb-4">
                        <div class="col-span-4 md:col-span-2">
                            <span class="block text-muted-color text-sm">Branches</span>
                            <span class="font-semibold">{{ company.branches | number }}</span>
                        </div>
                        <div class="col-span-4 md:col-span-2">
                            <span class="block text-muted-color text-sm">Employees</span>
                            <span class="font-semibold">{{ company.employees | number }}</span>
                        </div>
                        <div class="col-span-4 md:col-span-2">
                            <span class="block text-muted-color text-sm">Agents</span>
                            <span class="font-semibold">{{ company.agents | number }}</span>
                        </div>
                        <div class="col-span-6 md:col-span-3">
                            <span class="block text-muted-color text-sm">Chairman</span>
                            <span class="font-semibold text-sm">{{ company.chairman }}</span>
                        </div>
                        <div class="col-span-6 md:col-span-3">
                            <span class="block text-muted-color text-sm">MD & CEO</span>
                            <span class="font-semibold text-sm">{{ company.md }}</span>
                        </div>
                    </div>

                    <div>
                        <span class="block text-muted-color text-sm mb-2">Products</span>
                        <div class="flex flex-wrap gap-1">
                            <span *ngFor="let p of company.products" class="px-2 py-1 surface-ground border-round text-xs">{{ p }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div *ngIf="filteredCompanies().length === 0" class="text-center p-6 text-muted-color">
                <i class="pi pi-search text-4xl mb-3 block"></i>
                <p class="text-lg">No companies found.</p>
            </div>
        </div>
    `
})
export class InsuranceListComponent implements OnInit {
    public insuranceService = inject(InsuranceService);
    searchQuery = '';

    ngOnInit() {
        if (!this.insuranceService.profiles().length) {
            this.insuranceService.loadProfiles();
        }
    }

    filteredCompanies() {
        const q = this.searchQuery.toLowerCase();
        if (!q) return this.insuranceService.profiles();
        return this.insuranceService.profiles().filter(c =>
            c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q) || c.products.some(p => p.toLowerCase().includes(q))
        );
    }

    getRiskSeverity(risk: string): 'success' | 'warn' | 'danger' {
        switch (risk) { case 'LOW': return 'success'; case 'MODERATE': return 'warn'; default: return 'danger'; }
    }

    getRatingSeverity(rating: string): 'success' | 'info' | 'warn' | 'danger' {
        if (rating.startsWith('AAA')) return 'success';
        if (rating.startsWith('AA')) return 'info';
        if (rating.startsWith('A')) return 'warn';
        return 'danger';
    }
}
