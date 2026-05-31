import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Transaction, Category, Account, Budget, TrackerMetaResponse } from '../models/tracker.model';

@Injectable({ providedIn: 'root' })
export class TrackerService {
    private http = inject(HttpClient);

    // ─── State signals ───────────────────────────────────────────────────────────
    paymentMethods = signal<string[]>([]);
    incomeCategories = signal<string[]>([]);
    expenseCategories = signal<string[]>([]);
    transactions = signal<Transaction[]>([]);
    categories = signal<Category[]>([]);       // hierarchical (parents with children)
    categoriesFlat = signal<Category[]>([]);   // flat list for dropdowns
    accounts = signal<Account[]>([]);
    budgets = signal<Budget[]>([]);
    loading = signal(false);

    // ─── Computed summaries ──────────────────────────────────────────────────────
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

    // ─── Load All Data ───────────────────────────────────────────────────────────
    async loadTrackerMetaData(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<TrackerMetaResponse>('/api/tracker/meta'));
            this.paymentMethods.set(data.paymentMethods);
            this.incomeCategories.set(data.incomeCategories);
            this.expenseCategories.set(data.expenseCategories);
        } catch (error) {
            console.error('Failed to load tracker metadata', error);
        }
    }

    async loadTransactions(): Promise<void> {
        try {
            this.loading.set(true);
            const data = await firstValueFrom(this.http.get<Transaction[]>('/api/transactions'));
            this.transactions.set(data);
        } catch (error) {
            console.error('Failed to load transactions', error);
        } finally {
            this.loading.set(false);
        }
    }

    async loadCategories(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<Category[]>('/api/categories'));
            this.categories.set(data);
            this.syncCategorySignals();
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    }

    /** Load flat category list (for select dropdowns) */
    async loadCategoriesFlat(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<Category[]>('/api/categories/flat'));
            this.categoriesFlat.set(data);
            this.syncCategorySignals();
        } catch (error) {
            console.error('Failed to load flat categories', error);
        }
    }

    async loadAccounts(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<Account[]>('/api/accounts'));
            this.accounts.set(data);
        } catch (error) {
            console.error('Failed to load accounts', error);
        }
    }

    async loadBudgets(): Promise<void> {
        try {
            const data = await firstValueFrom(this.http.get<Budget[]>('/api/budgets'));
            this.budgets.set(data);
        } catch (error) {
            console.error('Failed to load budgets', error);
        }
    }

    /** Load all tracker data in parallel */
    async loadAll(): Promise<void> {
        this.loading.set(true);
        await Promise.all([
            this.loadTrackerMetaData(),
            this.loadTransactions(),
            this.loadCategories(),
            this.loadCategoriesFlat(),
            this.loadAccounts(),
            this.loadBudgets()
        ]);
        this.loading.set(false);
    }

    // ─── Transaction CRUD ────────────────────────────────────────────────────────
    async addTransaction(txn: Partial<Transaction>): Promise<Transaction | null> {
        try {
            const created = await firstValueFrom(this.http.post<Transaction>('/api/transactions', txn));
            this.transactions.set([created, ...this.transactions()]);
            return created;
        } catch (error) {
            console.error('Failed to create transaction', error);
            return null;
        }
    }

    async updateTransaction(id: string, txn: Partial<Transaction>): Promise<Transaction | null> {
        try {
            const updated = await firstValueFrom(this.http.put<Transaction>(`/api/transactions/${id}`, txn));
            this.transactions.set(this.transactions().map(t => t.id === id ? updated : t));
            return updated;
        } catch (error) {
            console.error('Failed to update transaction', error);
            return null;
        }
    }

    async deleteTransaction(id: string): Promise<boolean> {
        try {
            await firstValueFrom(this.http.delete(`/api/transactions/${id}`));
            this.transactions.set(this.transactions().filter(t => t.id !== id));
            return true;
        } catch (error) {
            console.error('Failed to delete transaction', error);
            return false;
        }
    }

    async bulkDeleteTransactions(ids: string[]): Promise<boolean> {
        try {
            await firstValueFrom(this.http.post('/api/transactions/bulk-delete', { ids }));
            this.transactions.set(this.transactions().filter(t => !ids.includes(t.id!)));
            return true;
        } catch (error) {
            console.error('Failed to bulk delete transactions', error);
            return false;
        }
    }

    // ─── Category CRUD ───────────────────────────────────────────────────────────
    async addCategory(category: Partial<Category>): Promise<Category | null> {
        try {
            const created = await firstValueFrom(this.http.post<Category>('/api/categories', category));
            await this.reloadCategories();
            return created;
        } catch (error) {
            console.error('Failed to create category', error);
            return null;
        }
    }

    async updateCategory(id: string, category: Partial<Category>): Promise<Category | null> {
        try {
            const updated = await firstValueFrom(this.http.put<Category>(`/api/categories/${id}`, category));
            await this.reloadCategories();
            return updated;
        } catch (error) {
            console.error('Failed to update category', error);
            return null;
        }
    }

    async deleteCategory(id: string): Promise<boolean> {
        try {
            await firstValueFrom(this.http.delete(`/api/categories/${id}`));
            await this.reloadCategories();
            return true;
        } catch (error) {
            console.error('Failed to delete category', error);
            return false;
        }
    }

    async bulkDeleteCategories(ids: string[]): Promise<boolean> {
        try {
            await firstValueFrom(this.http.post('/api/categories/bulk-delete', { ids }));
            await this.reloadCategories();
            return true;
        } catch (error) {
            console.error('Failed to bulk delete categories', error);
            return false;
        }
    }

    /** Reload both hierarchical and flat category lists from API */
    private async reloadCategories(): Promise<void> {
        await Promise.all([this.loadCategories(), this.loadCategoriesFlat()]);
    }

    private syncCategorySignals() {
        const all = this.categoriesFlat().length ? this.categoriesFlat() : this.flattenCategories();
        this.incomeCategories.set(all.filter(c => c.type === 'INCOME').map(c => c.name));
        this.expenseCategories.set(all.filter(c => c.type === 'EXPENSE').map(c => c.name));
    }

    /** Flatten hierarchical categories into a single list */
    private flattenCategories(): Category[] {
        const result: Category[] = [];
        for (const parent of this.categories()) {
            result.push(parent);
            if (parent.children) {
                result.push(...parent.children);
            }
        }
        return result;
    }

    // ─── Account CRUD ────────────────────────────────────────────────────────────
    async addAccount(account: Partial<Account>): Promise<Account | null> {
        try {
            const created = await firstValueFrom(this.http.post<Account>('/api/accounts', account));
            this.accounts.set([...this.accounts(), created]);
            return created;
        } catch (error) {
            console.error('Failed to create account', error);
            return null;
        }
    }

    async updateAccount(id: string, account: Partial<Account>): Promise<Account | null> {
        try {
            const updated = await firstValueFrom(this.http.put<Account>(`/api/accounts/${id}`, account));
            this.accounts.set(this.accounts().map(a => a.id === id ? updated : a));
            return updated;
        } catch (error) {
            console.error('Failed to update account', error);
            return null;
        }
    }

    async deleteAccount(id: string): Promise<boolean> {
        try {
            await firstValueFrom(this.http.delete(`/api/accounts/${id}`));
            this.accounts.set(this.accounts().filter(a => a.id !== id));
            return true;
        } catch (error) {
            console.error('Failed to delete account', error);
            return false;
        }
    }

    async bulkDeleteAccounts(ids: string[]): Promise<boolean> {
        try {
            await firstValueFrom(this.http.post('/api/accounts/bulk-delete', { ids }));
            this.accounts.set(this.accounts().filter(a => !ids.includes(a.id!)));
            return true;
        } catch (error) {
            console.error('Failed to bulk delete accounts', error);
            return false;
        }
    }

    // ─── Budget CRUD ─────────────────────────────────────────────────────────────
    async addBudget(budget: Partial<Budget>): Promise<Budget | null> {
        try {
            const created = await firstValueFrom(this.http.post<Budget>('/api/budgets', budget));
            this.budgets.set([...this.budgets(), created]);
            return created;
        } catch (error) {
            console.error('Failed to create budget', error);
            return null;
        }
    }

    async updateBudget(id: string, budget: Partial<Budget>): Promise<Budget | null> {
        try {
            const updated = await firstValueFrom(this.http.put<Budget>(`/api/budgets/${id}`, budget));
            this.budgets.set(this.budgets().map(b => b.id === id ? updated : b));
            return updated;
        } catch (error) {
            console.error('Failed to update budget', error);
            return null;
        }
    }

    async deleteBudget(id: string): Promise<boolean> {
        try {
            await firstValueFrom(this.http.delete(`/api/budgets/${id}`));
            this.budgets.set(this.budgets().filter(b => b.id !== id));
            return true;
        } catch (error) {
            console.error('Failed to delete budget', error);
            return false;
        }
    }

    // ─── Budget vs Actual (computed) ─────────────────────────────────────────────
    budgetVsActual = computed(() => {
        return this.budgets().map(budget => {
            const spent = this.transactions()
                .filter(t => t.type === 'EXPENSE' && t.categoryId === budget.categoryId)
                .reduce((sum, t) => sum + (t.amount || 0), 0);
            const percentage = budget.allocatedAmount > 0 ? Math.round((spent / budget.allocatedAmount) * 100) : 0;
            const remaining = budget.allocatedAmount - spent;
            const isOverBudget = spent > budget.allocatedAmount;
            const isNearLimit = !isOverBudget && budget.alertThreshold ? percentage >= budget.alertThreshold : false;

            return {
                ...budget,
                categoryName: budget.category?.name || this.categories().find(c => c.id === budget.categoryId)?.name || 'Unknown',
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
