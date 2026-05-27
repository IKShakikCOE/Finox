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
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Tracker',
                items: [
                    { label: 'Ledger', icon: 'pi pi-fw pi-wallet', routerLink: ['/tracker'] },
                    { label: 'Budgeting', icon: 'pi pi-fw pi-calculator', routerLink: ['/tracker/budgeting'] },
                    { label: 'Categories', icon: 'pi pi-fw pi-tags', routerLink: ['/tracker/categories'] },
                    { label: 'Accounts', icon: 'pi pi-fw pi-credit-card', routerLink: ['/tracker/accounts'] },
                    { label: 'Reports', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/tracker/reports'] }
                ]
            },
            {
                label: 'Bank',
                items: [
                    { label: 'Products', icon: 'pi pi-fw pi-building', routerLink: ['/bank'] },
                    { label: 'Compare', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/bank/compare'] },
                    { label: 'Bank Profiles', icon: 'pi pi-fw pi-id-card', routerLink: ['/bank/profiles'] }
                ]
            },
            {
                label: 'Insurance',
                items: [
                    { label: 'Plans', icon: 'pi pi-fw pi-shield', routerLink: ['/insurance'] },
                    { label: 'Compare', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/insurance/compare'] },
                    { label: 'Companies', icon: 'pi pi-fw pi-id-card', routerLink: ['/insurance/companies'] }
                ]
            },
            {
                label: 'Mutual Funds',
                items: [
                    { label: 'Funds', icon: 'pi pi-fw pi-chart-line', routerLink: ['/mutual-funds'] },
                    { label: 'Compare', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/mutual-funds/compare'] },
                    { label: 'AMCs', icon: 'pi pi-fw pi-id-card', routerLink: ['/mutual-funds/amcs'] }
                ]
            },
            {
                label: 'Investment',
                items: [
                    { label: 'Overview', icon: 'pi pi-fw pi-megaphone', routerLink: ['/investment'] },
                    { label: 'Campaigns', icon: 'pi pi-fw pi-list', routerLink: ['/investment/campaigns'] },
                    { label: 'Compare', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/investment/compare'] }
                ]
            },
            {
                label: 'AI Advisor',
                items: [
                    { label: 'Chat', icon: 'pi pi-fw pi-sparkles', routerLink: ['/ai-advisor'] }
                ]
            },
            {
                label: 'News & Learning',
                items: [
                    { label: 'All Articles', icon: 'pi pi-fw pi-book', routerLink: ['/learn'] },
                    { label: 'News', icon: 'pi pi-fw pi-megaphone', routerLink: ['/learn/news'] },
                    { label: 'Tips', icon: 'pi pi-fw pi-lightbulb', routerLink: ['/learn/tips'] },
                    { label: 'Advice', icon: 'pi pi-fw pi-comments', routerLink: ['/learn/advice'] },
                    { label: 'Books', icon: 'pi pi-fw pi-bookmark', routerLink: ['/learn/books'] },
                    { label: 'Learning', icon: 'pi pi-fw pi-graduation-cap', routerLink: ['/learn/learning'] }
                ]
            }
        ];
    }
}
