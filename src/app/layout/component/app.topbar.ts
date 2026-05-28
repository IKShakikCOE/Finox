import { Component, inject, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { Menu, MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '@/app/layout/service/layout.service';
import { AuthService } from '@/app/core/auth/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, MenuModule, BadgeModule, AppConfigurator],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/app">
                <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="finoxGradient" x1="0" y1="0" x2="54" y2="40">
                            <stop offset="0%" stop-color="#10B981" />
                            <stop offset="100%" stop-color="#059669" />
                        </linearGradient>
                    </defs>
                    <circle cx="27" cy="20" r="18" fill="url(#finoxGradient)" />
                    <circle cx="27" cy="20" r="15" stroke="rgba(255,255,255,0.18)" stroke-width="1.2" />
                    <path d="M20 11H34V14.5H24V19H32V22.5H24V30H20V11Z" fill="white" />
                    <circle cx="36" cy="12" r="2" fill="#6EE7B7" />
                </svg>
                <span style="color:#059669;font-weight:700;letter-spacing:1px;"> FINOX </span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="relative">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" routerLink="/app/calendar">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action" routerLink="/app/messages">
                        <i class="pi pi-inbox" pBadge value="3" severity="danger"></i>
                        <span>Messages</span>
                    </button>
                    <button type="button" class="layout-topbar-action" (click)="toggleProfileMenu($event)">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        </div>

        <p-menu #profileMenu [model]="profileMenuItems" [popup]="true" appendTo="body" />
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];

    @ViewChild('profileMenu') profileMenu!: Menu;

    layoutService = inject(LayoutService);
    authService = inject(AuthService);
    private router = inject(Router);

    profileMenuItems: MenuItem[] = [
        {
            label: 'My Profile',
            icon: 'pi pi-user',
            command: () => this.router.navigate(['/app/profile'])
        },
        {
            label: 'Settings',
            icon: 'pi pi-cog',
            command: () => this.router.navigate(['/app/profile/settings'])
        },
        {
            label: 'Change Password',
            icon: 'pi pi-lock',
            command: () => this.router.navigate(['/app/profile/change-password'])
        },
        { separator: true },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => this.logout()
        }
    ];

    toggleProfileMenu(event: Event) {
        this.profileMenu.toggle(event);
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    logout() {
        this.authService.logout();
    }
}
