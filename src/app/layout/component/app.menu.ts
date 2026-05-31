import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '@/app/core/auth/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu {
    private authService = inject(AuthService);
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            { label: 'Home', items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/app'] }] },
            {
                label: 'Tracker',
                items: [
                    { label: 'Ledger', icon: 'pi pi-fw pi-wallet', routerLink: ['/app/tracker'] },
                    { label: 'Budgeting', icon: 'pi pi-fw pi-calculator', routerLink: ['/app/tracker/budgeting'] },
                    { label: 'Categories', icon: 'pi pi-fw pi-tags', routerLink: ['/app/tracker/categories'] },
                    { label: 'Accounts', icon: 'pi pi-fw pi-credit-card', routerLink: ['/app/tracker/accounts'] },
                    { label: 'Reports', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/app/tracker/reports'] }
                ]
            },
            {
                label: 'Bank',
                items: [
                    { label: 'Banks', icon: 'pi pi-fw pi-building', routerLink: ['/app/bank'] },
                    { label: 'Products', icon: 'pi pi-fw pi-box', routerLink: ['/app/bank/products'] },
                    { label: 'Compare', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/app/bank/compare'] }
                ]
            },
            {
                label: 'Insurance',
                items: [
                    { label: 'Companies', icon: 'pi pi-fw pi-shield', routerLink: ['/app/insurance'] },
                    { label: 'Products', icon: 'pi pi-fw pi-box', routerLink: ['/app/insurance/products'] },
                    { label: 'Compare', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/app/insurance/compare'] }
                ]
            },
            {
                label: 'Mutual Funds',
                items: [
                    { label: 'AMCs', icon: 'pi pi-fw pi-chart-line', routerLink: ['/app/mutual-funds'] },
                    { label: 'Funds', icon: 'pi pi-fw pi-box', routerLink: ['/app/mutual-funds/funds'] },
                    { label: 'Compare', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/app/mutual-funds/compare'] }
                ]
            },
            {
                label: 'Investment',
                items: [
                    { label: 'Overview', icon: 'pi pi-fw pi-megaphone', routerLink: ['/app/investment'] },
                    { label: 'Campaigns', icon: 'pi pi-fw pi-list', routerLink: ['/app/investment/campaigns'] },
                    { label: 'Compare', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/app/investment/compare'] }
                ]
            },
            { label: 'AI Advisor', items: [{ label: 'Chat', icon: 'pi pi-fw pi-sparkles', routerLink: ['/app/ai-advisor'] }] },
            {
                label: 'News & Learning',
                items: [
                    { label: 'All Articles', icon: 'pi pi-fw pi-book', routerLink: ['/app/learn'] },
                    { label: 'News', icon: 'pi pi-fw pi-megaphone', routerLink: ['/app/learn/news'] },
                    { label: 'Tips', icon: 'pi pi-fw pi-lightbulb', routerLink: ['/app/learn/tips'] },
                    { label: 'Advice', icon: 'pi pi-fw pi-comments', routerLink: ['/app/learn/advice'] },
                    { label: 'Books', icon: 'pi pi-fw pi-bookmark', routerLink: ['/app/learn/books'] },
                    { label: 'Learning', icon: 'pi pi-fw pi-graduation-cap', routerLink: ['/app/learn/learning'] }
                ]
            }
        ];

        // Only show admin section if user has admin role
        if (this.authService.isAdmin()) {
            this.model.push(
                { separator: true },
                {
                    label: 'Administration',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-fw pi-gauge', routerLink: ['/app/admin'] },
                        { label: 'Users', icon: 'pi pi-fw pi-users', routerLink: ['/app/admin/users'] },
                        { label: 'Banks', icon: 'pi pi-fw pi-building', routerLink: ['/app/admin/banks'] },
                        { label: 'Insurance', icon: 'pi pi-fw pi-shield', routerLink: ['/app/admin/insurance'] },
                        { label: 'Mutual Funds', icon: 'pi pi-fw pi-chart-line', routerLink: ['/app/admin/mutual-funds'] },
                        { label: 'News & Articles', icon: 'pi pi-fw pi-book', routerLink: ['/app/admin/news'] },
                        { label: 'Tracker Meta', icon: 'pi pi-fw pi-tags', routerLink: ['/app/admin/tracker-meta'] },
                        { label: 'Platforms', icon: 'pi pi-fw pi-megaphone', routerLink: ['/app/admin/platforms'] },
                        { label: 'Profiles', icon: 'pi pi-fw pi-id-card', routerLink: ['/app/admin/profiles'] },
                        { label: 'Audit Logs', icon: 'pi pi-fw pi-history', routerLink: ['/app/admin/audit-logs'] },
                        { label: 'Analytics', icon: 'pi pi-fw pi-chart-pie', routerLink: ['/app/admin/analytics'] },
                        { label: 'Announcements', icon: 'pi pi-fw pi-bell', routerLink: ['/app/admin/announcements'] },
                        { label: 'Seed Data', icon: 'pi pi-fw pi-database', routerLink: ['/app/admin/seed'] }
                    ]
                }
            );
        }
    }
}
