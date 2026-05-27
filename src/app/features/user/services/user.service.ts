import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfile, UserSettings } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private router: Router | undefined;

    currentUser = signal<UserProfile>({
        id: 'USR001',
        fullName: 'Shakil Ahmed',
        email: 'shakil@finox.app',
        phone: '+880 1712-345678',
        designation: 'Software Engineer',
        company: 'Techspire Solutions',
        address: 'House 12, Road 5, Block C',
        city: 'Dhaka',
        country: 'Bangladesh',
        joinDate: '2025-01-15',
        currency: 'BDT',
        language: 'English',
        timezone: 'Asia/Dhaka'
    });

    settings = signal<UserSettings>({
        notifications: {
            email: true,
            push: true,
            budgetAlerts: true,
            weeklyReport: false
        },
        privacy: {
            showProfile: true,
            showActivity: true
        },
        display: {
            currency: 'BDT',
            dateFormat: 'dd MMM yyyy',
            language: 'English'
        }
    });

    isLoggedIn = signal<boolean>(true);

    updateProfile(profile: Partial<UserProfile>) {
        this.currentUser.set({ ...this.currentUser(), ...profile });
    }

    updateSettings(settings: UserSettings) {
        this.settings.set(settings);
    }

    changePassword(currentPassword: string, newPassword: string): { success: boolean; message: string } {
        // Simulated password change
        if (currentPassword === 'password123') {
            return { success: true, message: 'Password changed successfully.' };
        }
        return { success: false, message: 'Current password is incorrect.' };
    }

    logout(router: Router) {
        this.isLoggedIn.set(false);
        router.navigate(['/auth/login']);
    }
}
