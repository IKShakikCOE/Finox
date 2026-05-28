import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '@/app/core/auth/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, #10B981 10%, rgba(16, 185, 129, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-4 w-16 shrink-0 mx-auto">
                                <defs>
                                    <linearGradient id="finoxFpGrad" x1="0" y1="0" x2="54" y2="40">
                                        <stop offset="0%" stop-color="#10B981" />
                                        <stop offset="100%" stop-color="#059669" />
                                    </linearGradient>
                                </defs>
                                <circle cx="27" cy="20" r="18" fill="url(#finoxFpGrad)" />
                                <circle cx="27" cy="20" r="15" stroke="rgba(255,255,255,0.18)" stroke-width="1.2" />
                                <path d="M20 11H34V14.5H24V19H32V22.5H24V30H20V11Z" fill="white" />
                                <circle cx="36" cy="12" r="2" fill="#6EE7B7" />
                            </svg>

                            <div *ngIf="!emailSent">
                                <div class="text-surface-900 dark:text-surface-0 text-3xl font-bold mb-2">Forgot Password?</div>
                                <span class="text-muted-color font-medium">Enter your email and we'll send you a reset link</span>
                            </div>
                            <div *ngIf="emailSent">
                                <div class="text-surface-900 dark:text-surface-0 text-3xl font-bold mb-2">Check Your Email</div>
                                <span class="text-muted-color font-medium">We've sent a password reset link to your email</span>
                            </div>
                        </div>

                        <div *ngIf="!emailSent">
                            <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email Address</label>
                            <input pInputText id="email" type="email" placeholder="Enter your registered email" class="w-full md:w-120 mb-8" [(ngModel)]="email" />

                            <p-button label="Send Reset Link" styleClass="w-full" (onClick)="sendResetLink()" [disabled]="!email" [loading]="loading"></p-button>

                            <div class="text-center mt-6">
                                <a routerLink="/auth/login" class="text-primary font-semibold no-underline cursor-pointer">
                                    <i class="pi pi-arrow-left mr-2"></i>Back to Login
                                </a>
                            </div>
                        </div>

                        <div *ngIf="emailSent" class="text-center">
                            <div class="flex items-center justify-center mb-6">
                                <div class="flex items-center justify-center border-circle" style="width: 5rem; height: 5rem; background: #d1fae5">
                                    <i class="pi pi-envelope text-4xl" style="color: #059669"></i>
                                </div>
                            </div>
                            <p class="text-muted-color mb-6">
                                We sent a reset link to <strong>{{ email }}</strong>. Check your inbox and follow the instructions.
                            </p>
                            <p class="text-sm text-muted-color mb-6">Didn't receive the email? Check your spam folder or
                                <a class="text-primary font-semibold no-underline cursor-pointer" (click)="resend()"> resend</a>.
                            </p>
                            <p-button label="Back to Login" routerLink="/auth/login" styleClass="w-full" severity="secondary" [outlined]="true"></p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ForgotPassword {
    private authService = inject(AuthService);
    private messageService = inject(MessageService);

    email = '';
    emailSent = false;
    loading = false;

    async sendResetLink() {
        if (!this.email) return;

        this.loading = true;
        const result = await this.authService.forgotPassword(this.email);
        this.loading = false;

        if (result.success) {
            this.emailSent = true;
            this.messageService.add({ severity: 'success', summary: 'Sent', detail: 'Reset link sent to ' + this.email, life: 4000 });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: result.error || 'Failed to send reset email', life: 4000 });
        }
    }

    async resend() {
        this.loading = true;
        const result = await this.authService.forgotPassword(this.email);
        this.loading = false;

        if (result.success) {
            this.messageService.add({ severity: 'info', summary: 'Resent', detail: 'Reset link resent to ' + this.email, life: 3000 });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: result.error || 'Failed to resend', life: 3000 });
        }
    }
}
