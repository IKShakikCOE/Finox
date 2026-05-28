import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { BankService } from '../services/bank.service';
import { BankProfile } from '../models/bank.model';
import { BankProduct } from '../models/bank.model';

@Component({
    selector: 'fx-bank-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, TabsModule, TagModule, ButtonModule],
    template: `
        <div *ngIf="bank">
            <!-- Header -->
            <div class="card mb-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p-button label="Back to Banks" icon="pi pi-arrow-left" [text]="true" severity="secondary" [routerLink]="['/app/bank']" />
                        <h3 class="mt-3 mb-1">{{ bank.name }}</h3>
                        <div class="flex items-center gap-2 flex-wrap">
                            <p-tag [value]="bank.type" severity="info" />
                            <p-tag [value]="'Est. ' + bank.established" severity="secondary" />
                            <p-tag [value]="'Rating: ' + bank.rating + ' (' + bank.ratingAgency + ')'" [severity]="getRatingSeverity(bank.rating)" />
                            <p-tag [value]="bank.riskLevel + ' Risk'" [severity]="getRiskSeverity(bank.riskLevel)" />
                            <p-tag [value]="'SWIFT: ' + bank.swiftCode" severity="secondary" />
                        </div>
                    </div>
                    <a [href]="bank.website" target="_blank" class="no-underline">
                        <p-button label="Website" icon="pi pi-external-link" severity="secondary" [outlined]="true" />
                    </a>
                </div>
            </div>

            <!-- Tabs -->
            <p-tabs value="0">
                <p-tablist>
                    <p-tab value="0">Overview</p-tab>
                    <p-tab value="1">Branches & ATMs</p-tab>
                    <p-tab value="2">Products ({{ bankProducts.length }})</p-tab>
                    <p-tab value="3">Services</p-tab>
                </p-tablist>

                <p-tabpanels>
                    <!-- Overview Tab -->
                    <p-tabpanel value="0">
                        <div class="grid grid-cols-12 gap-4 mt-4">
                            <div class="col-span-12 md:col-span-3">
                                <div class="p-4 surface-ground border-round text-center">
                                    <span class="block text-muted-color text-sm mb-2">Authorized Capital</span>
                                    <span class="text-xl font-bold">৳{{ bank.authorizedCapital }}</span>
                                </div>
                            </div>
                            <div class="col-span-12 md:col-span-3">
                                <div class="p-4 surface-ground border-round text-center">
                                    <span class="block text-muted-color text-sm mb-2">Paid-up Capital</span>
                                    <span class="text-xl font-bold">৳{{ bank.paidUpCapital }}</span>
                                </div>
                            </div>
                            <div class="col-span-12 md:col-span-3">
                                <div class="p-4 surface-ground border-round text-center">
                                    <span class="block text-muted-color text-sm mb-2">Total Assets</span>
                                    <span class="text-xl font-bold">৳{{ bank.totalAssets }}</span>
                                </div>
                            </div>
                            <div class="col-span-12 md:col-span-3">
                                <div class="p-4 surface-ground border-round text-center">
                                    <span class="block text-muted-color text-sm mb-2">NPL Ratio</span>
                                    <span class="text-xl font-bold" [class.text-green-500]="bank.nplRatio < 4" [class.text-orange-500]="bank.nplRatio >= 4 && bank.nplRatio < 10" [class.text-red-500]="bank.nplRatio >= 10">{{ bank.nplRatio }}%</span>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-12 gap-4 mt-4">
                            <div class="col-span-12 md:col-span-6">
                                <div class="border surface-border border-round p-4">
                                    <h5 class="mt-0 mb-3">Leadership</h5>
                                    <div class="flex flex-col gap-3">
                                        <div class="flex items-center justify-between">
                                            <span class="text-muted-color">Chairman</span>
                                            <span class="font-semibold">{{ bank.chairman }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-muted-color">MD & CEO</span>
                                            <span class="font-semibold">{{ bank.md }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-muted-color">Headquarters</span>
                                            <span class="font-semibold">{{ bank.headquarters }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-muted-color">Employees</span>
                                            <span class="font-semibold">{{ bank.employees | number }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 md:col-span-6">
                                <div class="border surface-border border-round p-4">
                                    <h5 class="mt-0 mb-3">Risk Profile</h5>
                                    <div class="flex flex-col gap-3">
                                        <div class="flex items-center justify-between">
                                            <span class="text-muted-color">Credit Rating</span>
                                            <span class="font-semibold">{{ bank.rating }} ({{ bank.ratingAgency }})</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-muted-color">Risk Level</span>
                                            <p-tag [value]="bank.riskLevel" [severity]="getRiskSeverity(bank.riskLevel)" />
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-muted-color">NPL Ratio</span>
                                            <span class="font-bold" [class.text-green-500]="bank.nplRatio < 4" [class.text-red-500]="bank.nplRatio >= 10">{{ bank.nplRatio }}%</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-muted-color">SWIFT Code</span>
                                            <span class="font-semibold font-mono">{{ bank.swiftCode }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </p-tabpanel>

                    <!-- Branches & ATMs Tab -->
                    <p-tabpanel value="1">
                        <div class="grid grid-cols-12 gap-4 mt-4 mb-4">
                            <div class="col-span-12 md:col-span-4">
                                <div class="p-4 surface-ground border-round text-center">
                                    <i class="pi pi-building text-3xl text-primary mb-2 block"></i>
                                    <span class="text-3xl font-bold block">{{ bank.branches | number }}</span>
                                    <span class="text-muted-color">Branches Nationwide</span>
                                </div>
                            </div>
                            <div class="col-span-12 md:col-span-4">
                                <div class="p-4 surface-ground border-round text-center">
                                    <i class="pi pi-credit-card text-3xl text-green-500 mb-2 block"></i>
                                    <span class="text-3xl font-bold block">{{ bank.atmBooths | number }}</span>
                                    <span class="text-muted-color">ATM Booths</span>
                                </div>
                            </div>
                            <div class="col-span-12 md:col-span-4">
                                <div class="p-4 surface-ground border-round text-center">
                                    <i class="pi pi-users text-3xl text-blue-500 mb-2 block"></i>
                                    <span class="text-3xl font-bold block">{{ bank.employees | number }}</span>
                                    <span class="text-muted-color">Employees</span>
                                </div>
                            </div>
                        </div>

                        <!-- Embedded pages for DBBL -->
                        <div *ngIf="bank.id === 'DBBL'">
                            <div class="flex flex-wrap gap-2 mb-4">
                                <p-button
                                    *ngFor="let loc of locationTabs"
                                    [label]="loc.label"
                                    [icon]="loc.icon"
                                    [severity]="activeLocationTab === loc.key ? 'primary' : 'secondary'"
                                    [outlined]="activeLocationTab !== loc.key"
                                    size="small"
                                    (onClick)="setLocationTab(loc.key)"
                                />
                            </div>

                            <div class="border surface-border border-round overflow-hidden" style="height: 600px">
                                <iframe
                                    [src]="getIframeUrl()"
                                    style="width: 100%; height: 100%; border: none;"
                                    title="Bank Locations"
                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                ></iframe>
                            </div>

                            <div class="flex items-center justify-between mt-3">
                                <p class="text-sm text-muted-color m-0">
                                    <i class="pi pi-info-circle mr-1"></i>
                                    Content loaded from {{ bank.name }} official website. If not visible, use the direct link.
                                </p>
                                <a [href]="getCurrentLocationUrl()" target="_blank" class="no-underline">
                                    <p-button label="Open in New Tab" icon="pi pi-external-link" severity="secondary" [outlined]="true" size="small" />
                                </a>
                            </div>
                        </div>

                        <!-- Fallback for other banks -->
                        <div *ngIf="bank.id !== 'DBBL'" class="mt-4 border surface-border border-round p-4">
                            <h5 class="mt-0 mb-3">Branch Locations (Sample)</h5>
                            <div class="flex flex-col gap-3">
                                <div *ngFor="let branch of sampleBranches" class="flex items-center justify-between p-3 surface-ground border-round">
                                    <div class="flex items-center gap-3">
                                        <i class="pi pi-map-marker text-primary"></i>
                                        <div>
                                            <span class="font-semibold block">{{ branch.name }}</span>
                                            <span class="text-sm text-muted-color">{{ branch.address }}</span>
                                        </div>
                                    </div>
                                    <p-tag [value]="branch.type" [severity]="branch.type === 'Main' ? 'info' : 'secondary'" />
                                </div>
                            </div>
                            <p class="text-sm text-muted-color mt-3 mb-0">
                                <i class="pi pi-info-circle mr-1"></i>
                                Full branch directory available on the bank's website.
                            </p>
                        </div>
                    </p-tabpanel>

                    <!-- Products Tab -->
                    <p-tabpanel value="2">
                        <div class="mt-4">
                            <div *ngIf="bankProducts.length === 0" class="text-center p-6 text-muted-color">
                                <i class="pi pi-box text-4xl mb-3 block"></i>
                                <p>No products listed for this bank yet.</p>
                            </div>

                            <div class="grid grid-cols-12 gap-4">
                                <div *ngFor="let product of bankProducts" class="col-span-12 md:col-span-6">
                                    <div class="border surface-border border-round p-4">
                                        <div class="flex items-center justify-between mb-2">
                                            <p-tag [value]="product.category" [severity]="getProductSeverity(product.category)" />
                                            <span class="text-xl font-bold text-primary">{{ product.interestRate }}%</span>
                                        </div>
                                        <h5 class="mt-0 mb-2">{{ product.name }}</h5>
                                        <div class="flex gap-4 mb-3 text-sm">
                                            <div *ngIf="product.minDeposit">
                                                <span class="text-muted-color">Min Deposit: </span>
                                                <span class="font-semibold">{{ product.minDeposit | currency: 'BDT' : 'symbol' : '1.0-0' }}</span>
                                            </div>
                                            <div *ngIf="product.tenure">
                                                <span class="text-muted-color">Tenure: </span>
                                                <span class="font-semibold">{{ product.tenure }}</span>
                                            </div>
                                        </div>
                                        <ul class="list-none p-0 m-0">
                                            <li *ngFor="let f of product.features" class="flex items-center gap-2 mb-1">
                                                <i class="pi pi-check-circle text-green-500 text-xs"></i>
                                                <span class="text-sm">{{ f }}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </p-tabpanel>

                    <!-- Services Tab -->
                    <p-tabpanel value="3">
                        <div class="grid grid-cols-12 gap-4 mt-4">
                            <div class="col-span-12 md:col-span-6">
                                <div class="border surface-border border-round p-4">
                                    <h5 class="mt-0 mb-3"><i class="pi pi-briefcase mr-2"></i>Banking Services</h5>
                                    <div class="flex flex-col gap-2">
                                        <div *ngFor="let s of bank.services" class="flex items-center gap-2 p-2 surface-ground border-round">
                                            <i class="pi pi-check text-green-500"></i>
                                            <span>{{ s }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 md:col-span-6">
                                <div class="border surface-border border-round p-4">
                                    <h5 class="mt-0 mb-3"><i class="pi pi-mobile mr-2"></i>Digital Services</h5>
                                    <div class="flex flex-col gap-2">
                                        <div *ngFor="let d of bank.digitalServices" class="flex items-center gap-2 p-2 surface-ground border-round">
                                            <i class="pi pi-check text-blue-500"></i>
                                            <span>{{ d }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>

        <div *ngIf="!bank" class="card text-center p-6">
            <i class="pi pi-spin pi-spinner text-4xl text-muted-color mb-3 block"></i>
            <p class="text-muted-color">Loading bank details...</p>
        </div>
    `
})
export class BankDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private bankService = inject(BankService);
    private sanitizer = inject(DomSanitizer);

    bank: BankProfile | undefined;
    bankProducts: BankProduct[] = [];
    sampleBranches: { name: string; address: string; type: string }[] = [];

    // Location iframe tabs (DBBL specific for now)
    activeLocationTab: string = 'branches';
    locationTabs = [
        { key: 'branches', label: 'Branches', icon: 'pi pi-building', url: 'https://app.dutchbanglabank.com/DBBLWeb/BranchLocation' },
        { key: 'atm', label: 'ATM Locations', icon: 'pi pi-credit-card', url: 'https://app.dutchbanglabank.com/DBBLWeb/ATMLocation' },
        { key: 'subbranch', label: 'Sub-Branches', icon: 'pi pi-sitemap', url: 'https://www.dutchbanglabank.com/sub-branch/sub-branch.html' },
        { key: 'crm', label: 'CRM/Fast Track', icon: 'pi pi-bolt', url: 'https://app.dutchbanglabank.com/dbblwebapp/crmListCrmViewAction' },
        { key: 'agents', label: 'Sub-Agents', icon: 'pi pi-users', url: 'https://app.dutchbanglabank.com/DBBLAgents/vwparamSubAgentAction' }
    ];

    setLocationTab(key: string) {
        this.activeLocationTab = key;
    }

    getIframeUrl(): SafeResourceUrl {
        const tab = this.locationTabs.find(t => t.key === this.activeLocationTab);
        return this.sanitizer.bypassSecurityTrustResourceUrl(tab?.url || '');
    }

    getCurrentLocationUrl(): string {
        const tab = this.locationTabs.find(t => t.key === this.activeLocationTab);
        return tab?.url || '';
    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        this.loadData(id);
    }

    private async loadData(id: string | null) {
        if (!this.bankService.profiles().length) {
            await this.bankService.loadProfiles();
        }
        if (!this.bankService.products().length) {
            await this.bankService.loadBankData();
        }

        this.bank = this.bankService.profiles().find(b => b.id === id);
        this.bankProducts = this.bankService.products().filter(p => p.bankId === id);
        this.generateSampleBranches();
    }

    private generateSampleBranches() {
        if (!this.bank) return;
        const locations = [
            { name: 'Head Office', address: 'Motijheel, Dhaka', type: 'Main' },
            { name: 'Gulshan Branch', address: 'Gulshan-2, Dhaka', type: 'Branch' },
            { name: 'Dhanmondi Branch', address: 'Dhanmondi 27, Dhaka', type: 'Branch' },
            { name: 'Uttara Branch', address: 'Uttara Sector 4, Dhaka', type: 'Branch' },
            { name: 'Chittagong Main', address: 'Agrabad C/A, Chittagong', type: 'Branch' },
            { name: 'Sylhet Branch', address: 'Zindabazar, Sylhet', type: 'Branch' },
            { name: 'Rajshahi Branch', address: 'Saheb Bazar, Rajshahi', type: 'Branch' },
            { name: 'Khulna Branch', address: 'KDA Avenue, Khulna', type: 'Branch' }
        ];
        this.sampleBranches = locations;
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

    getProductSeverity(category: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (category) {
            case 'SAVINGS': return 'info';
            case 'FDR': return 'success';
            case 'DPS': return 'secondary';
            case 'LOAN': return 'warn';
            default: return 'info';
        }
    }
}
