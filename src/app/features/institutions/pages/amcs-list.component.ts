import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InstitutionService } from '../services/institution.service';

@Component({
    selector: 'fx-amcs-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TagModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">Asset Management Companies (AMCs)</h4>
                <p-iconfield>
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" [(ngModel)]="searchQuery" placeholder="Search AMCs..." />
                </p-iconfield>
            </div>

            <div class="flex flex-col gap-4">
                <div *ngFor="let amc of filteredAmcs()" class="border surface-border border-round p-5">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h4 class="m-0 mb-1">{{ amc.name }}</h4>
                            <div class="flex items-center gap-2">
                                <p-tag [value]="'Est. ' + amc.established" severity="secondary" />
                                <p-tag [value]="'Rating: ' + amc.rating" [severity]="getRatingSeverity(amc.rating)" />
                                <p-tag [value]="amc.riskLevel + ' Risk'" [severity]="getRiskSeverity(amc.riskLevel)" />
                            </div>
                        </div>
                        <a [href]="amc.website" target="_blank" class="no-underline">
                            <p-button icon="pi pi-external-link" [rounded]="true" [text]="true" severity="secondary" />
                        </a>
                    </div>

                    <div class="grid grid-cols-12 gap-4 mb-4">
                        <div class="col-span-6 md:col-span-3">
                            <span class="block text-muted-color text-sm">Paid-up Capital</span>
                            <span class="font-bold">৳{{ amc.paidUpCapital }}</span>
                        </div>
                        <div class="col-span-6 md:col-span-3">
                            <span class="block text-muted-color text-sm">AUM (Assets Under Mgmt)</span>
                            <span class="font-bold text-primary">৳{{ amc.aum }}</span>
                        </div>
                        <div class="col-span-6 md:col-span-3">
                            <span class="block text-muted-color text-sm">Total Funds</span>
                            <span class="font-bold">{{ amc.totalFunds }}</span>
                        </div>
                        <div class="col-span-6 md:col-span-3">
                            <span class="block text-muted-color text-sm">Parent Organization</span>
                            <span class="font-semibold text-sm">{{ amc.parentOrg }}</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-4 mb-4">
                        <div class="col-span-6 md:col-span-6">
                            <span class="block text-muted-color text-sm">Chairman</span>
                            <span class="font-semibold text-sm">{{ amc.chairman }}</span>
                        </div>
                        <div class="col-span-6 md:col-span-6">
                            <span class="block text-muted-color text-sm">MD & CEO</span>
                            <span class="font-semibold text-sm">{{ amc.md }}</span>
                        </div>
                    </div>

                    <div class="mb-3">
                        <span class="block text-muted-color text-sm mb-2">Investment Philosophy</span>
                        <p class="m-0 text-sm">{{ amc.investmentPhilosophy }}</p>
                    </div>

                    <div>
                        <span class="block text-muted-color text-sm mb-2">Fund Types</span>
                        <div class="flex flex-wrap gap-1">
                            <span *ngFor="let f of amc.fundTypes" class="px-2 py-1 surface-ground border-round text-xs">{{ f }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div *ngIf="filteredAmcs().length === 0" class="text-center p-6 text-muted-color">
                <i class="pi pi-search text-4xl mb-3 block"></i>
                <p class="text-lg">No AMCs found.</p>
            </div>
        </div>
    `
})
export class AmcsListComponent implements OnInit {
    public institutionService = inject(InstitutionService);
    searchQuery = '';

    ngOnInit() {
        if (!this.institutionService.amcs().length) {
            this.institutionService.loadData();
        }
    }

    filteredAmcs() {
        const q = this.searchQuery.toLowerCase();
        if (!q) return this.institutionService.amcs();
        return this.institutionService.amcs().filter(a =>
            a.name.toLowerCase().includes(q) || a.parentOrg.toLowerCase().includes(q) || a.fundTypes.some(f => f.toLowerCase().includes(q))
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
