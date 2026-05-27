import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../services/user.service';

@Component({
    selector: 'fx-change-password',
    standalone: true,
    imports: [CommonModule, FormsModule, ToastModule, ButtonModule, PasswordModule],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card" style="max-width: 500px">
            <h4 class="mb-6">Change Password</h4>

            <div class="flex flex-col gap-4">
                <div>
                    <label class="block font-bold mb-2">Current Password</label>
                    <p-password [(ngModel)]="currentPassword" [feedback]="false" [toggleMask]="true" fluid placeholder="Enter current password" />
                </div>
                <div>
                    <label class="block font-bold mb-2">New Password</label>
                    <p-password [(ngModel)]="newPassword" [toggleMask]="true" fluid placeholder="Enter new password" />
                </div>
                <div>
                    <label class="block font-bold mb-2">Confirm New Password</label>
                    <p-password [(ngModel)]="confirmPassword" [feedback]="false" [toggleMask]="true" fluid placeholder="Confirm new password" />
                    <small class="text-red-500" *ngIf="confirmPassword && newPassword !== confirmPassword">Passwords do not match.</small>
                </div>

                <p-button label="Change Password" icon="pi pi-lock" (onClick)="changePassword()" [disabled]="!isValid()" class="mt-2" />
            </div>

            <div class="mt-4 p-3 surface-ground border-round">
                <span class="text-sm text-muted-color">
                    <i class="pi pi-info-circle mr-1"></i>
                    Password must be at least 8 characters with a mix of letters and numbers.
                </span>
            </div>
        </div>
    `
})
export class ChangePasswordComponent {
    private userService = inject(UserService);
    private messageService = inject(MessageService);

    currentPassword = '';
    newPassword = '';
    confirmPassword = '';

    isValid(): boolean {
        return !!(this.currentPassword && this.newPassword && this.newPassword === this.confirmPassword && this.newPassword.length >= 8);
    }

    changePassword() {
        const result = this.userService.changePassword(this.currentPassword, this.newPassword);
        if (result.success) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: result.message, life: 3000 });
            this.currentPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: result.message, life: 3000 });
        }
    }
}
