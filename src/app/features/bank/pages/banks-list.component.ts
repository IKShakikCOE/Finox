import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { BankService } from '../services/bank.service';

@Component({
    selector: 'fx-banks-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, TagModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">Banks of Bangladesh</h4>
                <p-iconfield>
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" [(ngModel)]="searchQuery" placeholder="Search banks..." />
                </p-iconfield>
            </div>

            <div class="flex flex-col gap-4">
                <div *ngFor="let bank of filteredBanks()" class="border surface-border border-round p-5 cursor-pointer hover:surface-hover transition-colors" [routerLink]="['/app/bank', bank.id]">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <h4 class="m-0 mb-1">{{ bank.name }}</h4>
                            <div class="flex items-center gap-2 flex-wrap">
                                <p-tag [value]="bank.type" severity="info" />
                                <p-tag [value]="'Est. ' + bank.established" severity="secondary" />
                                <p-tag [value]="'Rating: ' + bank.rating" [severity]="getRatingSeverity(bank.rating)" />
                                <p-tag [value]="bank.riskLevel + ' Risk'" [severity]="getRiskSeverity(bank.riskLevel)" />
                            </div>
                        </div>
                        <i class="pi pi-chevron-right text-muted-color"></i>
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6 md:col-span-2">
                            <span class="block text-muted-color text-xs">Capital</span>
                            <span class="font-bold text-sm">৳{{ bank.paidUpCapital }}</span>
                        </div>
                        <div class="col-span-6 md:col-span-2">
                            <span class="block text-muted-color text-xs">Assets</span>
                            <span class="font-bold text-sm">৳{{ bank.totalAssets }}</span>
                        </div>
                        <div class="col-span-4 md:col-span-2">
                            <span class="block text-muted-color text-xs">Branches</span>
                            <span class="font-semibold text-sm">{{ bank.branches | number }}</span>
                        </div>
                        <div class="col-span-4 md:col-span-2">
                            <span class="block text-muted-color text-xs">ATMs</span>
                            <span class="font-semibold text-sm">{{ bank.atmBooths | number }}</span>
                        </div>
                        <div class="col-span-4 md:col-span-2">
                            <span class="block text-muted-color text-xs">NPL</span>
                            <span class="font-bold text-sm" [class.text-green-500]="bank.nplRatio < 4" [class.text-orange-500]="bank.nplRatio >= 4 && bank.nplRatio < 10" [class.text-red-500]="bank.nplRatio >= 10">{{ bank.nplRatio }}%</span>
                        </div>
                        <div class="col-span-12 md:col-span-2">
                            <span class="block text-muted-color text-xs">Employees</span>
                            <span class="font-semibold text-sm">{{ bank.employees | number }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div *ngIf="filteredBanks().length === 0" class="text-center p-6 text-muted-color">
                <i class="pi pi-search text-4xl mb-3 block"></i>
                <p class="text-lg">No banks found.</p>
            </div>
        </div>
    `
})
export class BanksListComponent implements OnInit {
    public bankService = inject(BankService);
    searchQuery = '';

    ngOnInit() {
        if (!this.bankService.profiles().length) {
            this.bankService.loadProfiles();
        }
    }

    filteredBanks() {
        const q = this.searchQuery.toLowerCase();
        if (!q) return this.bankService.profiles();
        return this.bankService.profiles().filter(b =>
            b.name.toLowerCase().includes(q) || b.type.toLowerCase().includes(q) || b.headquarters.toLowerCase().includes(q)
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
