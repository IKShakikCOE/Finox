import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/app/core/auth/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, ToastModule],
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
                                    <linearGradient id="finoxLoginGrad" x1="0" y1="0" x2="54" y2="40">
                                        <stop offset="0%" stop-color="#10B981" />
                                        <stop offset="100%" stop-color="#059669" />
                                    </linearGradient>
                                </defs>
                                <circle cx="27" cy="20" r="18" fill="url(#finoxLoginGrad)" />
                                <circle cx="27" cy="20" r="15" stroke="rgba(255,255,255,0.18)" stroke-width="1.2" />
                                <path d="M20 11H34V14.5H24V19H32V22.5H24V30H20V11Z" fill="white" />
                                <circle cx="36" cy="12" r="2" fill="#6EE7B7" />
                            </svg>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-bold mb-2">Welcome to FinOx</div>
                            <span class="text-muted-color font-medium">Sign in to manage your finances</span>
                        </div>

                        <div>
                            <label for="username" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Username or Email</label>
                            <input pInputText id="username" type="text" placeholder="Enter username or email" class="w-full md:w-120 mb-8" [(ngModel)]="username" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1">Remember me</label>
                                </div>
                                <a routerLink="/auth/forgot-password" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Forgot password?</a>
                            </div>
                            <p-button label="Sign In" styleClass="w-full" (onClick)="login()" [loading]="loading"></p-button>

                            <div class="text-center mt-6">
                                <span class="text-muted-color">Don't have an account? </span>
                                <a routerLink="/auth/register" class="text-primary font-semibold no-underline cursor-pointer">Create one</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    private authService = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    username = '';
    password = '';
    checked = false;
    loading = false;

    async login() {
        if (!this.username || !this.password) {
            this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'Please enter username and password', life: 3000 });
            return;
        }

        this.loading = true;
        const result = await this.authService.login(this.username, this.password, this.checked);
        this.loading = false;

        if (result.success) {
            this.router.navigate(['/app']);
        } else {
            this.messageService.add({ severity: 'error', summary: 'Login Failed', detail: result.error || 'Invalid credentials', life: 4000 });
        }
    }
}
