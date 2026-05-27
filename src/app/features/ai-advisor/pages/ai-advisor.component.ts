import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AdvisorService } from '../services/advisor.service';
import { TrackerService } from '../../tracker/services/tracker.service';
import { InvestmentService } from '../../investment/services/investment.service';

@Component({
    selector: 'fx-ai-advisor',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center bg-purple-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-sparkles text-purple-500 text-lg"></i>
                    </div>
                    <div>
                        <h4 class="m-0">AI Financial Advisor</h4>
                        <span class="text-sm text-muted-color">Powered by your financial data</span>
                    </div>
                </div>
                <p-button label="Clear Chat" icon="pi pi-trash" severity="secondary" [outlined]="true" size="small" (onClick)="clearChat()" [disabled]="advisorService.messages().length === 0" />
            </div>

            <!-- Quick Prompts -->
            <div class="flex flex-wrap gap-2 mb-4" *ngIf="advisorService.messages().length === 0">
                <button
                    *ngFor="let prompt of advisorService.quickPrompts"
                    pButton
                    [label]="prompt.label"
                    [icon]="prompt.icon"
                    class="p-button-outlined p-button-secondary p-button-sm"
                    (click)="sendQuickPrompt(prompt.prompt)"
                ></button>
            </div>

            <!-- Chat Messages -->
            <div #chatContainer class="flex flex-col gap-4 mb-4 overflow-y-auto" style="max-height: 60vh; min-height: 300px">
                <div *ngIf="advisorService.messages().length === 0" class="flex flex-col items-center justify-center h-full text-center p-6">
                    <i class="pi pi-comments text-5xl text-muted-color mb-4"></i>
                    <h5 class="text-muted-color">Ask me anything about your finances</h5>
                    <p class="text-sm text-muted-color">I analyze your tracker data and investment campaigns to give personalized advice.</p>
                </div>

                <div *ngFor="let msg of advisorService.messages()" class="flex" [class.justify-end]="msg.role === 'user'" [class.justify-start]="msg.role === 'assistant'">
                    <div
                        class="p-3 border-round max-w-3/4"
                        [class.bg-primary]="msg.role === 'user'"
                        [class.text-white]="msg.role === 'user'"
                        [class.surface-ground]="msg.role === 'assistant'"
                        style="max-width: 75%; white-space: pre-wrap; line-height: 1.6"
                    >
                        <div class="flex items-center gap-2 mb-2" *ngIf="msg.role === 'assistant'">
                            <i class="pi pi-sparkles text-purple-500 text-sm"></i>
                            <span class="text-xs font-semibold text-purple-500">AI Advisor</span>
                        </div>
                        {{ msg.content }}
                        <div class="text-xs mt-2 opacity-70">
                            {{ msg.timestamp | date: 'HH:mm' }}
                        </div>
                    </div>
                </div>

                <!-- Loading indicator -->
                <div *ngIf="advisorService.isLoading()" class="flex justify-start">
                    <div class="p-3 surface-ground border-round">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-spin pi-spinner text-purple-500"></i>
                            <span class="text-sm text-muted-color">Analyzing your data...</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick prompts below chat when messages exist -->
            <div class="flex flex-wrap gap-2 mb-3" *ngIf="advisorService.messages().length > 0">
                <button
                    *ngFor="let prompt of advisorService.quickPrompts"
                    pButton
                    [label]="prompt.label"
                    [icon]="prompt.icon"
                    class="p-button-text p-button-sm"
                    (click)="sendQuickPrompt(prompt.prompt)"
                    [disabled]="advisorService.isLoading()"
                ></button>
            </div>

            <!-- Input -->
            <div class="flex items-center gap-3">
                <input
                    pInputText
                    type="text"
                    [(ngModel)]="userInput"
                    placeholder="Ask about your spending, investments, budget..."
                    class="flex-1"
                    (keyup.enter)="sendMessage()"
                    [disabled]="advisorService.isLoading()"
                    fluid
                />
                <p-button icon="pi pi-send" (onClick)="sendMessage()" [disabled]="!userInput.trim() || advisorService.isLoading()" />
            </div>
        </div>
    `
})
export class AiAdvisorComponent implements OnInit {
    public advisorService = inject(AdvisorService);
    private trackerService = inject(TrackerService);
    private investmentService = inject(InvestmentService);

    @ViewChild('chatContainer') chatContainer!: ElementRef;

    userInput: string = '';

    ngOnInit() {
        // Ensure data is loaded for AI context
        if (!this.trackerService.transactions().length) {
            this.trackerService.loadTrackerMetaData();
        }
        if (!this.investmentService.campaigns().length) {
            this.investmentService.loadData();
        }
    }

    async sendMessage() {
        if (!this.userInput.trim() || this.advisorService.isLoading()) return;
        const message = this.userInput;
        this.userInput = '';
        await this.advisorService.sendMessage(message);
        this.scrollToBottom();
    }

    async sendQuickPrompt(prompt: string) {
        if (this.advisorService.isLoading()) return;
        await this.advisorService.sendMessage(prompt);
        this.scrollToBottom();
    }

    clearChat() {
        this.advisorService.clearChat();
    }

    private scrollToBottom() {
        setTimeout(() => {
            if (this.chatContainer) {
                this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
            }
        }, 100);
    }
}
