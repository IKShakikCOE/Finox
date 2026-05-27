import { Component } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'topbar-widget',
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule],
    template: `
        <a class="flex items-center gap-2" routerLink="/landing">
            <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-10">
                <defs>
                    <linearGradient id="finoxLandingGrad" x1="0" y1="0" x2="54" y2="40">
                        <stop offset="0%" stop-color="#10B981" />
                        <stop offset="100%" stop-color="#059669" />
                    </linearGradient>
                </defs>
                <circle cx="27" cy="20" r="18" fill="url(#finoxLandingGrad)" />
                <circle cx="27" cy="20" r="15" stroke="rgba(255,255,255,0.18)" stroke-width="1.2" />
                <path d="M20 11H34V14.5H24V19H32V22.5H24V30H20V11Z" fill="white" />
                <circle cx="36" cy="12" r="2" fill="#6EE7B7" />
            </svg>
            <span class="text-surface-900 dark:text-surface-0 font-bold text-2xl tracking-wider">FINOX</span>
        </a>

        <a pButton [text]="true" severity="secondary" [rounded]="true" pRipple class="lg:hidden!" pStyleClass="@next" enterFromClass="hidden" leaveToClass="hidden" [hideOnOutsideClick]="true">
            <i class="pi pi-bars text-2xl!"></i>
        </a>

        <div class="items-center bg-surface-0/80 dark:bg-surface-900/80 backdrop-blur grow justify-between hidden lg:flex absolute lg:static w-full left-0 top-full px-12 lg:px-0 lg:ml-12 z-20 rounded-border">
            <ul class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-10">
                <li>
                    <a (click)="scrollTo('hero')" pRipple class="px-0 py-4 text-surface-700 dark:text-surface-200 hover:text-primary font-medium text-lg transition-colors">Home</a>
                </li>
                <li>
                    <a (click)="scrollTo('features')" pRipple class="px-0 py-4 text-surface-700 dark:text-surface-200 hover:text-primary font-medium text-lg transition-colors">Features</a>
                </li>
                <li>
                    <a (click)="scrollTo('highlights')" pRipple class="px-0 py-4 text-surface-700 dark:text-surface-200 hover:text-primary font-medium text-lg transition-colors">Why FinOx</a>
                </li>
                <li>
                    <a (click)="scrollTo('pricing')" pRipple class="px-0 py-4 text-surface-700 dark:text-surface-200 hover:text-primary font-medium text-lg transition-colors">Pricing</a>
                </li>
            </ul>
            <div class="flex border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0 gap-3">
                <button pButton pRipple label="Login" routerLink="/auth/login" [rounded]="true" severity="secondary" [outlined]="true"></button>
                <button pButton pRipple label="Get Started" routerLink="/auth/register" [rounded]="true" style="background: linear-gradient(135deg, #10B981, #059669); border: none"></button>
            </div>
        </div>
    `
})
export class TopbarWidget {
    constructor(public router: Router) {}

    scrollTo(elementId: string) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}
