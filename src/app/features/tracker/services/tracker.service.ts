import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Transaction } from '../models/tracker.model';

export interface TrackerMetaResponse {
    paymentMethods: string[];
    incomeCategories: string[];
    expenseCategories: string[];
    initialTransactions: Transaction[];
}

@Injectable()
export class TrackerService {
    private http = inject(HttpClient);

    // ডাইনামিক ডেটা হোল্ড করার জন্য সিগন্যালস
    paymentMethods = signal<string[]>([]);
    incomeCategories = signal<string[]>([]);
    expenseCategories = signal<string[]>([]);
    transactions = signal<Transaction[]>([]);

    // JSON ফাইল থেকে কনফিগারেশন লোড করার মেথড
    async loadTrackerMetaData(): Promise<void> {
        try {
            const data = await firstValueFrom(
                this.http.get<TrackerMetaResponse>('demo/tracker-meta.json')
            );
            
            this.paymentMethods.set(data.paymentMethods);
            this.incomeCategories.set(data.incomeCategories);
            this.expenseCategories.set(data.expenseCategories);
            this.transactions.set(data.initialTransactions);
        } catch (error) {
            console.error('Failed to load tracker metadata from JSON', error);
        }
    }
}