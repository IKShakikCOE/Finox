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
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, #10B981 10%, rgba(16, 185, 129, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-16 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-4 w-16 shrink-0 mx-auto">
                                <defs>
                                    <linearGradient id="finoxRegGrad" x1="0" y1="0" x2="54" y2="40">
                                        <stop offset="0%" stop-color="#10B981" />
                                        <stop offset="100%" stop-color="#059669" />
                                    </linearGradient>
                                </defs>
                                <circle cx="27" cy="20" r="18" fill="url(#finoxRegGrad)" />
                                <circle cx="27" cy="20" r="15" stroke="rgba(255,255,255,0.18)" stroke-width="1.2" />
                                <path d="M20 11H34V14.5H24V19H32V22.5H24V30H20V11Z" fill="white" />
                                <circle cx="36" cy="12" r="2" fill="#6EE7B7" />
                            </svg>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-bold mb-2">Create Account</div>
                            <span class="text-muted-color font-medium">Start managing your finances today</span>
                        </div>

                        <div>
                            <div class="grid grid-cols-12 gap-4 mb-6">
                                <div class="col-span-6">
                                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">First Name</label>
                                    <input pInputText type="text" placeholder="First name" class="w-full" [(ngModel)]="firstName" />
                                </div>
                                <div class="col-span-6">
                                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Last Name</label>
                                    <input pInputText type="text" placeholder="Last name" class="w-full" [(ngModel)]="lastName" />
                                </div>
                            </div>

                            <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Username</label>
                            <input pInputText type="text" placeholder="Choose a username" class="w-full md:w-120 mb-6" [(ngModel)]="username" />

                            <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Email</label>
                            <input pInputText type="email" placeholder="Email address" class="w-full md:w-120 mb-6" [(ngModel)]="email" />

                            <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Password</label>
                            <p-password [(ngModel)]="password" placeholder="Create a password" [toggleMask]="true" styleClass="mb-6" [fluid]="true"></p-password>

                            <div class="flex items-center mb-6">
                                <p-checkbox [(ngModel)]="agreed" id="terms" binary class="mr-2"></p-checkbox>
                                <label for="terms" class="text-sm">I agree to the <a class="text-primary no-underline cursor-pointer">Terms of Service</a> and <a class="text-primary no-underline cursor-pointer">Privacy Policy</a></label>
                            </div>

                            <p-button label="Create Account" styleClass="w-full" (onClick)="register()" [disabled]="!agreed" [loading]="loading"></p-button>

                            <div class="text-center mt-6">
                                <span class="text-muted-color">Already have an account? </span>
                                <a routerLink="/auth/login" class="text-primary font-semibold no-underline cursor-pointer">Sign in</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Register {
    private authService = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    firstName = '';
    lastName = '';
    username = '';
    email = '';
    password = '';
    agreed = false;
    loading = false;

    async register() {
        if (!this.username || !this.email || !this.password) {
            this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'Please fill all required fields', life: 3000 });
            return;
        }

        this.loading = true;
        const result = await this.authService.register(this.username, this.email, this.password, this.firstName, this.lastName);
        this.loading = false;

        if (result.success) {
            this.messageService.add({ severity: 'success', summary: 'Account Created', detail: 'Registration successful! Please login.', life: 4000 });
            // Redirect to login after short delay
            setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        } else {
            this.messageService.add({ severity: 'error', summary: 'Registration Failed', detail: result.error || 'Something went wrong', life: 4000 });
        }
    }
}
