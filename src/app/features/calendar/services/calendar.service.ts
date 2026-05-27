import { Injectable, signal, computed } from '@angular/core';
import { CalendarEvent } from '../models/calendar.model';

@Injectable({ providedIn: 'root' })
export class CalendarService {
    events = signal<CalendarEvent[]>([
        { id: 'EVT001', title: 'DBBL FDR Maturity', date: '2026-06-01', type: 'PAYMENT', description: 'Fixed deposit maturity - ৳50,000 + interest' },
        { id: 'EVT002', title: 'Monthly SIP - IDLC Fund', date: '2026-06-05', type: 'PAYMENT', description: 'Auto-debit ৳10,000 for IDLC Balanced Fund' },
        { id: 'EVT003', title: 'Credit Card Bill Due', date: '2026-06-10', type: 'DEADLINE', description: 'City Bank credit card payment deadline' },
        { id: 'EVT004', title: 'Insurance Premium', date: '2026-06-15', type: 'PAYMENT', description: 'MetLife monthly premium ৳5,000' },
        { id: 'EVT005', title: 'Tax Filing Deadline', date: '2026-06-30', type: 'DEADLINE', description: 'Annual income tax return submission' },
        { id: 'EVT006', title: 'Budget Review Meeting', date: '2026-05-28', type: 'MEETING', description: 'Monthly budget review with team' },
        { id: 'EVT007', title: 'Salary Credit', date: '2026-06-01', type: 'PAYMENT', description: 'Expected salary credit from Techspire Solutions' },
        { id: 'EVT008', title: 'DPS Installment', date: '2026-06-07', type: 'PAYMENT', description: 'DBBL Monthly Savings Scheme ৳5,000' },
        { id: 'EVT009', title: 'Rent Payment', date: '2026-06-01', type: 'PAYMENT', description: 'Monthly house rent ৳20,000' },
        { id: 'EVT010', title: 'Portfolio Review', date: '2026-06-20', type: 'REMINDER', description: 'Review mutual fund and stock portfolio performance' },
        { id: 'EVT011', title: 'Electricity Bill', date: '2026-06-12', type: 'DEADLINE', description: 'DPDC electricity bill payment' },
        { id: 'EVT012', title: 'Investment Club Meeting', date: '2026-06-18', time: '19:00', type: 'MEETING', description: 'Monthly investment discussion group' }
    ]);

    selectedDate = signal<Date>(new Date());

    eventsForSelectedDate = computed(() => {
        const dateStr = this.formatDate(this.selectedDate());
        return this.events().filter(e => e.date === dateStr);
    });

    upcomingEvents = computed(() => {
        const today = this.formatDate(new Date());
        return this.events()
            .filter(e => e.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 8);
    });

    addEvent(event: CalendarEvent) {
        event.id = 'EVT' + Date.now();
        this.events.set([...this.events(), event]);
    }

    deleteEvent(id: string) {
        this.events.set(this.events().filter(e => e.id !== id));
    }

    getEventDates(): Date[] {
        return this.events().map(e => new Date(e.date));
    }

    private formatDate(date: Date): string {
        return date.toISOString().substring(0, 10);
    }
}
