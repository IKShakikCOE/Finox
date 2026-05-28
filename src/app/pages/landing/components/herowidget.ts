import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'hero-widget',
    imports: [RouterModule, ButtonModule, RippleModule],
    template: `
        <div id="hero" class="flex flex-col pt-6 px-6 lg:px-20 overflow-hidden relative" style="min-height: 85vh; background: linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 30%, #eff6ff 70%, #f5f3ff 100%)">
            <!-- Decorative blobs -->
            <div class="absolute top-0 right-0 w-96 h-96 opacity-20" style="background: radial-gradient(circle, #10B981 0%, transparent 70%); filter: blur(80px)"></div>
            <div class="absolute bottom-0 left-0 w-80 h-80 opacity-15" style="background: radial-gradient(circle, #3B82F6 0%, transparent 70%); filter: blur(60px)"></div>

            <div class="mx-6 md:mx-20 mt-12 md:mt-20 relative z-10">
                <div class="inline-flex items-center gap-2 px-4 py-2 mb-6 border-round-3xl" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3)">
                    <i class="pi pi-sparkles text-green-600"></i>
                    <span class="text-green-700 font-semibold text-sm">AI-Powered Financial Platform for Bangladesh</span>
                </div>

                <h1 class="text-5xl md:text-7xl font-bold leading-tight mb-6" style="color: #1a1a2e">
                    Take Control of<br/>
                    <span style="background: linear-gradient(135deg, #10B981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent">Your Money</span>
                </h1>

                <p class="text-xl md:text-2xl leading-relaxed mb-8 max-w-3xl" style="color: #4a5568">
                    Track expenses, compare bank products, manage investments, and get AI-powered advice — all in one platform built for Bangladesh.
                </p>

                <div class="flex flex-wrap gap-4 mb-10">
                    <button pButton pRipple type="button" label="Start Free" icon="pi pi-arrow-right" iconPos="right" routerLink="/auth/register" class="text-lg! px-6! py-3!" style="background: linear-gradient(135deg, #10B981, #059669); border: none; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4)"></button>
                    <button pButton pRipple type="button" label="See How It Works" icon="pi pi-play-circle" routerLink="/auth/login" class="text-lg! px-6! py-3!" severity="secondary" [outlined]="true"></button>
                </div>

                <div class="flex flex-wrap items-center gap-8 mb-12">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-green-500 text-lg"></i>
                        <span class="text-surface-700 font-medium">Free Forever Plan</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-green-500 text-lg"></i>
                        <span class="text-surface-700 font-medium">No Credit Card Required</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-green-500 text-lg"></i>
                        <span class="text-surface-700 font-medium">50+ BD Banks & Institutions</span>
                    </div>
                </div>
            </div>

            <!-- Stats bar -->
            <div class="mx-6 md:mx-20 mb-12 relative z-10">
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6 md:col-span-3">
                        <div class="text-center p-5 border-round-xl" style="background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.05)">
                            <i class="pi pi-wallet text-3xl mb-2 block" style="color: #10B981"></i>
                            <span class="text-3xl font-bold block" style="color: #1a1a2e">৳1.2M+</span>
                            <span class="text-sm" style="color: #6b7280">Tracked Monthly</span>
                        </div>
                    </div>
                    <div class="col-span-6 md:col-span-3">
                        <div class="text-center p-5 border-round-xl" style="background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.05)">
                            <i class="pi pi-building text-3xl mb-2 block" style="color: #3B82F6"></i>
                            <span class="text-3xl font-bold block" style="color: #1a1a2e">50+</span>
                            <span class="text-sm" style="color: #6b7280">Banks & Institutions</span>
                        </div>
                    </div>
                    <div class="col-span-6 md:col-span-3">
                        <div class="text-center p-5 border-round-xl" style="background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.05)">
                            <i class="pi pi-users text-3xl mb-2 block" style="color: #8B5CF6"></i>
                            <span class="text-3xl font-bold block" style="color: #1a1a2e">10K+</span>
                            <span class="text-sm" style="color: #6b7280">Active Users</span>
                        </div>
                    </div>
                    <div class="col-span-6 md:col-span-3">
                        <div class="text-center p-5 border-round-xl" style="background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.05)">
                            <i class="pi pi-star-fill text-3xl mb-2 block" style="color: #F59E0B"></i>
                            <span class="text-3xl font-bold block" style="color: #1a1a2e">4.8/5</span>
                            <span class="text-sm" style="color: #6b7280">User Rating</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class HeroWidget {}
