import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../services/dashboard.service';

@Component({
    standalone: true,
    selector: 'fx-stats-widget',
    imports: [CommonModule],
    templateUrl: './stats.widget.html'
})
export class StatsWidgetComponent {
    dashboardService = inject(DashboardService);
}
