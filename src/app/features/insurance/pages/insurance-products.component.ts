import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { InsuranceService } from '../services/insurance.service';
import { InsuranceProduct, InsuranceCategory } from '../models/insurance.model';

@Component({
    selector: 'fx-insurance-products',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, TagModule, MultiSelectModule, RadioButtonModule, BadgeModule, TooltipModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">Insurance Products - Bangladesh</h4>
                <p-button
                    [routerLink]="['/insurance/compare']"
                    label="Compare"
                    icon="pi pi-arrows-h"
                    [badge]="insuranceService.compareList().length.toString()"
                    badgeSeverity="danger"
                    severity="secondary"
                    [disabled]="insuranceService.compareList().length < 2"
                />
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap items-center gap-4 mb-6 p-4 surface-ground border-round">
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="insAll" name="insCategory" value="ALL" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="insAll" class="font-semibold">All</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="insLife" name="insCategory" value="LIFE" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="insLife" class="font-semibold text-blue-500">Life</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="insHealth" name="insCategory" value="HEALTH" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="insHealth" class="font-semibold text-green-500">Health</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="insVehicle" name="insCategory" value="VEHICLE" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="insVehicle" class="font-semibold text-orange-500">Vehicle</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="insChild" name="insCategory" value="CHILD" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="insChild" class="font-semibold text-purple-500">Child</label>
                </div>
                <div class="flex items-center gap-2">
                    <p-radiobutton inputId="insPension" name="insCategory" value="PENSION" [(ngModel)]="categoryFilter" (onClick)="onCategoryChange()" />
                    <label for="insPension" class="font-semibold text-teal-500">Pension</label>
                </div>

                <div class="ml-auto" style="min-width: 250px">
                    <p-multiselect
                        [options]="insuranceService.companies()"
                        [(ngModel)]="selectedCompanies"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Filter by Company"
                        [maxSelectedLabels]="2"
                        (onChange)="onCompanyFilterChange()"
                        [style]="{ width: '100%' }"
                    />
                </div>
            </div>

            <!-- Product Cards -->
            <div class="grid grid-cols-12 gap-4">
                <div *ngFor="let product of insuranceService.filteredProducts()" class="col-span-12 md:col-span-6 lg:col-span-4">
                    <div class="border surface-border border-round p-4 h-full flex flex-col">
                        <div class="flex items-center justify-between mb-3">
                            <p-tag [value]="product.category" [severity]="getCategorySeverity(product.category)" />
                            <span class="text-muted-color text-sm">{{ product.companyName }}</span>
                        </div>

                        <h5 class="mt-0 mb-2">{{ product.name }}</h5>

                        <div class="flex flex-wrap gap-4 mb-3">
                            <div>
                                <span class="block text-muted-color text-sm">Premium</span>
                                <span class="font-semibold text-sm">{{ product.premiumRange }}</span>
                            </div>
                            <div>
                                <span class="block text-muted-color text-sm">Coverage</span>
                                <span class="font-semibold text-primary text-sm">{{ product.coverageAmount }}</span>
                            </div>
                            <div>
                                <span class="block text-muted-color text-sm">Tenure</span>
                                <span class="font-semibold text-sm">{{ product.tenure }}</span>
                            </div>
                        </div>

                        <div *ngIf="product.maturityBenefit !== 'N/A'" class="mb-3 text-sm">
                            <span class="text-muted-color">Maturity: </span>
                            <span class="font-medium">{{ product.maturityBenefit }}</span>
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
                                *ngIf="!insuranceService.isInCompare(product.id)"
                                label="Add to Compare"
                                icon="pi pi-plus"
                                severity="secondary"
                                [outlined]="true"
                                size="small"
                                (onClick)="addToCompare(product)"
                                [disabled]="insuranceService.compareList().length >= 4"
                            />
                            <p-button
                                *ngIf="insuranceService.isInCompare(product.id)"
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

            <div *ngIf="insuranceService.filteredProducts().length === 0" class="text-center p-6 text-muted-color">
                <i class="pi pi-search text-4xl mb-3 block"></i>
                <p class="text-lg">No insurance products found for the selected filters.</p>
            </div>
        </div>
    `
})
export class InsuranceProductsComponent implements OnInit {
    public insuranceService = inject(InsuranceService);

    categoryFilter: InsuranceCategory = 'ALL';
    selectedCompanies: string[] = [];

    ngOnInit() {
        if (!this.insuranceService.companies().length) {
            this.insuranceService.loadData();
        }
    }

    onCategoryChange() {
        this.insuranceService.selectedCategory.set(this.categoryFilter);
    }

    onCompanyFilterChange() {
        this.insuranceService.selectedCompanyIds.set(this.selectedCompanies);
    }

    getCategorySeverity(category: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (category) {
            case 'LIFE': return 'info';
            case 'HEALTH': return 'success';
            case 'VEHICLE': return 'warn';
            case 'CHILD': return 'secondary';
            case 'PENSION': return 'info';
            case 'PROPERTY': return 'warn';
            default: return 'info';
        }
    }

    addToCompare(product: InsuranceProduct) {
        this.insuranceService.addToCompare(product);
    }

    removeFromCompare(productId: string) {
        this.insuranceService.removeFromCompare(productId);
    }
}
