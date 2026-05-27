import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { InsuranceCompany, InsuranceProduct, InsuranceDataResponse, InsuranceCategory } from '../models/insurance.model';

@Injectable({ providedIn: 'root' })
export class InsuranceService {
    private http = inject(HttpClient);

    companies = signal<InsuranceCompany[]>([]);
    products = signal<InsuranceProduct[]>([]);
    selectedCategory = signal<InsuranceCategory>('ALL');
    selectedCompanyIds = signal<string[]>([]);
    compareList = signal<InsuranceProduct[]>([]);

    filteredProducts = computed(() => {
        let result = this.products();
        const category = this.selectedCategory();
        const companyIds = this.selectedCompanyIds();

        if (category !== 'ALL') {
            result = result.filter(p => p.category === category);
        }
        if (companyIds.length > 0) {
            result = result.filter(p => companyIds.includes(p.companyId));
        }
        return result;
    });

    async loadData(): Promise<void> {
        try {
            const data = await firstValueFrom(
                this.http.get<InsuranceDataResponse>('demo/insurance-products.json')
            );
            this.companies.set(data.companies);
            this.products.set(data.products);
        } catch (error) {
            console.error('Failed to load insurance data', error);
        }
    }

    addToCompare(product: InsuranceProduct) {
        const current = this.compareList();
        if (current.length >= 4) return;
        if (!current.find(p => p.id === product.id)) {
            this.compareList.set([...current, product]);
        }
    }

    removeFromCompare(productId: string) {
        this.compareList.set(this.compareList().filter(p => p.id !== productId));
    }

    clearCompare() {
        this.compareList.set([]);
    }

    isInCompare(productId: string): boolean {
        return this.compareList().some(p => p.id === productId);
    }
}
