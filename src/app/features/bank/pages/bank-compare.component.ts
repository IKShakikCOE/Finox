import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BankService } from '../services/bank.service';

@Component({
    selector: 'fx-bank-compare',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">Compare Bank Products</h4>
                <div class="flex gap-2">
                    <p-button label="Clear All" icon="pi pi-trash" severity="danger" [outlined]="true" (onClick)="bankService.clearCompare()" [disabled]="bankService.compareList().length === 0" />
                    <p-button label="Back to Products" icon="pi pi-arrow-left" severity="secondary" [routerLink]="['/bank']" />
                </div>
            </div>

            <div *ngIf="bankService.compareList().length < 2" class="text-center p-6">
                <i class="pi pi-info-circle text-4xl text-muted-color mb-3 block"></i>
                <p class="text-lg text-muted-color">Select at least 2 products to compare.</p>
                <p-button label="Browse Products" icon="pi pi-search" [routerLink]="['/bank']" severity="secondary" />
            </div>

            <div *ngIf="bankService.compareList().length >= 2" class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="p-3 text-left surface-ground border-round-left font-bold" style="min-width: 150px">Feature</th>
                            <th *ngFor="let product of bankService.compareList()" class="p-3 text-center surface-ground border-round" style="min-width: 200px">
                                <div class="flex flex-col items-center gap-2">
                                    <p-tag [value]="product.category" [severity]="getCategorySeverity(product.category)" />
                                    <span class="font-bold">{{ product.name }}</span>
                                    <span class="text-sm text-muted-color">{{ product.bankName }}</span>
                                    <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="bankService.removeFromCompare(product.id)" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Interest Rate</td>
                            <td *ngFor="let product of bankService.compareList()" class="p-3 text-center">
                                <span class="text-xl font-bold" [class.text-green-500]="isLowestRate(product)" [class.text-primary]="!isLowestRate(product)">
                                    {{ product.interestRate }}%
                                </span>
                                <span *ngIf="isBestRate(product)" class="block text-xs text-green-500 font-semibold mt-1">
                                    <i class="pi pi-star-fill"></i> Best
                                </span>
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Min Deposit</td>
                            <td *ngFor="let product of bankService.compareList()" class="p-3 text-center font-semibold">
                                {{ product.minDeposit ? (product.minDeposit | currency: 'BDT' : 'symbol' : '1.0-0') : 'N/A' }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Tenure</td>
                            <td *ngFor="let product of bankService.compareList()" class="p-3 text-center">
                                {{ product.tenure || 'No fixed tenure' }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Eligibility</td>
                            <td *ngFor="let product of bankService.compareList()" class="p-3 text-center text-sm">
                                {{ product.eligibility }}
                            </td>
                        </tr>
                        <tr>
                            <td class="p-3 font-semibold align-top">Features</td>
                            <td *ngFor="let product of bankService.compareList()" class="p-3">
                                <ul class="list-none p-0 m-0">
                                    <li *ngFor="let feature of product.features" class="flex items-center gap-2 mb-2">
                                        <i class="pi pi-check-circle text-green-500 text-sm"></i>
                                        <span class="text-sm">{{ feature }}</span>
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
})
export class BankCompareComponent {
    public bankService = inject(BankService);

    getCategorySeverity(category: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (category) {
            case 'SAVINGS': return 'info';
            case 'FDR': return 'success';
            case 'DPS': return 'secondary';
            case 'LOAN': return 'warn';
            default: return 'info';
        }
    }

    // For savings/FDR/DPS: highest rate is best. For loans: lowest rate is best.
    isBestRate(product: any): boolean {
        const list = this.bankService.compareList();
        if (list.length < 2) return false;

        const isLoanCategory = product.category === 'LOAN';
        const rates = list.map(p => p.interestRate);

        if (isLoanCategory) {
            return product.interestRate === Math.min(...rates);
        }
        return product.interestRate === Math.max(...rates);
    }

    isLowestRate(product: any): boolean {
        // For loans, lowest is green (best). For deposits, highest is green (best).
        return this.isBestRate(product);
    }
}
