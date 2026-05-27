import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CalendarService } from '../services/calendar.service';
import { CalendarEvent } from '../models/calendar.model';

@Component({
    selector: 'fx-calendar-page',
    standalone: true,
    imports: [CommonModule, FormsModule, ToastModule, ButtonModule, TagModule, DatePickerModule, DialogModule, InputTextModule, SelectModule, TextareaModule],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="grid grid-cols-12 gap-4">
            <!-- Calendar -->
            <div class="col-span-12 lg:col-span-5">
                <div class="card">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="m-0">Calendar</h4>
                        <p-button label="Add Event" icon="pi pi-plus" severity="secondary" size="small" (onClick)="openNewEvent()" />
                    </div>
                    <p-datepicker
                        [(ngModel)]="selectedDate"
                        [inline]="true"
                        (onSelect)="onDateSelect($event)"
                        [style]="{ width: '100%' }"
                    />
                </div>
            </div>

            <!-- Events Panel -->
            <div class="col-span-12 lg:col-span-7">
                <!-- Selected Date Events -->
                <div class="card mb-4">
                    <h5 class="mt-0 mb-4">
                        <i class="pi pi-calendar mr-2"></i>
                        Events for {{ selectedDate | date: 'dd MMM yyyy' }}
                    </h5>
                    <div *ngIf="calendarService.eventsForSelectedDate().length === 0" class="text-center p-4 text-muted-color">
                        <i class="pi pi-calendar-times text-3xl mb-2 block"></i>
                        <p>No events on this date.</p>
                    </div>
                    <div class="flex flex-col gap-3">
                        <div *ngFor="let event of calendarService.eventsForSelectedDate()" class="flex items-center justify-between p-3 border-round surface-ground">
                            <div class="flex items-center gap-3">
                                <i [class]="getEventIcon(event.type) + ' text-lg'" [style.color]="getEventColor(event.type)"></i>
                                <div>
                                    <span class="font-semibold block">{{ event.title }}</span>
                                    <span class="text-sm text-muted-color">{{ event.description }}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <p-tag [value]="event.type" [severity]="getTypeSeverity(event.type)" />
                                <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="deleteEvent(event.id)" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Events -->
                <div class="card">
                    <h5 class="mt-0 mb-4"><i class="pi pi-clock mr-2"></i>Upcoming Events</h5>
                    <div class="flex flex-col gap-3">
                        <div *ngFor="let event of calendarService.upcomingEvents()" class="flex items-center justify-between p-3 border-round border surface-border">
                            <div class="flex items-center gap-3">
                                <div class="text-center" style="min-width: 3rem">
                                    <span class="block text-xs text-muted-color">{{ event.date | date: 'MMM' }}</span>
                                    <span class="block text-xl font-bold">{{ event.date | date: 'dd' }}</span>
                                </div>
                                <div>
                                    <span class="font-semibold block">{{ event.title }}</span>
                                    <span class="text-sm text-muted-color">{{ event.description }}</span>
                                </div>
                            </div>
                            <p-tag [value]="event.type" [severity]="getTypeSeverity(event.type)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Event Dialog -->
        <p-dialog [(visible)]="eventDialogVisible" header="Add Event" [modal]="true" [style]="{ width: '450px' }">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Title</label>
                        <input pInputText [(ngModel)]="newEvent.title" placeholder="Event title" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Date</label>
                        <p-datepicker [(ngModel)]="newEventDate" dateFormat="yy-mm-dd" [showIcon]="true" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Type</label>
                        <p-select [(ngModel)]="newEvent.type" [options]="eventTypes" placeholder="Select type" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Description</label>
                        <textarea pTextarea [(ngModel)]="newEvent.description" rows="3" fluid placeholder="Optional description"></textarea>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" [text]="true" (onClick)="eventDialogVisible = false" />
                <p-button label="Save" icon="pi pi-check" (onClick)="saveEvent()" [disabled]="!newEvent.title" />
            </ng-template>
        </p-dialog>
    `
})
export class CalendarPageComponent {
    public calendarService = inject(CalendarService);
    private messageService = inject(MessageService);

    selectedDate: Date = new Date();
    eventDialogVisible = false;
    newEvent: Partial<CalendarEvent> = {};
    newEventDate: Date = new Date();
    eventTypes = ['PAYMENT', 'MEETING', 'REMINDER', 'DEADLINE'];

    onDateSelect(event: any) {
        const date = event instanceof Date ? event : new Date(event);
        this.calendarService.selectedDate.set(date);
        this.selectedDate = date;
    }

    openNewEvent() {
        this.newEvent = { type: 'REMINDER' };
        this.newEventDate = this.selectedDate;
        this.eventDialogVisible = true;
    }

    saveEvent() {
        if (!this.newEvent.title) return;

        const dateStr = this.newEventDate instanceof Date
            ? this.newEventDate.toISOString().substring(0, 10)
            : String(this.newEventDate);

        this.calendarService.addEvent({
            id: '',
            title: this.newEvent.title!,
            date: dateStr,
            type: (this.newEvent.type as any) || 'REMINDER',
            description: this.newEvent.description
        });

        this.eventDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Event created', life: 3000 });

        // Refresh selected date view
        this.calendarService.selectedDate.set(this.newEventDate);
    }

    deleteEvent(id: string) {
        this.calendarService.deleteEvent(id);
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Event removed', life: 3000 });
    }

    getEventIcon(type: string): string {
        switch (type) {
            case 'PAYMENT': return 'pi pi-money-bill';
            case 'MEETING': return 'pi pi-users';
            case 'REMINDER': return 'pi pi-bell';
            case 'DEADLINE': return 'pi pi-exclamation-triangle';
            default: return 'pi pi-calendar';
        }
    }

    getEventColor(type: string): string {
        switch (type) {
            case 'PAYMENT': return '#10B981';
            case 'MEETING': return '#3B82F6';
            case 'REMINDER': return '#F59E0B';
            case 'DEADLINE': return '#EF4444';
            default: return '#6B7280';
        }
    }

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
