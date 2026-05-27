import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { UserService } from '@/app/features/user/services/user.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule],
    template: `
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
                            <label class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Full Name</label>
                            <input pInputText type="text" placeholder="Your full name" class="w-full md:w-120 mb-6" [(ngModel)]="fullName" />

                            <label class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText type="email" placeholder="Email address" class="w-full md:w-120 mb-6" [(ngModel)]="email" />

                            <label class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Phone</label>
                            <input pInputText type="tel" placeholder="+880 1XXX-XXXXXX" class="w-full md:w-120 mb-6" [(ngModel)]="phone" />

                            <label class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password [(ngModel)]="password" placeholder="Create a password" [toggleMask]="true" styleClass="mb-6" [fluid]="true"></p-password>

                            <div class="flex items-center mb-6">
                                <p-checkbox [(ngModel)]="agreed" id="terms" binary class="mr-2"></p-checkbox>
                                <label for="terms" class="text-sm">I agree to the <a class="text-primary no-underline cursor-pointer">Terms of Service</a> and <a class="text-primary no-underline cursor-pointer">Privacy Policy</a></label>
                            </div>

                            <p-button label="Create Account" styleClass="w-full" (onClick)="register()" [disabled]="!agreed"></p-button>

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
    private router = inject(Router);
    private userService = inject(UserService);

    fullName: string = '';
    email: string = '';
    phone: string = '';
    password: string = '';
    agreed: boolean = false;

    register() {
        this.userService.updateProfile({
            fullName: this.fullName,
            email: this.email,
            phone: this.phone
        });
        this.userService.isLoggedIn.set(true);
        this.router.navigate(['/']);
    }
}
