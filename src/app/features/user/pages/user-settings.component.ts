import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { UserService } from '../services/user.service';
import { UserSettings } from '../models/user.model';

@Component({
    selector: 'fx-user-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, ToastModule, ButtonModule, ToggleSwitchModule, SelectModule],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <h4 class="mb-6">Settings</h4>

            <!-- Notifications -->
            <div class="border surface-border border-round p-4 mb-4">
                <h5 class="mt-0 mb-4"><i class="pi pi-bell mr-2"></i>Notifications</h5>
                <div class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-semibold block">Email Notifications</span>
                            <span class="text-sm text-muted-color">Receive updates via email</span>
                        </div>
                        <p-toggleswitch [(ngModel)]="settings.notifications.email" />
                    </div>
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-semibold block">Push Notifications</span>
                            <span class="text-sm text-muted-color">Browser push notifications</span>
                        </div>
                        <p-toggleswitch [(ngModel)]="settings.notifications.push" />
                    </div>
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-semibold block">Budget Alerts</span>
                            <span class="text-sm text-muted-color">Alert when budget threshold is reached</span>
                        </div>
                        <p-toggleswitch [(ngModel)]="settings.notifications.budgetAlerts" />
                    </div>
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-semibold block">Weekly Report</span>
                            <span class="text-sm text-muted-color">Receive weekly financial summary</span>
                        </div>
                        <p-toggleswitch [(ngModel)]="settings.notifications.weeklyReport" />
                    </div>
                </div>
            </div>

            <!-- Privacy -->
            <div class="border surface-border border-round p-4 mb-4">
                <h5 class="mt-0 mb-4"><i class="pi pi-lock mr-2"></i>Privacy</h5>
                <div class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-semibold block">Show Profile</span>
                            <span class="text-sm text-muted-color">Make your profile visible to others</span>
                        </div>
                        <p-toggleswitch [(ngModel)]="settings.privacy.showProfile" />
                    </div>
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-semibold block">Show Activity</span>
                            <span class="text-sm text-muted-color">Show your recent activity</span>
                        </div>
                        <p-toggleswitch [(ngModel)]="settings.privacy.showActivity" />
                    </div>
                </div>
            </div>

            <!-- Display -->
            <div class="border surface-border border-round p-4 mb-4">
                <h5 class="mt-0 mb-4"><i class="pi pi-palette mr-2"></i>Display Preferences</h5>
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-4">
                        <label class="block font-semibold mb-2">Currency</label>
                        <p-select [(ngModel)]="settings.display.currency" [options]="currencies" placeholder="Select currency" fluid />
                    </div>
                    <div class="col-span-12 md:col-span-4">
                        <label class="block font-semibold mb-2">Date Format</label>
                        <p-select [(ngModel)]="settings.display.dateFormat" [options]="dateFormats" placeholder="Select format" fluid />
                    </div>
                    <div class="col-span-12 md:col-span-4">
                        <label class="block font-semibold mb-2">Language</label>
                        <p-select [(ngModel)]="settings.display.language" [options]="languages" placeholder="Select language" fluid />
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <p-button label="Save Settings" icon="pi pi-check" (onClick)="saveSettings()" />
            </div>
        </div>
    `
})
export class UserSettingsComponent {
    public userService = inject(UserService);
    private messageService = inject(MessageService);

    settings: UserSettings;

    currencies = ['BDT', 'USD', 'EUR', 'GBP', 'INR'];
    dateFormats = ['dd MMM yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy'];
    languages = ['English', 'বাংলা'];

    constructor() {
        this.settings = JSON.parse(JSON.stringify(this.userService.settings()));
    }

    saveSettings() {
        this.userService.updateSettings(this.settings);
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Settings updated', life: 3000 });
    }
}
