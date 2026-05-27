import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'hero-widget',
    imports: [RouterModule, ButtonModule, RippleModule],
    template: `
        <div
            id="hero"
            class="flex flex-col pt-6 px-6 lg:px-20 overflow-hidden"
            style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.1) 100%); clip-path: ellipse(150% 87% at 93% 13%)"
        >
            <div class="mx-6 md:mx-20 mt-0 md:mt-12">
                <h1 class="text-6xl font-bold text-gray-900 leading-tight dark:text-surface-0">
                    <span class="font-light block">Your Complete</span>
                    Financial Command Center
                </h1>
                <p class="font-normal text-2xl leading-normal md:mt-4 text-gray-700 dark:text-surface-200">
                    Track expenses, compare bank products, manage investments, and get AI-powered financial advice — all in one platform built for Bangladesh.
                </p>
                <div class="flex gap-3 mt-8">
                    <button pButton pRipple [rounded]="true" type="button" label="Get Started Free" class="text-xl! px-6!" routerLink="/auth/register"></button>
                    <button pButton pRipple [rounded]="true" [outlined]="true" type="button" label="Watch Demo" icon="pi pi-play" class="text-xl! px-6!" routerLink="/auth/login"></button>
                </div>

                <div class="flex items-center gap-6 mt-8 mb-8">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-green-500"></i>
                        <span class="text-gray-600 dark:text-surface-300">Free Forever Plan</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-green-500"></i>
                        <span class="text-gray-600 dark:text-surface-300">No Credit Card</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-green-500"></i>
                        <span class="text-gray-600 dark:text-surface-300">BD Banks & Insurance</span>
                    </div>
                </div>
            </div>
            <div class="flex justify-center md:justify-end mt-4">
                <div class="grid grid-cols-3 gap-4 p-6 w-full md:w-8/12">
                    <div class="text-center p-4 surface-card border-round shadow-1">
                        <i class="pi pi-wallet text-3xl text-green-500 mb-2 block"></i>
                        <span class="text-2xl font-bold block">৳1.2M+</span>
                        <span class="text-sm text-muted-color">Tracked Monthly</span>
                    </div>
                    <div class="text-center p-4 surface-card border-round shadow-1">
                        <i class="pi pi-building text-3xl text-blue-500 mb-2 block"></i>
                        <span class="text-2xl font-bold block">50+</span>
                        <span class="text-sm text-muted-color">Banks & Institutions</span>
                    </div>
                    <div class="text-center p-4 surface-card border-round shadow-1">
                        <i class="pi pi-users text-3xl text-purple-500 mb-2 block"></i>
                        <span class="text-2xl font-bold block">10K+</span>
                        <span class="text-sm text-muted-color">Active Users</span>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class HeroWidget {}
