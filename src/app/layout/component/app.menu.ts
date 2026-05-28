import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

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
                    { label: 'Products', icon: 'pi pi-fw pi-building', routerLink: ['/app/bank'] },
                    { label: 'Compare', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/app/bank/compare'] },
                    { label: 'Bank Profiles', icon: 'pi pi-fw pi-id-card', routerLink: ['/app/bank/profiles'] }
                ]
            },
            {
                label: 'Insurance',
                items: [
                    { label: 'Plans', icon: 'pi pi-fw pi-shield', routerLink: ['/app/insurance'] },
                    { label: 'Compare', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/app/insurance/compare'] },
                    { label: 'Companies', icon: 'pi pi-fw pi-id-card', routerLink: ['/app/insurance/companies'] }
                ]
            },
            {
                label: 'Mutual Funds',
                items: [
                    { label: 'Funds', icon: 'pi pi-fw pi-chart-line', routerLink: ['/app/mutual-funds'] },
                    { label: 'Compare', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/app/mutual-funds/compare'] },
                    { label: 'AMCs', icon: 'pi pi-fw pi-id-card', routerLink: ['/app/mutual-funds/amcs'] }
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
    }
}
