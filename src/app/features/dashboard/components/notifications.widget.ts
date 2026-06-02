import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TrackerService } from '../../tracker/services/tracker.service';

@Component({
    standalone: true,
    selector: 'fx-notifications-widget',
    imports: [ButtonModule, MenuModule],
    template: ` <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Notifications</div>
        </div>

        @if (hasUpdates('TODAY')) {
            <span class="block text-muted-color font-medium mb-4">TODAY</span>
            <ul class="p-0 mx-0 mt-0 mb-6 list-none">
                @for (update of getUpdatesByGroup('TODAY'); track update.id) {
                    <li class="flex items-center py-2 border-b border-surface">
                        <div [class]="update.bgClass + ' w-12 h-12 flex items-center justify-center rounded-full mr-4 shrink-0'">
                            <i [class]="update.icon + ' text-xl! ' + update.iconClass"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 leading-normal">
                            <strong>{{ update.title }}:</strong> {{ update.message }}
                        </span>
                    </li>
                }
            </ul>
        }

        <!-- Last Week's Updates -->
        @if (hasUpdates('LAST WEEK')) {
            <span class="block text-muted-color font-medium mb-4">LAST WEEK</span>
            <ul class="p-0 m-0 list-none">
                @for (update of getUpdatesByGroup('LAST WEEK'); track update.id) {
                    <li class="flex items-center py-2 border-b border-surface">
                        <div [class]="update.bgClass + ' w-12 h-12 flex items-center justify-center rounded-full mr-4 shrink-0'">
                            <i [class]="update.icon + ' text-xl! ' + update.iconClass"></i>
                        </div>
                        <span class="text-surface-900 dark:text-surface-0 leading-normal">
                            <strong>{{ update.title }}:</strong> {{ update.message }}
                        </span>
                    </li>
                }
            </ul>
        }
    </div>`
})
export class NotificationsWidget implements OnInit {
    trackerService = inject(TrackerService);

    getUpdatesByGroup(group: 'TODAY' | 'LAST WEEK') {
        return this.trackerService.notifications().filter((u: any) => u.timeGroup === group);
    }

    hasUpdates(group: 'TODAY' | 'LAST WEEK'): boolean {
        return this.getUpdatesByGroup(group).length > 0;
    }

    ngOnInit() {
        if (!this.trackerService.transactions().length) {
            this.trackerService.loadTransactions();
        }
    }
}
