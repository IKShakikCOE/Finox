import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InsuranceService } from '../services/insurance.service';

@Component({
    selector: 'fx-insurance-compare',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">Compare Insurance Plans</h4>
                <div class="flex gap-2">
                    <p-button label="Clear All" icon="pi pi-trash" severity="danger" [outlined]="true" (onClick)="insuranceService.clearCompare()" [disabled]="insuranceService.compareList().length === 0" />
                    <p-button label="Back to Products" icon="pi pi-arrow-left" severity="secondary" [routerLink]="['/insurance']" />
                </div>
            </div>

            <div *ngIf="insuranceService.compareList().length < 2" class="text-center p-6">
                <i class="pi pi-info-circle text-4xl text-muted-color mb-3 block"></i>
                <p class="text-lg text-muted-color">Select at least 2 plans to compare.</p>
                <p-button label="Browse Plans" icon="pi pi-search" [routerLink]="['/insurance']" severity="secondary" />
            </div>

            <div *ngIf="insuranceService.compareList().length >= 2" class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="p-3 text-left surface-ground font-bold" style="min-width: 150px">Feature</th>
                            <th *ngFor="let product of insuranceService.compareList()" class="p-3 text-center surface-ground" style="min-width: 220px">
                                <div class="flex flex-col items-center gap-2">
                                    <p-tag [value]="product.category" [severity]="getCategorySeverity(product.category)" />
                                    <span class="font-bold">{{ product.name }}</span>
                                    <span class="text-sm text-muted-color">{{ product.companyName }}</span>
                                    <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="insuranceService.removeFromCompare(product.id)" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Premium</td>
                            <td *ngFor="let product of insuranceService.compareList()" class="p-3 text-center font-semibold">
                                {{ product.premiumRange }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Coverage</td>
                            <td *ngFor="let product of insuranceService.compareList()" class="p-3 text-center text-primary font-bold">
                                {{ product.coverageAmount }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Tenure</td>
                            <td *ngFor="let product of insuranceService.compareList()" class="p-3 text-center">
                                {{ product.tenure }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Maturity Benefit</td>
                            <td *ngFor="let product of insuranceService.compareList()" class="p-3 text-center text-sm">
                                {{ product.maturityBenefit }}
                            </td>
                        </tr>
                        <tr class="border-bottom-1 surface-border">
                            <td class="p-3 font-semibold">Eligibility</td>
                            <td *ngFor="let product of insuranceService.compareList()" class="p-3 text-center text-sm">
                                {{ product.eligibility }}
                            </td>
                        </tr>
                        <tr>
                            <td class="p-3 font-semibold align-top">Features</td>
                            <td *ngFor="let product of insuranceService.compareList()" class="p-3">
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
export class InsuranceCompareComponent {
    public insuranceService = inject(InsuranceService);

    getCategorySeverity(category: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (category) {
            case 'LIFE': return 'info';
            case 'HEALTH': return 'success';
            case 'VEHICLE': return 'warn';
            case 'CHILD': return 'secondary';
            case 'PENSION': return 'info';
            default: return 'info';
        }
    }
}
