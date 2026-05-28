import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Bank, BankProduct, BankProfile, BankDataResponse, InstitutionsDataResponse, ProductCategory } from '../models/bank.model';

@Injectable({ providedIn: 'root' })
export class BankService {
    private http = inject(HttpClient);

    banks = signal<Bank[]>([]);
    products = signal<BankProduct[]>([]);
    profiles = signal<BankProfile[]>([]);
    selectedCategory = signal<ProductCategory>('ALL');
    selectedBankIds = signal<string[]>([]);
    compareList = signal<BankProduct[]>([]);

    filteredProducts = computed(() => {
        let result = this.products();
        const category = this.selectedCategory();
        const bankIds = this.selectedBankIds();

        if (category !== 'ALL') {
            result = result.filter(p => p.category === category);
        }
        if (bankIds.length > 0) {
            result = result.filter(p => bankIds.includes(p.bankId));
        }
        return result;
    });

    async loadBankData(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<BankDataResponse>('demo/bank-products.json'));
            this.banks.set(data.banks);
            this.products.set(data.products);
        } catch (error) {
            console.error('Failed to load bank data', error);
        }
    }

    async loadProfiles(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<InstitutionsDataResponse>('demo/institutions.json'));
            this.profiles.set(data.banks);
        } catch (error) {
            console.error('Failed to load bank profiles', error);
        }
    }

    addToCompare(product: BankProduct) {
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
