import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { BankService } from '../services/bank.service';
import { BankProduct, ProductCategory } from '../models/bank.model';

@Component({
    selector: 'fx-bank-products',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        TagModule,
        SelectModule,
        MultiSelectModule,
        RadioButtonModule,
        BadgeModule,
        TooltipModule
    ],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">Bank Products - Bangladesh</h4>
                <p-button
                    [routerLink]="['/bank/compare']"
                    label="Compare"
                    icon="pi pi-arrows-h"
                    [badge]="bankService.compareList().length.toString()"
                    badgeSeverity="danger"
                    severity="secondary"
                    [disabled]="bankService.compareList().length < 2"
                />
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap items-center gap-4 mb-6 p-4 surface-ground border-round">
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="catAll" name="category" value="ALL" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="catAll" class="font-semibold">All</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="catSavings" name="category" value="SAVINGS" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="catSavings" class="font-semibold text-blue-500">Savings</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="catFDR" name="category" value="FDR" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="catFDR" class="font-semibold text-purple-500">FDR</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="catDPS" name="category" value="DPS" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="catDPS" class="font-semibold text-teal-500">DPS</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="catLoan" name="category" value="LOAN" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="catLoan" class="font-semibold text-orange-500">Loan</label>
                </div>

                <div class="ml-auto" style="min-width: 250px">
                    <p-multiselect
                        [options]="bankService.banks()"
                        [(ngModel)]="selectedBanks"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Filter by Bank"
                        [maxSelectedLabels]="2"
                        (onChange)="onBankFilterChange()"
                        [style]="{ width: '100%' }"
                    />
                </div>
            </div>

            <!-- Product Cards Grid -->
            <div class="grid grid-cols-12 gap-4">
                <div *ngFor="let product of bankService.filteredProducts()" class="col-span-12 md:col-span-6 lg:col-span-4">
                    <div class="border surface-border border-round p-4 h-full flex flex-col">
                        <div class="flex items-center justify-between mb-3">
                            <p-tag [value]="product.category" [severity]="getCategorySeverity(product.category)" />
                            <span class="text-muted-color text-sm">{{ product.bankName }}</span>
                        </div>

                        <h5 class="mt-0 mb-2">{{ product.name }}</h5>

                        <div class="flex items-center gap-4 mb-3">
                            <div>
                                <span class="block text-muted-color text-sm">Interest Rate</span>
                                <span class="text-xl font-bold text-primary">{{ product.interestRate }}%</span>
                            </div>
                            <div *ngIf="product.minDeposit">
                                <span class="block text-muted-color text-sm">Min Deposit</span>
                                <span class="font-semibold">{{ product.minDeposit | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                            </div>
                            <div *ngIf="product.tenure">
                                <span class="block text-muted-color text-sm">Tenure</span>
                                <span class="font-semibold">{{ product.tenure }}</span>
                            </div>
                        </div>

                        <ul class="list-none p-0 m-0 mb-3 flex-1">
                            <li *ngFor="let feature of product.features" class="flex items-center gap-2 mb-2">
                                <i class="pi pi-check-circle text-green-500 text-sm"></i>
                                <span class="text-sm">{{ feature }}</span>
                            </li>
                        </ul>

                        <div class="text-sm text-muted-color mb-3">
                            <i class="pi pi-user mr-1"></i> {{ product.eligibility }}
                        </div>

                        <div class="flex items-center gap-2 mt-auto">
                            <p-button
                                *ngIf="!bankService.isInCompare(product.id)"
                                label="Add to Compare"
                                icon="pi pi-plus"
                                severity="secondary"
                                [outlined]="true"
                                size="small"
                                (onClick)="addToCompare(product)"
                                [disabled]="bankService.compareList().length >= 4"
                                pTooltip="Max 4 products can be compared"
                                [tooltipDisabled]="bankService.compareList().length < 4"
                            />
                            <p-button
                                *ngIf="bankService.isInCompare(product.id)"
                                label="Remove"
                                icon="pi pi-times"
                                severity="danger"
                                [outlined]="true"
                                size="small"
                                (onClick)="removeFromCompare(product.id)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div *ngIf="bankService.filteredProducts().length === 0" class="text-center p-6 text-muted-color">
                <i class="pi pi-search text-4xl mb-3 block"></i>
                <p class="text-lg">No products found for the selected filters.</p>
            </div>
        </div>
    `
})
export class BankProductsComponent implements OnInit {
    public bankService = inject(BankService);

    categoryFilter: ProductCategory = 'ALL';
    selectedBanks: string[] = [];

    ngOnInit() {
        if (!this.bankService.banks().length) {
            this.bankService.loadBankData();
        }
    }

    onCategoryChange() {
        this.bankService.selectedCategory.set(this.categoryFilter);
    }

    onBankFilterChange() {
        this.bankService.selectedBankIds.set(this.selectedBanks);
    }

    getCategorySeverity(category: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (category) {
            case 'SAVINGS': return 'info';
            case 'FDR': return 'success';
            case 'DPS': return 'secondary';
            case 'LOAN': return 'warn';
            default: return 'info';
        }
    }

    addToCompare(product: BankProduct) {
        this.bankService.addToCompare(product);
    }

    removeFromCompare(productId: string) {
        this.bankService.removeFromCompare(productId);
    }
}
