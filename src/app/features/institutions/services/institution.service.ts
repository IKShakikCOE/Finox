import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BankProfile, InsuranceProfile, AMCProfile, InstitutionsDataResponse } from '../models/institution.model';

@Injectable({ providedIn: 'root' })
export class InstitutionService {
    private http = inject(HttpClient);

    banks = signal<BankProfile[]>([]);
    insuranceCompanies = signal<InsuranceProfile[]>([]);
    amcs = signal<AMCProfile[]>([]);

    async loadData(): Promise<void> {
        try {
            const data = await firstValueFrom(
                this.http.get<InstitutionsDataResponse>('demo/institutions.json')
            );
            this.banks.set(data.banks);
            this.insuranceCompanies.set(data.insuranceCompanies);
            this.amcs.set(data.amcs);
        } catch (error) {
            console.error('Failed to load institutions data', error);
        }
    }
}
