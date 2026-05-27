import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { UserService } from '../services/user.service';

@Component({
    selector: 'fx-user-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, ToastModule, ButtonModule, InputTextModule, TagModule],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h4 class="m-0">My Profile</h4>
                <p-button
                    [label]="editMode ? 'Cancel' : 'Edit Profile'"
                    [icon]="editMode ? 'pi pi-times' : 'pi pi-pencil'"
                    [severity]="editMode ? 'secondary' : 'primary'"
                    [outlined]="true"
                    (onClick)="toggleEdit()"
                />
            </div>

            <!-- Avatar & Basic Info -->
            <div class="flex items-center gap-4 mb-6 p-4 surface-ground border-round">
                <div class="flex items-center justify-center bg-primary border-circle" style="width: 5rem; height: 5rem">
                    <span class="text-2xl font-bold text-white">{{ getInitials() }}</span>
                </div>
                <div>
                    <h3 class="m-0">{{ userService.currentUser().fullName }}</h3>
                    <span class="text-muted-color">{{ userService.currentUser().designation }} at {{ userService.currentUser().company }}</span>
                    <div class="flex items-center gap-2 mt-2">
                        <p-tag value="Active" severity="success" />
                        <span class="text-sm text-muted-color">Member since {{ userService.currentUser().joinDate | date: 'MMM yyyy' }}</span>
                    </div>
                </div>
            </div>

            <!-- Profile Form -->
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6">
                    <label class="block font-bold mb-2">Full Name</label>
                    <input pInputText [(ngModel)]="profile.fullName" [disabled]="!editMode" fluid />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block font-bold mb-2">Email</label>
                    <input pInputText [(ngModel)]="profile.email" [disabled]="!editMode" fluid />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block font-bold mb-2">Phone</label>
                    <input pInputText [(ngModel)]="profile.phone" [disabled]="!editMode" fluid />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block font-bold mb-2">Designation</label>
                    <input pInputText [(ngModel)]="profile.designation" [disabled]="!editMode" fluid />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block font-bold mb-2">Company</label>
                    <input pInputText [(ngModel)]="profile.company" [disabled]="!editMode" fluid />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block font-bold mb-2">City</label>
                    <input pInputText [(ngModel)]="profile.city" [disabled]="!editMode" fluid />
                </div>
                <div class="col-span-12">
                    <label class="block font-bold mb-2">Address</label>
                    <input pInputText [(ngModel)]="profile.address" [disabled]="!editMode" fluid />
                </div>
            </div>

            <div *ngIf="editMode" class="flex justify-end mt-4">
                <p-button label="Save Changes" icon="pi pi-check" (onClick)="saveProfile()" />
            </div>
        </div>
    `
})
export class UserProfileComponent {
    public userService = inject(UserService);
    private messageService = inject(MessageService);

    editMode = false;
    profile: any = {};

    constructor() {
        this.profile = { ...this.userService.currentUser() };
    }

    getInitials(): string {
        const name = this.userService.currentUser().fullName;
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    toggleEdit() {
        this.editMode = !this.editMode;
        if (!this.editMode) {
            this.profile = { ...this.userService.currentUser() };
        }
    }

    saveProfile() {
        this.userService.updateProfile(this.profile);
        this.editMode = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Profile updated successfully', life: 3000 });
    }
}
