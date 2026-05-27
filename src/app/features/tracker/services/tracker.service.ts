import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Transaction, Category, Account, Budget } from '../models/tracker.model';

export interface TrackerMetaResponse {
    paymentMethods: string[];
    incomeCategories: string[];
    expenseCategories: string[];
    initialTransactions: Transaction[];
}

@Injectable({ providedIn: 'root' })
export class TrackerService {
    private http = inject(HttpClient);

    // Core data signals
    paymentMethods = signal<string[]>([]);
    incomeCategories = signal<string[]>([]);
    expenseCategories = signal<string[]>([]);
    transactions = signal<Transaction[]>([]);
    categories = signal<Category[]>([]);
    accounts = signal<Account[]>([]);
    budgets = signal<Budget[]>([]);

    // Computed summaries
    totalIncome = computed(() =>
        this.transactions()
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + (t.amount || 0), 0)
    );

    totalExpense = computed(() =>
        this.transactions()
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + (t.amount || 0), 0)
    );

    balance = computed(() => this.totalIncome() - this.totalExpense());

    // Load metadata from JSON
    async loadTrackerMetaData(): Promise<void> {
        try {
            const data = await firstValueFrom(
                this.http.get<TrackerMetaResponse>('demo/tracker-meta.json')
            );

            this.paymentMethods.set(data.paymentMethods);
            this.incomeCategories.set(data.incomeCategories);
            this.expenseCategories.set(data.expenseCategories);
            this.transactions.set(data.initialTransactions);

            // Build categories from meta
            const cats: Category[] = [
                ...data.incomeCategories.map((name, i) => ({ id: `IC${i + 1}`, name, type: 'INCOME' as const })),
                ...data.expenseCategories.map((name, i) => ({ id: `EC${i + 1}`, name, type: 'EXPENSE' as const }))
            ];
            this.categories.set(cats);

            // Default accounts
            this.accounts.set([
                { id: 'ACC1', name: 'Cash Wallet', type: 'CASH', balance: 25000, currency: 'BDT' },
                { id: 'ACC2', name: 'DBBL Bank', type: 'BANK', balance: 450000, currency: 'BDT' },
                { id: 'ACC3', name: 'bKash', type: 'MOBILE_BANKING', balance: 12000, currency: 'BDT' }
            ]);

            // Default budgets
            this.budgets.set([
                { id: 'BUD001', category: 'Food & Grocery', allocatedAmount: 15000, period: 'MONTHLY', alertThreshold: 80 },
                { id: 'BUD002', category: 'Utilities', allocatedAmount: 5000, period: 'MONTHLY', alertThreshold: 90 },
                { id: 'BUD003', category: 'Shopping', allocatedAmount: 10000, period: 'MONTHLY', alertThreshold: 75 },
                { id: 'BUD004', category: 'Fuel & Transport', allocatedAmount: 8000, period: 'MONTHLY', alertThreshold: 80 },
                { id: 'BUD005', category: 'Medical', allocatedAmount: 5000, period: 'MONTHLY', alertThreshold: 90 },
                { id: 'BUD006', category: 'Investment (SIP)', allocatedAmount: 25000, period: 'MONTHLY', alertThreshold: 100 },
                { id: 'BUD007', category: 'Rent', allocatedAmount: 20000, period: 'MONTHLY', alertThreshold: 100 }
            ]);
        } catch (error) {
            console.error('Failed to load tracker metadata from JSON', error);
        }
    }

    // Category CRUD
    addCategory(category: Category) {
        category.id = 'CAT' + Math.floor(1000 + Math.random() * 9000);
        this.categories.set([...this.categories(), category]);
        this.syncCategorySignals();
    }

    updateCategory(category: Category) {
        const cats = this.categories();
        const index = cats.findIndex(c => c.id === category.id);
        if (index > -1) {
            cats[index] = category;
            this.categories.set([...cats]);
            this.syncCategorySignals();
        }
    }

    deleteCategory(id: string) {
        this.categories.set(this.categories().filter(c => c.id !== id));
        this.syncCategorySignals();
    }

    private syncCategorySignals() {
        this.incomeCategories.set(this.categories().filter(c => c.type === 'INCOME').map(c => c.name));
        this.expenseCategories.set(this.categories().filter(c => c.type === 'EXPENSE').map(c => c.name));
    }

    // Account CRUD
    addAccount(account: Account) {
        account.id = 'ACC' + Math.floor(1000 + Math.random() * 9000);
        this.accounts.set([...this.accounts(), account]);
    }

    updateAccount(account: Account) {
        const accs = this.accounts();
        const index = accs.findIndex(a => a.id === account.id);
        if (index > -1) {
            accs[index] = account;
            this.accounts.set([...accs]);
        }
    }

    deleteAccount(id: string) {
        this.accounts.set(this.accounts().filter(a => a.id !== id));
    }

    // Budget CRUD
    addBudget(budget: Budget) {
        budget.id = 'BUD' + Math.floor(1000 + Math.random() * 9000);
        this.budgets.set([...this.budgets(), budget]);
    }

    updateBudget(budget: Budget) {
        const buds = this.budgets();
        const index = buds.findIndex(b => b.id === budget.id);
        if (index > -1) {
            buds[index] = budget;
            this.budgets.set([...buds]);
        }
    }

    deleteBudget(id: string) {
        this.budgets.set(this.budgets().filter(b => b.id !== id));
    }

    // Budget vs Actual computed
    budgetVsActual = computed(() => {
        return this.budgets().map(budget => {
            const spent = this.transactions()
                .filter(t => t.type === 'EXPENSE' && t.category === budget.category)
                .reduce((sum, t) => sum + (t.amount || 0), 0);
            const percentage = budget.allocatedAmount > 0 ? Math.round((spent / budget.allocatedAmount) * 100) : 0;
            const remaining = budget.allocatedAmount - spent;
            const isOverBudget = spent > budget.allocatedAmount;
            const isNearLimit = !isOverBudget && budget.alertThreshold ? percentage >= budget.alertThreshold : false;

            return {
                ...budget,
                spent,
                remaining,
                percentage,
                isOverBudget,
                isNearLimit
            };
        });
    });

    totalBudgetAllocated = computed(() => this.budgets().reduce((sum, b) => sum + b.allocatedAmount, 0));
    totalBudgetSpent = computed(() => this.budgetVsActual().reduce((sum, b) => sum + b.spent, 0));
}
