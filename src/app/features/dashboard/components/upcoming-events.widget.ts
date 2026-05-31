import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CalendarService } from '../../calendar/services/calendar.service';

@Component({
    standalone: true,
    selector: 'fx-upcoming-events-widget',
    imports: [CommonModule, RouterModule, ButtonModule, TagModule],
    template: `
    <div class="card">
        <div class="flex items-center justify-between mb-4">
            <div class="font-semibold text-xl">Upcoming Events</div>
            <p-button label="Calendar" icon="pi pi-calendar" [text]="true"
                severity="secondary" size="small" routerLink="/app/calendar" />
        </div>

        @if (calendarService.upcomingEvents().length === 0) {
            <div class="text-center p-4 text-muted-color">
                <i class="pi pi-calendar-times text-2xl mb-2 block"></i>
                <p class="text-sm m-0">No upcoming events.</p>
            </div>
        } @else {
            <div class="flex flex-col gap-3">
                @for (event of calendarService.upcomingEvents().slice(0, 5); track event.id) {
                    <div class="flex items-center gap-3 p-2 surface-ground border-round">
                        <div class="text-center" style="min-width: 2.5rem">
                            <span class="block text-xs text-muted-color">{{ event.date | date:'MMM' }}</span>
                            <span class="block text-lg font-bold">{{ event.date | date:'dd' }}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <span class="font-medium text-sm block truncate">{{ event.title }}</span>
                            <span class="text-xs text-muted-color truncate block">{{ event.description }}</span>
                        </div>
                        <p-tag [value]="event.type" [severity]="getTypeSeverity(event.type)" />
                    </div>
                }
            </div>
        }
    </div>`
})
export class UpcomingEventsWidget {
    calendarService = inject(CalendarService);

    getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (type) {
            case 'PAYMENT': return 'success';
            case 'MEETING': return 'info';
            case 'REMINDER': return 'warn';
            case 'DEADLINE': return 'danger';
            default: return 'secondary';
        }
    }
}
