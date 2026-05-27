import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule],
    template: `
        <div class="px-6 lg:px-20 pt-12 pb-8" style="background: #1a1a2e">
            <div class="grid grid-cols-12 gap-6 mb-8">
                <div class="col-span-12 md:col-span-4">
                    <div class="flex items-center gap-2 mb-4">
                        <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8">
                            <defs>
                                <linearGradient id="finoxFooterGrad" x1="0" y1="0" x2="54" y2="40">
                                    <stop offset="0%" stop-color="#10B981" />
                                    <stop offset="100%" stop-color="#059669" />
                                </linearGradient>
                            </defs>
                            <circle cx="27" cy="20" r="18" fill="url(#finoxFooterGrad)" />
                            <path d="M20 11H34V14.5H24V19H32V22.5H24V30H20V11Z" fill="white" />
                        </svg>
                        <span class="font-bold text-xl text-white">FINOX</span>
                    </div>
                    <p class="leading-relaxed mb-4" style="color: #94a3b8">Your complete financial command center. Built for Bangladesh, designed for everyone who wants to take control of their money.</p>
                    <div class="flex gap-3">
                        <a href="#" class="flex items-center justify-center border-circle" style="width: 2.5rem; height: 2.5rem; background: rgba(255,255,255,0.1)">
                            <i class="pi pi-facebook" style="color: #94a3b8"></i>
                        </a>
                        <a href="#" class="flex items-center justify-center border-circle" style="width: 2.5rem; height: 2.5rem; background: rgba(255,255,255,0.1)">
                            <i class="pi pi-twitter" style="color: #94a3b8"></i>
                        </a>
                        <a href="#" class="flex items-center justify-center border-circle" style="width: 2.5rem; height: 2.5rem; background: rgba(255,255,255,0.1)">
                            <i class="pi pi-linkedin" style="color: #94a3b8"></i>
                        </a>
                        <a href="#" class="flex items-center justify-center border-circle" style="width: 2.5rem; height: 2.5rem; background: rgba(255,255,255,0.1)">
                            <i class="pi pi-youtube" style="color: #94a3b8"></i>
                        </a>
                    </div>
                </div>
                <div class="col-span-6 md:col-span-2">
                    <h5 class="text-white font-bold mb-4 text-sm uppercase tracking-wider">Product</h5>
                    <ul class="list-none p-0 m-0">
                        <li class="mb-3"><a routerLink="/landing" fragment="features" class="no-underline hover:text-white transition-colors" style="color: #94a3b8">Features</a></li>
                        <li class="mb-3"><a routerLink="/landing" fragment="pricing" class="no-underline hover:text-white transition-colors" style="color: #94a3b8">Pricing</a></li>
                        <li class="mb-3"><a routerLink="/auth/register" class="no-underline hover:text-white transition-colors" style="color: #94a3b8">Sign Up</a></li>
                        <li class="mb-3"><a routerLink="/auth/login" class="no-underline hover:text-white transition-colors" style="color: #94a3b8">Login</a></li>
                    </ul>
                </div>
                <div class="col-span-6 md:col-span-2">
                    <h5 class="text-white font-bold mb-4 text-sm uppercase tracking-wider">Resources</h5>
                    <ul class="list-none p-0 m-0">
                        <li class="mb-3"><a routerLink="/learn" class="no-underline hover:text-white transition-colors" style="color: #94a3b8">Blog</a></li>
                        <li class="mb-3"><a routerLink="/learn/learning" class="no-underline hover:text-white transition-colors" style="color: #94a3b8">Learning Center</a></li>
                        <li class="mb-3"><a routerLink="/learn/books" class="no-underline hover:text-white transition-colors" style="color: #94a3b8">Book Reviews</a></li>
                        <li class="mb-3"><a routerLink="/documentation" class="no-underline hover:text-white transition-colors" style="color: #94a3b8">Documentation</a></li>
                    </ul>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <h5 class="text-white font-bold mb-4 text-sm uppercase tracking-wider">Contact Us</h5>
                    <ul class="list-none p-0 m-0">
                        <li class="flex items-center gap-3 mb-3"><i class="pi pi-envelope" style="color: #10B981"></i><span style="color: #94a3b8">support&#64;finox.app</span></li>
                        <li class="flex items-center gap-3 mb-3"><i class="pi pi-phone" style="color: #10B981"></i><span style="color: #94a3b8">+880 1712-345678</span></li>
                        <li class="flex items-center gap-3 mb-3"><i class="pi pi-map-marker" style="color: #10B981"></i><span style="color: #94a3b8">Dhaka, Bangladesh</span></li>
                    </ul>
                </div>
            </div>
            <div class="pt-6 text-center" style="border-top: 1px solid rgba(255,255,255,0.1)">
                <span class="text-sm" style="color: #64748b">&copy; 2026 FinOx. All rights reserved. Made with <i class="pi pi-heart-fill" style="color: #EF4444"></i> in Bangladesh.</span>
            </div>
        </div>
    `
})
export class FooterWidget {}
