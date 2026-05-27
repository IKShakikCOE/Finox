import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
import { FeaturesWidget } from './components/featureswidget';
import { HighlightsWidget } from './components/highlightswidget';
import { PricingWidget } from './components/pricingwidget';
import { FooterWidget } from './components/footerwidget';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, TopbarWidget, HeroWidget, FeaturesWidget, HighlightsWidget, PricingWidget, FooterWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <topbar-widget class="py-4 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between fixed top-0 left-0 right-0 z-50 bg-surface-0/95 dark:bg-surface-900/95 backdrop-blur shadow-1" style="animation: slideDown 0.4s ease" />
                <div style="padding-top: 5rem">
                    <hero-widget />
                    <features-widget style="animation: fadeInUp 0.6s ease 0.2s both" />
                    <highlights-widget style="animation: fadeInUp 0.6s ease 0.3s both" />
                    <pricing-widget style="animation: fadeInUp 0.6s ease 0.4s both" />
                    <footer-widget />
                </div>
            </div>
        </div>
    `,
    styles: [`
        @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `]
})
export class Landing {}
