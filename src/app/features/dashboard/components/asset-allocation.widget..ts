import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DashboardService } from '../services/dashboard.service';

@Component({
    standalone: true,
    selector: 'fx-asset-allocation-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: ` <div class="card">
        <div class="font-semibold text-xl mb-6">Asset Allocation</div>
        <ul class="list-none p-0 m-0">
            @for (item of dashboardService.allocations(); track item.assetClass) {
                <li class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">{{ item.assetClass }}</span>
                        <div class="mt-1 text-muted-color">{{ item.description }}</div>
                    </div>
                    <div class="mt-2 md:mt-0 flex items-center">
                        <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                            <div [class]="item.colorClass + ' h-full'" [style.width.%]="item.percentage"></div>
                        </div>
                        <span [class]="item.textColorClass + ' ml-4 font-medium'">{{ item.percentage }}%</span>
                    </div>
                </li>
            }
        </ul>
    </div>`
})
export class AssetAllocationWidget {
    dashboardService = inject(DashboardService);
}
